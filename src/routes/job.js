import JobController from "../controllers/Job";

/**
 * @param {import("fastify").FastifyInstance} fastify
 */

export default async function jobRoutes(fastify){
    fastify.get("/vagas", JobController.getJobs)
    fastify.get("/vaga/:id", JobController.getJobById)
    fastify.post("/criar-vaga", JobController.createJob)
    fastify.put("/editar-vaga/:id", JobController.editJob)
}