import { getUploadImage } from "@/app/functions/get-upload";
import { uploadImage } from "@/app/functions/upload-image";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { isRight, unwrapEither } from "@/infra/shared/either";
import type { FastifyInstance } from "fastify";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getUploadImageRoutes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
    app.get("/upload", {
        schema: {
            summary: "Get upload an image",
            tags: ["uploads"],
            querystring: z.object({
                searchQuery: z.string().optional(),
                sortBy: z.enum(['createdAt']).optional(),
                sortDirection: z.enum(['asc', 'desc']).optional(),
                page: z.coerce.number().default(1).optional(),
                pageSize: z.coerce.number().default(20).optional(),
            }),
            response: {
                200: z.object({ uploads: z.array(
                    z.object({
                        id: z.string(), 
                        name: z.string(), 
                        remoteKey: z.string(), 
                        remoteUrl: z.string(), 
                        createdAt: z.date()
                    })), 
                    total: z.number() 
                }),

            },
        }
    }, async (req, reply) => {
        const {searchQuery, sortBy, sortDirection, page, pageSize} = req.query as {
            searchQuery?: string;
            sortBy?: 'createdAt';
            sortDirection?: 'asc' | 'desc';
            page?: number;
            pageSize?: number;
        };
        
        const result = await getUploadImage({searchQuery, sortBy, sortDirection, page, pageSize})

        const {uploads, total} = unwrapEither(result);

        return reply.status(200).send({uploads, total});
    });
}

