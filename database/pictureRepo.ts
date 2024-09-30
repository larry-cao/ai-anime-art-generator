import { db } from "@/database/database";
import { PictureStatus } from "@/prisma/enums";
import { Picture } from "@/prisma/types";
import { Insertable, Selectable } from "kysely";

export async function findPictureById(id: string) {
  return await db
    .selectFrom("Picture")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function findPicturesByUserId(userId: string) {
  let query = db.selectFrom("Picture").where("userId", "=", userId).where("status", "=", PictureStatus.ONLINE);
  return await query.selectAll().execute();
}

export async function findPicturesByPage(pageNo: number, pageSize: number, userId: string) {
  const offset = (pageNo - 1) * pageSize;
  let query = db
    .selectFrom("Picture").where("userId", "=", userId).where("status", "=", PictureStatus.ONLINE)
    .orderBy("createdAt desc")
    .limit(pageSize)
    .offset(offset);
  return await query.selectAll().execute();
}

export async function getTotalPicturesCountByUserId(userId: string): Promise<number> {
  const result = await db
    .selectFrom("Picture").where("userId", "=", userId).where("status", "=", PictureStatus.ONLINE)
    .select(db.fn.count("id").as("count"))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

export async function findLatestPictures(criteria: Partial<Selectable<Picture>>) {
  let query = db.selectFrom("Picture").orderBy("createdAt desc").where("status", "=", PictureStatus.ONLINE).limit(9);
  console.log("criteria", criteria);
  if (criteria.id) {
    // console.log("criteria.id", criteria.id);
    query = query.where("id", "=", criteria.id); // Kysely is immutable, you must re-assign!
  }
  if (criteria.userId) {
    // console.log("criteria.userId", criteria.userId);  
    query = query.where("userId", "=", criteria.userId);
  }
  if (!criteria.id && !criteria.userId) {
    return [];
  }
  return await query.selectAll().execute();
}

export async function findPictures(criteria: Partial<Selectable<Picture>>) {
  let query = db.selectFrom("Picture").orderBy("createdAt desc").where("status", "=", PictureStatus.ONLINE);
  console.log("criteria", criteria);
  if (criteria.id) {
    // console.log("criteria.id", criteria.id);
    query = query.where("id", "=", criteria.id); // Kysely is immutable, you must re-assign!
  }
  if (criteria.userId) {
    // console.log("criteria.userId", criteria.userId);  
    query = query.where("userId", "=", criteria.userId);
  }
  if (!criteria.id && !criteria.userId) {
    return [];
  }
  return await query.selectAll().execute();
}

export async function getTotalPicturesCount(): Promise<number> {
  const result = await db
    .selectFrom("Picture")
    .select(db.fn.count("id").as("count"))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

export async function listPicturesPaginated(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  let query = db
    .selectFrom("Picture")
    .orderBy("createdAt desc")
    .limit(pageSize)
    .offset(offset);
  return await query.selectAll().execute();
}

export async function createPicture(picture: Insertable<Picture>) {
  return await db
    .insertInto("Picture")
    .values(picture)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updatePictureUrl(id: string, url: string) {
  if (!id) {
    throw new Error("Picture ID is required for updating.");
  }
  return await db
    .updateTable("Picture")
    .set({
      url: url,
      status: PictureStatus.ONLINE,
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updatePictureFailed(id: string) {
  if (!id) {
    throw new Error("Picture ID is required for updating.");
  }
  return await db
    .updateTable("Picture")
    .set({
      status: PictureStatus.UNKNOWN,
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deletePicture(id: string) {
  return await db
    .updateTable("Picture")
    .set({ status: PictureStatus.DELETED })
    .where("id", "=", id)
    .execute();
}

