import { exportUploads } from "@/app/functions/export-uploads";
import { getUploadImage } from "@/app/functions/get-upload";
import { uploadImage } from "@/app/functions/upload-image";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { isRight, unwrapEither } from "@/infra/shared/either";
import type { FastifyInstance } from "fastify";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const exportUploadRoutes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
    app.post("/export", {
        schema: {
            summary: "Export upload an image",
            tags: ["uploads"],
            querystring: z.object({
                searchQuery: z.string().optional(),

            }),
            response: {
                200: z.object({ reportUrl: z.string() }),

            },
        }
    }, async (req, reply) => {
        const {searchQuery} = req.query as {
            searchQuery?: string;
        };
        
        const result = await exportUploads({searchQuery})

        const {reportUrl} = unwrapEither(result);

        return reply.status(200).send({reportUrl});
    });
}

