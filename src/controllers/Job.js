import Joi from "joi";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

const jobSelect = {
    title: true,
          type: true,
          content: true,
          createdAt: true,
          enterprise: true,
          salary: true,
          location: true,
          id: true,
}

/**
 * @typedef {import("fastify").FastifyRequest} Req
 * @typedef {import("fastify").FastifyReply} Res
 */

/**
 * @type {{
 * getJobs: (req:Req, res:Res)=> Promise<void>
 * getJobById: (req:Req, res:Res)=> Promise<void>
 * createJob: (req:Req, res:Res)=> Promise<void>
 * editJob: (req:Req, res:Res)=> Promise<void>
 * }}
 */



const JobController = {
    
  getJobs: async (req, res) => {
    try {
      const jobs = await prisma.jobs.findMany({
        select: {
          ...jobSelect
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).send(jobs);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Erro ao carregar vagas" });
    }
  },
  createJob: async (req, res) => {
    try {
      const [, token] = req.headers.authorization.split(" ");
      const decodedToken = jwt.decode(token, process.env.JWT_KEY);
      const foundUser = await prisma.users.findUnique({
        where: { id: decodedToken.id },
      });
      const { title, salary, content, enterprise, type, location } = req.body;
      const jobSchema = Joi.object({
        title: Joi.string().required(),
        salary: Joi.number().required(),
        content: Joi.string().required(),
        enterprise: Joi.string().required(),
        type: Joi.string().required(),
        location: Joi.string().required(),
      });
      const { error } = jobSchema.validate({
        title,
        salary,
        content,
        enterprise,
        type,
        location,
      });
      if (error) {
        const missingFields = error.details.map((d) => d.context.key).join(",");
        return res.status(400).send({
          message: `Os seguintes campos estão faltando: ${missingFields}`,
        });
      }
      const newJob = await prisma.jobs.create({
        data: {
          title,
          salary,
          content,
          enterprise,
          type,
          location,
          userId: foundUser.id,
        },
      });
      return res
        .status(201)
        .send({ message: "Vaga criada com sucesso", ...newJob });
    } catch (err) {
      console.log(err);
    }
  },
  editJob: async (req, res) => {
    try {
      const [, token] = req.headers.authorization.split(" ");
      const decodedToken = jwt.decode(token, process.env.JWT_KEY);
      const foundUser = await prisma.users.findUnique({
        where: { id: decodedToken.id },
      });
      const { title, salary, content, enterprise, type, location } = req.body;
      const jobSchema = Joi.object({
        title: Joi.string().required(),
        salary: Joi.number().required(),
        content: Joi.string().required(),
        enterprise: Joi.string().required(),
        type: Joi.string().required(),
        location: Joi.string().required(),
      });
      const { error } = jobSchema.validate({
        title,
        salary,
        content,
        enterprise,
        type,
        location,
      });
      if (error) {
        const missingFields = error.details.map((d) => d.context.key).join(",");
        return res.status(400).send({
          message: `Os seguintes campos estão faltando: ${missingFields}`,
        });
      }
      const newJob = await prisma.jobs.create({
        data: {
          title,
          salary,
          content,
          enterprise,
          type,
          location,
          userId: foundUser.id,
        },
      });
      return res
        .status(201)
        .send({ message: "Vaga criada com sucesso", ...newJob });
    } catch (err) {
      console.log(err);
    }
  },
  getJobById: async(req, res)=> {
    try{
        const {id} = req.params
        const job = await prisma.jobs.findUnique({where:{id}, select: {
            ...jobSelect
        }})
        return res.status(200).send(job)
    }
    catch(err){
        console.log(err)
        return res.status(500).send({message: "Erro ao carregar vaga"})
    }
  }
};

export default JobController;
