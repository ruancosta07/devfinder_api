import Fastify from "fastify";
import userRoutes from "./routes/user";
import jobRoutes from "./routes/job";
const fastify = Fastify();
const PORT = process.env.PORT || 3000;


fastify.register(userRoutes)
fastify.register(jobRoutes)

try {
  fastify.listen(
    {
      port: PORT,
    },
    (err) => {
      if (err) {
        return console.error(err);
      }
      return console.log(`Server is running at ${PORT} port`);
    }
  );
} catch (err) {
  console.log(err);
}
