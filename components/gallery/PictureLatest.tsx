"use client";

import { ALL_GENERATOR } from "@/config/generator";
import { Card } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useStore from '@/stores/useStore';
import { Button } from "@nextui-org/react";
import { ChevronRight } from "lucide-react";

export default function PictureLatest({ pictures, langName }: { pictures: any, langName: string }) {
  const GENERATOR = ALL_GENERATOR[`GENERATOR_${langName.toUpperCase()}`];
  const router = useRouter();
  const handlePictureClick = (picture: any) => {
    router.push(`/picture/${picture.id}`);
  };

  const handleMorePictures = () => {
    router.push(`/gallery`);
  };
  

  const { lastPictureId, setLastPictureId } = useStore();
  if (pictures && pictures.length > 0 && lastPictureId!== pictures[0].id) {
    setLastPictureId(pictures[0].id);
  }
  // console.log(pictures);
  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      {/* <h1 className="text-6xl font-bold mb-4 text-center pb-10">Gallery</h1> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pictures.map((picture: any, index: number) => (
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
      {pictures.length > 0 && (<Button
          type="button"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white mt-4"
          onClick={handleMorePictures}
          >
            <ChevronRight />
            {GENERATOR.more}
          </Button>)}
      
    </div>
  );
}

