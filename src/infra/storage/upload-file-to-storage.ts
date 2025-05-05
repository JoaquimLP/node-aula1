import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import { z } from "zod";
import { env } from "../env";
import { r2 } from "./client";
import { URL } from "node:url";

const uploadFileToStorageInput = z.object({
    folder: z.enum(["images", "downloads"]),
    filename: z.string(),
    contentType: z.string(),
    contentStream: z.instanceof(Readable),
});

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
    const { folder, filename, contentType, contentStream } = uploadFileToStorageInput.parse(arguments[0]);

    const fileExtension = extname(filename);
    const fileNameWithoutExtension = basename(filename);
    const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9-_]/g, "");
    const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension);
    const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`;


    const upload = new Upload({
        client: r2,
        params: {
            Bucket: env.CLOUDFLARE_BUCKET_NAME,
            Key: uniqueFileName,
            Body: contentStream,
            ContentType: contentType,
        },
    });

    await upload.done();

    return {
        key: uniqueFileName,
        url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
    };
}