import { createPicture } from "@/database/pictureRepo";
import { downloadAndUploadImage, uploadImage } from "@/lib/s3";
import { PictureStatus } from "@/prisma/enums";
// import Replicate from "replicate";
import axios from 'axios';
import { HfInference } from "@huggingface/inference";
import { json } from "stream/consumers";

// import { client } from "@gradio/client";

export async function generateImage(userId: string, prompt: string) {

  const apiKey = process.env.HUGGING_FACE_API_TOKEN;
  // const systemPrompt = process.env.PROMPT_PICTURE_STYLE || "manga style, ";
  // const input = systemPrompt + prompt;

  const hf = new HfInference(apiKey);

  console.log("userId:", userId);
  console.log("prompt:", prompt);

  const params = {
    "prompt": prompt,
    // "prompt": "1girl, souryuu asuka langley, neon genesis evangelion, plugsuit, pilot suit, red bodysuit, sitting, crossing legs, black eye patch, cat hat, throne, symmetrical, looking down, from bottom, looking at viewer, outdoors, masterpiece, best quality, very aesthetic, absurdres",
    "negative_prompt": "nsfw, lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
    "resolution": "896 x 1152",
    "guidance_scale": 7,
    "num_inference_steps": 28,
    "seed": 0,
    "sampler": "Euler a",
    "sdxl_style": "(None)",
    "add_quality_tags": true,
    "quality_tags": "Standard v3.1",
    "use_upscaler": {
      "upscale_method": "nearest-exact",
      "upscaler_strength": 0.55,
      "upscale_by": 1.5,
      "new_resolution": "1344 x 1728"
    }
  }

  try {

    const response = await axios({
      method: "POST",
      url: 'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1',
      responseType: "arraybuffer",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      // data: params
      data: {
        inputs: JSON.stringify(params)
      }
    });

    // // const response = await hf.textToImage({
    // //   inputs: input,
    // //   model: 'cagliostrolab/animagine-xl-3.1',
    // //   // parameters: {
    // //   //   negative_prompt: 'blurry',
    // //   // }
    // // })
    // // const arrayBuffer = await response.arrayBuffer();
    const url = await uploadImage(response.data);

    // const app = await client("cagliostrolab/animagine-xl-3.1");
    // const result = await app.predict("/run", [		
    //   prompt, // string  in 'Prompt' Textbox component		
    //   "Hello!!", // string  in 'Negative Prompt' Textbox component		
    //   0, // number (numeric value between 0 and 2147483647) in 'Seed' Slider component		
    //   512, // number (numeric value between 512 and 2048) in 'Width' Slider component		
    //   512, // number (numeric value between 512 and 2048) in 'Height' Slider component		
    //   1, // number (numeric value between 1 and 12) in 'Guidance scale' Slider component		
    //   1, // number (numeric value between 1 and 50) in 'Number of inference steps' Slider component		
    //   "DPM++ 2M Karras", // string  in 'Sampler' Dropdown component		
    //   "1024 x 1024", // string  in 'Aspect Ratio' Radio component		
    //   "(None)", // string  in 'Style Preset' Radio component		
    //   "(None)", // string  in 'Quality Tags Presets' Dropdown component		
    //   true, // boolean  in 'Use Upscaler' Checkbox component		
    //   0, // number (numeric value between 0 and 1) in 'Strength' Slider component		
    //   1, // number (numeric value between 1 and 1.5) in 'Upscale by' Slider component		
    //   true, // boolean  in 'Add Quality Tags' Checkbox component
    // ]);

    // console.log(result.data);
    

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

