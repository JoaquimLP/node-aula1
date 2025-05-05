import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { InferInsertModel } from "drizzle-orm";

export async function makeUpload(
    override?: Partial<InferInsertModel<typeof schema.uploads>>
) {
    const fileName = faker.system.fileName();
    const result = await db.insert(schema.uploads).values({
        name: fileName,
        remoteKey: `images/${fileName}.jpg`,
        remoteUrl: `https://example.com/images/${fileName}.jpg`,
        ...override,
    }).returning();

    return result[0];
}

