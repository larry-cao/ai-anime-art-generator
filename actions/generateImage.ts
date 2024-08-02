import { createPicture } from "@/database/pictureRepo";
import { downloadAndUploadImage, uploadImage } from "@/lib/s3";
import { PictureStatus } from "@/prisma/enums";
// import Replicate from "replicate";
import axios from 'axios';
import { HfInference } from "@huggingface/inference";

export async function generateImage(userId: string, prompt: string) {

  const apiKey = process.env.HUGGING_FACE_API_TOKEN;
  const systemPrompt = process.env.PROMPT_PICTURE_STYLE || "manga style, ";
  const input = systemPrompt + prompt;

  const hf = new HfInference(apiKey);

  console.log("userId:", userId);
  console.log("prompt:", prompt);

  try {

    // const response = await axios({
    //   method: "POST",
    //   url: 'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1',
    //   responseType: "arraybuffer",
    //   headers: {
    //     "Authorization": `Bearer ${apiKey}`
    //   },
    //   data: {
    //     inputs: input
    //   }
    // });

    const response = await hf.textToImage({
      inputs: input,
      model: 'cagliostrolab/animagine-xl-3.1',
      // parameters: {
      //   negative_prompt: 'blurry',
      // }
    })
    const arrayBuffer = await response.arrayBuffer();
    const url = await uploadImage(arrayBuffer);
    

    const tags: string[] = [];
    const picture = {
      userId: userId,
      prompt: prompt,
      tags: tags,
      params: { input: input, tags: tags },
      url: url,
      status: PictureStatus.ONLINE,
    };

    const ret = await createPicture(picture);

    return ret;
  } catch (error) {
    console.error(error);
    throw new Error("Error communicating with Hugging Face API");
  }
  
  // // Use Replicate to generate the image
  // const replicate = new Replicate({
  //   auth: process.env.REPLICATE_API_TOKEN,
  // });

  // console.log("userId:", userId);
  // console.log("prompt:", prompt);

  // const systemPrompt = process.env.PROMPT_PICTURE_STYLE || "manga style, ";
  // const input = systemPrompt + prompt;

  // const output = await replicate.run(
  //   "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  //   {
  //     input: {
  //       prompt: input,
  //     },
  //   }
  // );

  // if (Array.isArray(output) && output.length > 0) {
  //   const imageUrl = output[0];

  //   const url = await downloadAndUploadImage(imageUrl);

  //   const tags: string[] = [];
  //   // 保存到数据库
  //   const picture = {
  //     userId: userId,
  //     prompt: prompt,
  //     tags: tags,
  //     params: { input: input, tags: tags },
  //     url: url,
  //     status: PictureStatus.ONLINE,
  //   };

  //   const ret = await createPicture(picture);

  //   return ret;
  // }

  // throw new Error("Failed to generate image");
}

