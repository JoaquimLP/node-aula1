import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { makeUpload } from "./test/factories/make-upload";
import * as uploadFileToStorage from "@/infra/storage/upload-file-to-storage"
import { exportUploads } from "./export-uploads";
import { isRight, unwrapEither } from "@/infra/shared/either";
describe("Export uploads", () =>{

    it('should export uploads', async () => {
        const uploadSpy = vi.spyOn(uploadFileToStorage, 'uploadFileToStorage').mockImplementation(async () => {
            return {
                key: `${randomUUID()}.jpg`,
                url: 'https://storage.com/image.jpg'
            }
        })


        const namePattern = randomUUID() + ".jpg";

        const upload = await makeUpload({ name: namePattern });
        const upload2 = await makeUpload({ name: namePattern });
        const upload3 = await makeUpload({ name: namePattern });
        const upload4 = await makeUpload({ name: namePattern });
        const upload5 = await makeUpload({ name: namePattern });
        
        const sut = await exportUploads({
            searchQuery: namePattern,
        })

        const generateCsvStream = uploadSpy.mock.calls[0][0].contentStream;
        const csvAsString = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = [];

            generateCsvStream.on('data', (chunk) => {
                chunks.push(chunk);
            })

            generateCsvStream.on('end', () => {
                resolve(Buffer.concat(chunks).toString('utf-8'));
            })  

            generateCsvStream.on('error', (error) => {
                reject(error);
            })
        })

        const csvArray = csvAsString
        .split('\n')
        .filter(line => line.trim() !== '') // ← remove linhas vazias
        .map(line => line.split(';'));
      

        console.log(csvArray)
        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut)).toEqual({
            reportUrl: "https://storage.com/image.jpg"
        })
        expect(csvArray).toEqual([
            ['ID', 'Name', 'URL', 'Uploaded At'],
            [upload.id, upload.name, upload.remoteUrl, expect.any(String)],
            [upload2.id, upload2.name, upload2.remoteUrl, expect.any(String)],
            [upload3.id, upload3.name, upload3.remoteUrl, expect.any(String)],
            [upload4.id, upload4.name, upload4.remoteUrl, expect.any(String)],
            [upload5.id, upload5.name, upload5.remoteUrl, expect.any(String)],
          ])
          
    }) 
})
