import { createPicture, findPicturesByPage, getTotalPicturesCountByUserId } from "@/database/pictureRepo";
import { PictureStatus } from "@/prisma/enums";
import { Picture } from "@/prisma/types";
import { Insertable } from "kysely";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const picture: Insertable<Picture> = {
    userId: body.userId,
    prompt: body.prompt,
    tags: body.tags,
    status: PictureStatus.ONLINE,
    url: body.url,
  };
  await createPicture(picture);
}

// export async function GET(req: NextRequest) {
//   const body = await req.json();
//   const userId = body.userId;
//   const pictures = await findPictures({ userId });
//   return new Response(JSON.stringify(pictures), { status: 200 });
// }

export async function GET(req: NextRequest) {
  // Access the userId from the custom header
  // console.log("req.headers", req.headers);
  const userId = req.headers.get("x-user-id") as string;
  console.log("userId", userId);
  const pageSize = 12;
  const { searchParams } = new URL(req.url);
  const pageNo = Number(searchParams.get("pageNo") || 1);
  const pictures = await findPicturesByPage( pageNo, pageSize, userId );
  const total = await getTotalPicturesCountByUserId(userId);
  const totalPage = Math.ceil(total / pageSize);
  return new Response(JSON.stringify({ pictures, totalPage }), { status: 200 }); 
  // return new Response(JSON.stringify(pictures), { status: 200 });
}
