import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { Either, makeLeft, makeRight } from "@/infra/shared/either";
import { z } from "zod";
import { asc, count, desc, ilike } from "drizzle-orm";

const getUpload = z.object({
    searchQuery: z.string().optional(),
    sortBy: z.enum(['createdAt']).optional(),
    sortDirection: z.enum(['asc', 'desc']).optional(),
    page: z.number().default(1).optional(),
    pageSize: z.number().default(20).optional(),    
})

type UploadImageSchema = z.infer<typeof getUpload>;

type GetUpload = {
    uploads: {
        id: string,
        name: string,
        remoteKey: string,
        remoteUrl: string,
        createdAt: Date,
    }[],
    total: number
}

export async function getUploadImage(input: UploadImageSchema): Promise<Either<never, GetUpload>> {
    const { page, pageSize, searchQuery, sortBy, sortDirection } = getUpload.parse(input);

    const [uploads, [{total}]] = await Promise.all([
        db.select({
            id: schema.uploads.id,
            name: schema.uploads.name,
            remoteKey: schema.uploads.remoteKey,
            remoteUrl: schema.uploads.remoteUrl,
            createdAt: schema.uploads.createdAt,
        }).from(schema.uploads).where(
            searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
        ).orderBy(fields => {
            if (sortBy && sortDirection == "asc") {
                return asc(fields[sortBy])
            }
            if (sortBy && sortDirection == "desc") {
                return desc(fields[sortBy])
            }
    
            return asc(fields.id)
        }).offset(((page ?? 1) - 1) * (pageSize ?? 20)),

        db.select({total: count(schema.uploads.id)}).from(schema.uploads).where(
            searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
        )
    ])

    return makeRight({uploads, total});
}


