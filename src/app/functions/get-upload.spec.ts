import { beforeAll, describe, expect, it, vi } from "vitest";
import { isLeft, isRight, unwrapEither } from "@/infra/shared/either";
import { randomUUID } from "node:crypto";
import { getUploadImage } from "./get-upload";
import { makeUpload } from "./test/factories/make-upload";
import dayjs from "dayjs";

describe("Get upload", () =>{
    it('should be able to get upload an image', async () => {
        const namePattern = randomUUID() + ".jpg";

        const upload = await makeUpload({ name: namePattern });
        const upload2 = await makeUpload({ name: namePattern });
        const upload3 = await makeUpload({ name: namePattern });
        const upload4 = await makeUpload({ name: namePattern });
        const upload5 = await makeUpload({ name: namePattern });
        
        const sut = await getUploadImage({
            searchQuery: namePattern,
            sortBy: "createdAt",
            sortDirection: "asc",
            page: 1,
            pageSize: 10,
        })
        
        console.log(unwrapEither(sut).total)
        expect(isRight(sut)).toBe(true);
        expect(unwrapEither(sut).total).toEqual(5);
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({id: upload.id}),
            expect.objectContaining({id: upload2.id}),
            expect.objectContaining({id: upload3.id}),
            expect.objectContaining({id: upload4.id}),
            expect.objectContaining({id: upload5.id}),
        ]);
    })       

    it('should be able sort by createdAt', async () => {
        const namePattern = randomUUID() + ".jpg";

        const upload = await makeUpload({ 
            name: namePattern,
            createdAt: new Date(),
        });
        const upload2 = await makeUpload({ 
            name: namePattern,
            createdAt: dayjs().subtract(1, "day").toDate(),
        });
        const upload3 = await makeUpload({ 
            name: namePattern,
            createdAt: dayjs().subtract(2, "day").toDate(),
        });
        const upload4 = await makeUpload({ 
            name: namePattern,
            createdAt: dayjs().subtract(3, "day").toDate(),
        });
        const upload5 = await makeUpload({ 
            name: namePattern,
            createdAt: dayjs().subtract(4, "day").toDate(),
        });
        
        const sut = await getUploadImage({
            searchQuery: namePattern,
            sortBy: "createdAt",
            sortDirection: "desc",
            page: 1,
            pageSize: 10,
        })
        
        console.log(unwrapEither(sut).total)
        expect(isRight(sut)).toBe(true);
        expect(unwrapEither(sut).total).toEqual(5);
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({id: upload.id}),
            expect.objectContaining({id: upload2.id}),
            expect.objectContaining({id: upload3.id}),
            expect.objectContaining({id: upload4.id}),
            expect.objectContaining({id: upload5.id}),
        ]);
    })    

    it('should use default values when page and pageSize are not provided', async () => {
        const namePattern = randomUUID() + ".jpg";

        const upload = await makeUpload({ name: namePattern });
        const upload2 = await makeUpload({ name: namePattern });
        const upload3 = await makeUpload({ name: namePattern });
        const upload4 = await makeUpload({ name: namePattern });
        const upload5 = await makeUpload({ name: namePattern });
        
        const sut = await getUploadImage({
            searchQuery: namePattern,
            sortBy: "createdAt",
            sortDirection: "asc",
        })
        
        expect(isRight(sut)).toBe(true);
        expect(unwrapEither(sut).total).toEqual(5);
        expect(unwrapEither(sut).uploads).toEqual([
            expect.objectContaining({id: upload.id}),
            expect.objectContaining({id: upload2.id}),
            expect.objectContaining({id: upload3.id}),
            expect.objectContaining({id: upload4.id}),
            expect.objectContaining({id: upload5.id}),
        ]);
    })
})
