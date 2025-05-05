import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { Either, makeLeft, makeRight } from "@/infra/shared/either";
import { Readable } from "node:stream";
import { z } from "zod";
import { InvalidFileFormat } from "./erros/invalid-file-format";
import { promises } from "node:dns";
import { uploadFileToStorage } from "@/infra/storage/upload-file-to-storage";

const uploadImageInput = z.object({
    filename: z.string(),
    contentType: z.string(),
    contentStream: z.instanceof(Readable),
})

export type UploadImageSchema = z.infer<typeof uploadImageInput>;

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(input: UploadImageSchema): Promise<Either<InvalidFileFormat, {url: string}>> {
    const { filename, contentType, contentStream } = uploadImageInput.parse(input);

    if (!allowedContentTypes.includes(contentType)) {
        return makeLeft(new InvalidFileFormat());
    }

    const {key, url} = await uploadFileToStorage({
        folder: "images",
        filename,
        contentType,
        contentStream
    });

    await db.insert(schema.uploads).values({
        name: filename,
        remoteKey: key,
        remoteUrl: url,
    })

    return makeRight({url: url});
}


