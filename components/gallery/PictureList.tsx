"use client";

import { Card } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {Pagination} from "@nextui-org/react";
import { SetStateAction, useState } from "react";

export default function PictureList({ pictures, totalPage }: { pictures: any, totalPage: number }) {
  // const totalPages = total;
  // console.log(pictures, totalPage);
  const [total, setTotal] = useState(totalPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPictures, setCurrentPictures] = useState(pictures);
  const router = useRouter();
  const handlePictureClick = (picture: any) => {
    router.push(`/picture/${picture.id}`);
  };

  const handlePageChange = async (page: number) => {
    const response = await fetch(`/api/picture?pageNo=${page}`);
    const data = await response.json();
    if (data) {
      setTotal(data.totalPage || 0);
      setCurrentPictures(data.pictures || []);
    }

  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-6xl font-bold mb-4 text-center pb-10">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {currentPictures.map((picture: any, index: number) => (
          <Card key={index} className="p-4">
            <Image
              key={picture.id}
              src={picture.url}
              alt={picture.prompt}
              aria-labelledby={picture.prompt}
              width={300}
              height={300}
              // objectFit="cover"
              className="object-cover"
              layout="responsive"
              // fill={true}
              onClick={() => handlePictureClick(picture)}
            />
            <div className="mt-2 pb-2">
              {picture.tags.map((tag: string, i: number) => (
                <span key={i} className="mr-2 px-2 py-1 bg-orange-200 dark:bg-orange-400 rounded text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {new Date(picture.createdAt).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
      {(total > 0) && (<Pagination showShadow loop showControls color="primary" total={total} initialPage={1} onChange={handlePageChange} />)}
    </div>
  );
}

