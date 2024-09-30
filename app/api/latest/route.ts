import { findLatestPictures } from "@/database/pictureRepo";
// import { PictureStatus } from "@/prisma/enums";
// import { Picture } from "@/prisma/types";
// import { Insertable } from "kysely";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  // const body = await req.json();
  // const userId = body.userId;
  const userId = req.headers.get("x-user-id") as string;
  // console.log("userId", userId);
  const pictures = await findLatestPictures({ userId });
  return new Response(JSON.stringify(pictures), { status: 200 });
}

