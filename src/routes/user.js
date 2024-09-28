import UserController from "../controllers/User";
/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 */
export default async function userRoutes(fastify){
    fastify.post("/criar-conta", UserController.createAccount)
    fastify.post("/login", UserController.login)
}