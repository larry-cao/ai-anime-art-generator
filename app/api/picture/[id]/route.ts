import { findPictureById } from "@/database/pictureRepo";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // const { searchParams } = new URL(req.url);
  // const id = searchParams.get("id") || "";

  const { pathname } = req.nextUrl;
  
  // 获取路径中的 ID
  const id = pathname.split('/').pop(); // 获取最后一段作为 ID

  // console.log(id);
  const picture = await findPictureById(id || '');
  // console.log(picture);

  // setTimeout(() => {
  //   console.log('timeout.....');
  // }, 5000);
  // 每秒打印一个数字，持续60秒
  // for (let i = 1; i <= 65; i++) {
  //   setTimeout(() => {
  //     console.log(i);
  //   }, i * 1000);
  // }

  return new Response(JSON.stringify(picture), { status: 200 });
}

