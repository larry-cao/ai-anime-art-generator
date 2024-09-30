import { createPicture, updatePictureUrl, updatePictureFailed } from "@/database/pictureRepo";
import { downloadAndUploadImage, uploadImage } from "@/lib/s3";
import { PictureStatus } from "@/prisma/enums";
// import Replicate from "replicate";
import axios from 'axios';
import { HfInference } from "@huggingface/inference";

// import { client } from "@gradio/client";

export async function generateImage(userId: string, prompt: string, negative_prompt: string, style: string, width: number, height: number, guidance_scale: number, num_inference_steps: number) {

  // const apiKey = process.env.HUGGING_FACE_API_TOKEN;
  // const systemPrompt = process.env.PROMPT_PICTURE_STYLE || "manga style, ";
  // const input = systemPrompt + prompt;
  // let inputs = prompt;
  // if (style !== "(None)") {
  //   inputs = style + " style," + prompt;
  // }

  // const hf = new HfInference(apiKey);

  console.log("params:", userId, prompt, negative_prompt, style, width, height, guidance_scale, num_inference_steps);

  try {

    // const response = await axios({
    //   method: "POST",
    //   url: 'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1',
    //   responseType: "arraybuffer",
    //   headers: {
    //     "Authorization": `Bearer ${apiKey}`,
    //     "Content-Type": "application/json"
    //   },
    //   data: JSON.stringify(params)
    //   // data: {
    //   //   inputs: params
    //   // }
    // });
    // const url = await uploadImage(response.data);

    // const response = await hf.textToImage({
    //   model: 'cagliostrolab/animagine-xl-3.1',
    //   inputs: inputs,
    //   parameters: {
    //     negative_prompt: negative_prompt || 'nsfw, lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]',
    //     width: width,
    //     height: height,
    //     guidance_scale: guidance_scale,
    //     num_inference_steps: num_inference_steps
    //   }
    // }, {
    //   wait_for_model: true
    // })
    // const arrayBuffer = await response.arrayBuffer();
    // const url = await uploadImage(arrayBuffer);
    

    const tags: string[] = [];
    const picture = {
      userId: userId,
      prompt: prompt,
      tags: tags,
      params: { prompt: prompt, negative_prompt:negative_prompt, style: style, width: width, height: height, guidance_scale: guidance_scale, num_inference_steps: num_inference_steps, tags: tags },
      url: "",
      status: PictureStatus.GENERATING,
    };

    const ret = await createPicture(picture);
    // const ret = {id: 1};
    if (ret.id) {
      // 异步生成图片
      txt2Image(ret.id, prompt, negative_prompt, style, width, height, guidance_scale, num_inference_steps);

      // // 模拟耗时任务的执行
      // setTimeout(() => {
      //   // 假设任务在5秒后完成
      //   console.log('模拟耗时任务的执行...');
      // }, 5000);
    }

    return ret;
    // return result.data;
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
async function txt2Image(id: string, prompt: string, negative_prompt: string, style: string, width: number, height: number, guidance_scale: number, num_inference_steps: number) {
  try {
    console.log('异步生成开始...');
    const apiKey = process.env.HUGGING_FACE_API_TOKEN;

    const hf = new HfInference(apiKey);

    let inputs = prompt;
    if (style !== "(None)") {
      inputs = style + " style," + prompt;
    }

    const response = await hf.textToImage({
      model: 'cagliostrolab/animagine-xl-3.1',
      inputs: inputs,
      parameters: {
        negative_prompt: negative_prompt || 'nsfw, lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]',
        width: width,
        height: height,
        guidance_scale: guidance_scale,
        num_inference_steps: num_inference_steps
      }
    }, {
      wait_for_model: true
    })
    const arrayBuffer = await response.arrayBuffer();
    const url = await uploadImage(arrayBuffer);

    const ret = await updatePictureUrl(id, url);
    console.log('异步生成结束...成功' + url);
    return ret;
  } catch (error) {
    const ret = await updatePictureFailed(id);
    console.log('异步生成结束...失败');
    return ret;
  }
}

