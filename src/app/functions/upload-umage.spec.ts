import { beforeAll, describe, expect, it, vi } from "vitest";
import { uploadImage } from "./upload-image";
import { Readable } from "node:stream";
import { isLeft, isRight, unwrapEither } from "@/infra/shared/either";
import { randomUUID } from "node:crypto";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { eq } from "drizzle-orm";
import { InvalidFileFormat } from "./erros/invalid-file-format";

describe("upload image", () =>{
    beforeAll(() => {
        vi.mock('@/infra/storage/upload-file-to-storage', () => {
            return {
                uploadFileToStorage: vi.fn().mockImplementation(() =>{
                    return {
                        key: `${randomUUID()}.jpg`,
                        url: 'https://storage.com/image.jpg'
                    }
                })
            }
        })
    })
    it('should be able to upload an image', async () => {
        const fileName = `${randomUUID()}.pdf`
        const sut = await uploadImage({
            filename: fileName,
            contentType: 'image/jpeg',
            contentStream: Readable.from(['dummy content']) // conteúdo para não quebrar
        })
    
        console.log(sut) // debug
        expect(isRight(sut)).toBe(true)

        const result = await db.select().from(schema.uploads).where(eq(schema.uploads.name, fileName))

        expect(result).toHaveLength(1)
    })
    it('should not be able to upload an invalid file', async () => {
        const fileName = `${randomUUID()}.pdf`
        const sut = await uploadImage({
            filename: fileName,
            contentType: 'document/pdf',
            contentStream: Readable.from(['dummy content']) // conteúdo para não quebrar
        })
    
        //console.log(sut) // debug
        expect(isLeft(sut)).toBe(true)

        expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
    })
    
})
