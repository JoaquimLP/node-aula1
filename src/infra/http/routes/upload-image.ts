import { uploadImage } from "@/app/functions/upload-image";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { isRight, unwrapEither } from "@/infra/shared/either";
import type { FastifyInstance } from "fastify";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const uploadImageRoutes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
    app.post("/upload", {
        schema: {
            summary: "Upload an image",
            tags: ["uploads"],
            consumes: ["multipart/form-data"],
    
            response: {
                201: z.object({ url: z.string() }),
                409: z.object({ message: z.string() }).describe("Upload already exists"),

            },
        }
    }, async (req, reply) => {
        const uploadFile = await req.file({
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            }
        });

        if (!uploadFile) {
            return reply.status(400).send({
                message: "File is required",
            });
        }

        const result = await uploadImage({
            filename: uploadFile.filename,
            contentType: uploadFile.mimetype,
            contentStream: uploadFile.file,
        }); 

        if (uploadFile.file.truncated) {
            return reply.status(200).send({
                message: 'File size limit reached.'
            })
        }

        
        if(isRight(result)) {
            console.log(unwrapEither(result));
            return reply.status(201).send({url: unwrapEither(result).url});
        }

        const error = unwrapEither(result);

        switch (error.constructor.name) {
            case "InvalidFileFormat":
                return reply.status(400).send({message: error.message});
        }
    });
}

