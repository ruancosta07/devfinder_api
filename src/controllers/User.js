import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import Joi from "joi";
/**
 * @typedef {import("fastify").FastifyRequest} Req
 * @typedef {import("fastify").FastifyReply} Res
 */

/**
 * @type {{
 *   createAccount: (req:Req, res:Res)=> Promise<void>
 *   login: (req:Req, res:Res)=> Promise<void>
 *   createJob: (req:Req, res:Res)=> Promise<void>
 * }}
 */

const UserController = {
  createAccount: async (req, res) => {
    try {
      const { email, password, role, name } = req.body;
      const userSchema = Joi.object({
        email: Joi.string().email({ tlds: false }).required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        name: Joi.string().required().min(4),
      });
      const userExists = await prisma.users.findFirst({ where: { email } });
      if (userExists) {
        return res.status(400).send({ message: "Email já cadastrado" });
      }
      const { error } = userSchema.validate(
        { email, password, role, name },
        { abortEarly: false }
      );
      if (error) {
        const missingFields = error.details.map((d) => d.context.key);
        return res.status(400).send({
          message: `Os seguintes campos estão faltando: ${missingFields.join(
            ","
          )}`,
        });
      }
      const hashedPassword = await Bun.password.hash(password);
      const newUser = await prisma.users.create({
        data: {
          email,
          role,
          name,
          password: hashedPassword,
        },
      });
      const token = jwt.sign(
        {
          id: newUser.id,
          role: newUser.role,
          name: newUser.name,
          email: newUser.email,
        },
        process.env.JWT_KEY,
        { algorithm: "HS512", expiresIn: "7d" }
      );
      return res.status(500).send({
        message: "Usuário criado com sucesso",
        user: {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          id: newUser.id,
        },
        token,
      });
    } catch (err) {
      console.log(err);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const foundUser = await prisma.users.findFirst({ where: { email } });
      if (!foundUser) {
        return res.status(400).send({ message: "Email ou senha incorretos" });
      }
      const passwordMatch = await Bun.password.verify(
        password,
        foundUser.password
      );
      if (!passwordMatch) {
        return res.status(400).send({ message: "Email ou senha incorretos" });
      }
      const token = jwt.sign(
        {
          id: foundUser.id,
          role: foundUser.role,
          name: foundUser.name,
          email: foundUser.email,
        },
        process.env.JWT_KEY,
        { algorithm: "HS512", expiresIn: "7d" }
      );
      return res.status(200).send({
        message: "Login realizado com sucesso",
        token,
        user: {
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          id: foundUser.id,
        },
      });
    } catch (err) {
      console.err(err);
      return res.status(500).send({ message: "Erro interno do servidor" });
    }
  },
};

export default UserController;
