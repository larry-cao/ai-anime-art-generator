"use server";

import PictureList from "@/components/gallery/PictureList";
import { findPicturesByPage, getTotalPicturesCountByUserId } from "@/database/pictureRepo";
import { auth } from "@clerk/nextjs/server";

export default async function GalleryPage() {
  const { userId }: { userId: string | null } = auth();

  // if (!userId) {
  //   // 处理 userId 为 null 的情况，例如返回一个错误信息或空列表
  //   return <div>用户未登录</div>;
  // }
  const pageSize = 12;
  const pictures = await findPicturesByPage(1, pageSize, userId || '');
  const total = await getTotalPicturesCountByUserId(userId || '');
  // console.log(total);

  return <PictureList pictures={pictures} totalPage={Math.ceil(total / pageSize)} />;
}
