import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { serializerCompiler, validatorCompiler, hasZodFastifySchemaValidationErrors, jsonSchemaTransform } from "fastify-type-provider-zod";
import { uploadImageRoutes } from "./routes/upload-image";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { transformSwaggerSchema } from "./routes/transform-swagger-schema";
import { getUploadImageRoutes } from "./routes/get-upload";
import { exportUploadRoutes } from "./routes/export-upload";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: "Validation error",
            issues: error.validation,
        });
    }

    console.error(error);
    return reply.status(500).send({
        message: "Internal server error",
    });
});


server.register(fastifyCors, {
    origin: "*",
})

server.register(fastifyMultipart)
server.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Upload Server",
            version: "1.0.0",
        }
    },
    transform: transformSwaggerSchema,
});
server.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

server.register(uploadImageRoutes)
server.register(getUploadImageRoutes)
server.register(exportUploadRoutes)

server.listen({ port: 3333, host: "0.0.0.0"}).then(() => {
    console.log("Server is running on http://localhost:3333");
})
