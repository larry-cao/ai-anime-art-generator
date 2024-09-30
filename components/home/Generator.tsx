"use client";
import { ALL_GENERATOR } from "@/config/generator";
import { WAITLIST_FORM_LINK } from "@/config/tiers";
import { Button, Textarea, Slider, image } from "@nextui-org/react";
import { Tag, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import { ChevronRight } from "lucide-react";
import { Card } from "@nextui-org/react";
import useStore from '@/stores/useStore';
// import { findLatestPictures } from "@/database/pictureRepo";
// import { set } from "zod";
// import 'ldrs/dotSpinner';
import { LoadingSpinner, LoadingDots, LoadingCircle, LoadingDotSpinner } from "../icons";

const initialTags: string[] = [];

// interface GeneratorProps {
//   onGenerated: () => void; // Callback function type
// }

export default function Generator({
  id,
  locale,
  langName,
  userId,
  // pictures,
  // onSuccess,
}: {
  id: string;
  locale: any;
  langName: string;
  userId: string;
  // pictures: any;
  // onSuccess:() => void;
}) {
  const GENERATOR = ALL_GENERATOR[`GENERATOR_${langName.toUpperCase()}`];

  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("empty"); // empty, generating, online, failed
  const [currentImage, setCurrentImage] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("(None)");
  const [aspectRatio, setAspectRatio] = useState("896x1152");
  const [showCustomWH, setShowCustomWH] = useState(false);
  const [customW, setCustomW] = useState(512);
  const [customH, setCustomH] = useState(512);
  const [guidance_scale, setGuidanceScale] = useState(7);
  const [num_inference_steps, setNumInferenceSteps] = useState(28);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStylePresetChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setStylePreset(event.target.value);
  };

  const handleAspectRatioChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    if (event.target.value == 'Custom') {
      setShowCustomWH(true);
    } else {
      setShowCustomWH(false);
    }
    setAspectRatio(event.target.value);
  };

  async function handleGenerateImage() {
    setIsLoading(true);
    try {
      let height = 512;
      let width = 512;
      if (aspectRatio == 'Custom') {
        height = customH;
        width = customW;
      } else {
        const [w, h] = aspectRatio.split('x').map(Number);
        height = h;
        width = w;
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt, negative_prompt: negativePrompt, style: stylePreset, width: width, height: height, guidance_scale: guidance_scale, num_inference_steps: num_inference_steps }),
      });

      if (!response.ok) {
        const errmsg = await response.text();
        throw new Error(errmsg || response.statusText);
      }

      const data = await response.json();
      // router.push(`/picture/${data.id}`);
      handleCheckImage(data.id);

    } catch (error: any) {
      toast.error(`Failed to generate image: ${error.message}`);
      console.error("Failed to generate image:", error);
      setIsLoading(false);
    } finally {
      // setIsLoading(false);
    }
  }

  const handleCheckImage = async (id: string) => {
    if (!id) return;

    const response = await fetch(`/api/picture/${id}`);
    const data = await response.json();

    if (data.status == 'GENERATING') {
      setStatus('generating');
      // 任务未完成时继续轮询
      setTimeout(() => handleCheckImage(id), 5000); // 5秒后再查询
    } else if (data.status == 'UNKNOWN') {
      // 任务失败
      setStatus('failed');
      setIsLoading(false);
    } else {
      setCurrentImage(data.url);
      setStatus('online');
      setIsLoading(false);
      // onSuccess();
      // setVisible(true);
    }
  };

  const [pictures, setPictures] = useState<any[]>([]);
  const { lastPictureId, setLastPictureId } = useStore();

  // Fetch pictures initially on client side using useEffect
  useEffect(() => {
    const fetchPictures = async () => {
      const response = await fetch(`/api/latest`);
      const latestPictures = await response.json();
      // const latestPictures = await findLatestPictures({ userId: userId || '' });

      if (latestPictures && latestPictures.length > 0 && lastPictureId!== latestPictures[0].id) {
        setLastPictureId(latestPictures[0].id);
      }
      setPictures(latestPictures);
    };

    fetchPictures();
  }, [userId, lastPictureId, setLastPictureId]);

  // Callback function to refresh pictures (to be passed to Generator)
  const handleRefreshPictures = async () => {
    // const latestPictures = await findLatestPictures({ userId: userId || '' });
    const response = await fetch(`/api/latest`);
    const latestPictures = await response.json();
    if (latestPictures && latestPictures.length > 0 && lastPictureId!== latestPictures[0].id) {
      setLastPictureId(latestPictures[0].id);
    }
    setPictures(latestPictures);  // Update the state with new pictures
  };

  const handlePictureClick = (picture: any) => {
    router.push(`/picture/${picture.id}`);
  };

  const handleMorePictures = () => {
    router.push(`/gallery`);
  };
  
  return (
    <div>
    <section className="2xl:max-w-screen-2xl xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md w-full pb-8 pt-8 md:pt-12 space-y-6 text-center">
      {/* <h2 className="text-5xl">{GENERATOR.title}</h2> */}
      {/* <Textarea
          variant="bordered"
        /> */}
      <div className="flex flex-wrap w-full gap-4 items-stretch">
        {/* <Textarea
          key="input"
          variant="bordered"
          label=""
          labelPlacement="inside"
          placeholder={GENERATOR.description}
          className="col-span-12 md:col-span-6 flex-grow basis-2/3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        /> */}
        {/* 左边 */}
        <div className="flex-1" style={{ minWidth: 'min(320px, 100%)', flexGrow: 2 }}>
          <div className="border-b border-gray-200 dark:border-neutral-700">
            <nav className="flex gap-x-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
              <button type="button" className="hs-tab-active:bg-white hs-tab-active:border-b-transparent hs-tab-active:text-orange-500 dark:hs-tab-active:bg-neutral-800 dark:hs-tab-active:border-b-gray-800 dark:hs-tab-active:text-white -mb-px py-3 px-4 inline-flex items-center gap-x-2 bg-gray-50 text-sm font-medium text-center border text-gray-500 rounded-t-lg hover:text-gray-700 focus:outline-none focus:text-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200 active" id="card-type-tab-item-1" aria-selected="true" data-hs-tab="#card-type-tab-preview" aria-controls="card-type-tab-preview" role="tab">
                Txt2img
              </button>
              <button type="button" className="hs-tab-active:bg-white hs-tab-active:border-b-transparent hs-tab-active:text-orange-500 dark:hs-tab-active:bg-neutral-800 dark:hs-tab-active:border-b-gray-800 dark:hs-tab-active:text-white -mb-px py-3 px-4 inline-flex items-center gap-x-2 bg-gray-50 text-sm font-medium text-center border text-gray-500 rounded-t-lg hover:text-gray-700 focus:outline-none focus:text-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200" id="card-type-tab-item-2" aria-selected="false" data-hs-tab="#card-type-tab-2" aria-controls="card-type-tab-2" role="tab">
                Advanced Settings
              </button>
            </nav>
          </div>
          {/* 设置面板 */}
          <div className="mt-3">
            {/* tab 1 */}
            <div id="card-type-tab-preview" role="tabpanel" aria-labelledby="card-type-tab-item-1">
              <div className="w-full">
              <Textarea
                label={<label htmlFor="prompt-label" className="block text-sm font-medium mb-2 dark:text-white text-left text-orange-500">Prompt</label>}
                variant="flat"
                labelPlacement="outside"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt"/>
                {/* <textarea id="prompt-label" className="py-3 px-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows={3} placeholder="Enter your prompt"></textarea> */}
              </div>
              {/* <textarea
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md"
                placeholder="Enter your text here..."
              ></textarea> */}

              <div className="w-full mt-4">
              <Textarea
                label={<label htmlFor="prompt-label" className="block text-sm font-medium mb-2 dark:text-white text-left text-orange-500">Negative Prompt</label>}
                variant="flat"
                labelPlacement="outside"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Enter a negative prompt"/>
                {/* <label htmlFor="negative-label" className="block text-sm font-medium mb-2 dark:text-white text-left text-orange-500">Negative Prompt</label>
                <textarea id="negative-label" className="py-3 px-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows={3} placeholder="Enter a negative prompt"></textarea> */}
              </div>
            </div>
            {/* tab 2 */}
            <div id="card-type-tab-2" className="hidden" role="tabpanel" aria-labelledby="card-type-tab-item-2">
              <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-5 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 overflow-x-scroll">
              <label htmlFor="style-label" className="block text-sm font-medium mb-2 dark:text-white text-left text-orange-500">Style Preset</label>
              <div id="style-label" className="flex flex-wrap gap-2">
                <label htmlFor="None" className="flex items-center p-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input type="radio" name="stylePreset" value="(None)" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" id="None"
                  checked={stylePreset == '(None)'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">(None)</span>
                </label>
                <label htmlFor="Cinematic" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input type="radio" name="stylePreset" value="Cinematic" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" id="Cinematic"
                  checked={stylePreset == 'Cinematic'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Cinematic</span>
                </label>

                <label htmlFor="Photographic" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Photographic" type="radio" name="stylePreset" value="Photographic" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Photographic'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Photographic</span>
                </label>
                <label htmlFor="Anime" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Anime" type="radio" name="stylePreset" value="Anime" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Anime'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Anime</span>
                </label>

                <label htmlFor="Manga" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Manga" type="radio" name="stylePreset" value="Manga" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Manga'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Manga</span>
                </label>
                <label htmlFor="DigitalArt" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="DigitalArt" type="radio" name="stylePreset" value="Digital Art" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Digital Art'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Digital Art</span>
                </label>

                <label htmlFor="Pixel" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Pixel" type="radio" name="stylePreset" value="Pixel art" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Pixel art'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Pixel art</span>
                </label>
                <label htmlFor="Fantasy" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Fantasy" type="radio" name="stylePreset" value="Fantasy art" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Fantasy art'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Fantasy art</span>
                </label>

                <label htmlFor="Neonpunk" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Neonpunk" type="radio" name="stylePreset" value="Neonpunk" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == 'Neonpunk'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Neonpunk</span>
                </label>
                <label htmlFor="d3model" className="flex p-3 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="d3model" type="radio" name="stylePreset" value="3D Model" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={stylePreset == '3D Model'} onChange={handleStylePresetChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">3D Model</span>
                </label>
              </div>
              </div>
              <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-5 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 mt-4 overflow-x-scroll">
              <label htmlFor="style-label" className="block text-sm font-medium mb-2 dark:text-white text-left text-orange-500">Aspect Ratio</label>
              <div id="style-label" className="flex flex-wrap gap-2">
                <label htmlFor="1024x1024" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="1024x1024" type="radio" name="aspectRatio" value="1024x1024" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white"
                  checked={aspectRatio == '1024x1024'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">1024x1024</span>
                </label>
                <label htmlFor="1152x896" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="1152x896" type="radio" name="aspectRatio" value="1152x896" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '1152x896'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">1152x896</span>
                </label>

                <label htmlFor="896x1152" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="896x1152" type="radio" name="aspectRatio" value="896x1152" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '896x1152'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">896x1152</span>
                </label>
                <label htmlFor="1216x832" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="1216x832" type="radio" name="aspectRatio" value="1216x832" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '1216x832'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">1216x832</span>
                </label>

                <label htmlFor="832x1216" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="832x1216" type="radio" name="aspectRatio" value="832x1216" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '832x1216'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">832x1216</span>
                </label>
                <label htmlFor="1344x768" className="flex p-3 w-32 items-center bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="1344x768" type="radio" name="aspectRatio" value="1344x768" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '1344x768'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">1344x768</span>
                </label>

                <label htmlFor="768x1344" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="768x1344" type="radio" name="aspectRatio" value="768x1344" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '768x1344'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">768x1344</span>
                </label>
                <label htmlFor="1536x640" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="1536x640" type="radio" name="aspectRatio" value="1536x640" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '1536x640'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">1536x640</span>
                </label>

                <label htmlFor="640x1536" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="640x1536" type="radio" name="aspectRatio" value="640x1536" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == '640x1536'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">640x1536</span>
                </label>
                <label htmlFor="Custom" className="flex p-3 items-center w-32 bg-white border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                  <input id="Custom" type="radio" name="aspectRatio" value="Custom" className="appearance-none w-3 h-3 border border-gray-500 rounded-full checked:bg-orange-500 checked:border-orange-500 checked:ring-2 checked:ring-orange-500 checked:ring-offset-1 checked:ring-offset-white" 
                  checked={aspectRatio == 'Custom'} onChange={handleAspectRatioChange}/>
                  <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Custom</span>
                </label>
              </div>
              </div>

              {showCustomWH && (<div className="flex flex-wrap gap-px bg-gray-200 border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 mt-4 overflow-x-scroll" style={{ minWidth: 'min(320px, 100%)' }}>
                <div className="flex-1 p-4 md:p-5 bg-white dark:bg-neutral-900" style={{ minWidth: 'min(160px, 100%)' }}>
                <div className="flex items-center justify-between w-full">
                  <div className="block text-sm font-medium dark:text-white text-left text-orange-500">Width</div>
                  <input aria-label="number input for Height" data-testid="number-input" type="number" min="512" max="2048" step="8" className="block outline-none shadow border-0 rounded-lg bg-slate-100 p-2 h-6 text-[#191919] text-sm text-center" 
                  value={customW} onChange={(e) => setCustomW(Number(e.target.value))}/>
                </div>
                {/* 滑块 */}
                <Slider 
                  className="mt-3"
                  size="sm"
                  step={8}
                  defaultValue={512}
                  maxValue={2048}
                  minValue={512}
                  value={customW} 
                  onChange={(value) => setCustomW(value as number)}
                  classNames={{
                    base: "max-w-md gap-3",
                    track: "border-s-orange-100",
                    filler: "bg-gradient-to-r from-orange-100 to-orange-500"
                  }}
                  renderThumb={(props) => (
                    <div
                      {...props}
                      className="group p-0.5 top-1/2 bg-background border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                    >
                      <span className="transition-transform bg-gradient-to-br shadow-small from-orange-100 to-orange-500 rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
                    </div>
                  )}
                />
                </div>
                <div className="flex-1 p-4 md:p-5 bg-white dark:bg-neutral-900" style={{ minWidth: 'min(160px, 100%)' }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="block text-sm font-medium dark:text-white text-left text-orange-500">Height</div>
                    <input aria-label="number input for Height" data-testid="number-input" type="number" min="512" max="2048" step="8" className="block outline-none shadow border-0 rounded-lg bg-slate-100 p-2 h-6 text-[#191919] text-sm text-center" 
                    value={customH} onChange={(e) => setCustomH(Number(e.target.value))}/>
                  </div>
                  {/* 滑块 */}
                  <Slider 
                  className="mt-3"
                  size="sm"
                  step={8}
                  defaultValue={512}
                  maxValue={2048}
                  minValue={512}
                  value={customH} 
                  onChange={(value) => setCustomH(value as number)}
                  classNames={{
                    base: "max-w-md gap-3",
                    track: "border-s-orange-100",
                    filler: "bg-gradient-to-r from-orange-100 to-orange-500"
                  }}
                  renderThumb={(props) => (
                    <div
                      {...props}
                      className="group p-0.5 top-1/2 bg-background border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                    >
                      <span className="transition-transform bg-gradient-to-br shadow-small from-orange-100 to-orange-500 rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
                    </div>
                  )}
                />
                </div>
              </div>)}

              <div className="flex flex-wrap gap-px bg-gray-200 border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 mt-4 overflow-x-scroll" style={{ minWidth: 'min(320px, 100%)' }}>
              <div className="flex-1 p-4 md:p-5 bg-white dark:bg-neutral-900" style={{ minWidth: 'min(160px, 100%)' }}>
                <div className="flex items-center justify-between w-full">
                  <div className="block text-sm font-medium dark:text-white text-left text-orange-500">Guidance scale</div>
                  <input aria-label="number input for Height" data-testid="number-input" type="number" min="1" max="12" step="0.1" className="block outline-none shadow border-0 rounded-lg bg-slate-100 p-2 h-6 text-[#191919] text-sm text-center" 
                  value={guidance_scale} onChange={(e) => setGuidanceScale(Number(e.target.value))}/>
                </div>
                {/* 滑块 */}
                <Slider 
                  className="mt-3"
                  size="sm"
                  step={0.1}
                  defaultValue={7}
                  maxValue={12}
                  minValue={1}
                  value={guidance_scale} 
                  onChange={(value) => setGuidanceScale(value as number)}
                  classNames={{
                    base: "max-w-md gap-3",
                    track: "border-s-orange-100",
                    filler: "bg-gradient-to-r from-orange-100 to-orange-500"
                  }}
                  renderThumb={(props) => (
                    <div
                      {...props}
                      className="group p-0.5 top-1/2 bg-background border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                    >
                      <span className="transition-transform bg-gradient-to-br shadow-small from-orange-100 to-orange-500 rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
                    </div>
                  )}
                />
                </div>
                <div className="flex-1 p-4 md:p-5 bg-white dark:bg-neutral-900" style={{ minWidth: 'min(160px, 100%)' }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="block text-sm font-medium dark:text-white text-left text-orange-500">Number of inference steps</div>
                    <input aria-label="number input for Height" data-testid="number-input" type="number" min="1" max="50" step="1" className="block outline-none shadow border-0 rounded-lg bg-slate-100 p-2 h-6 text-[#191919] text-sm text-center" 
                    value={num_inference_steps} onChange={(e) => setNumInferenceSteps(Number(e.target.value))}/>
                  </div>
                  {/* 滑块 */}
                  <Slider 
                    className="mt-3"
                    size="sm"
                    step={1}
                    defaultValue={28}
                    maxValue={50}
                    minValue={1}
                    value={num_inference_steps} 
                    onChange={(value) => setNumInferenceSteps(value as number)}
                    classNames={{
                      base: "max-w-md gap-3",
                      track: "border-s-orange-100",
                      filler: "bg-gradient-to-r from-orange-100 to-orange-500"
                    }}
                    renderThumb={(props) => (
                      <div
                        {...props}
                        className="group p-0.5 top-1/2 bg-background border-small border-default-200 dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                      >
                        <span className="transition-transform bg-gradient-to-br shadow-small from-orange-100 to-orange-500 rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 右边 */}
        <div className="flex-1 gap-4 flex flex-col" style={{ minWidth: 'min(320px, 100%)', flexGrow: 3}}>
          <Button
            type="button"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white w-full"
            onClick={handleGenerateImage}
            disabled={isLoading} // 禁用按钮
          >
            <Tag />
            {isLoading
              ? GENERATOR.buttonTextGenerating
              : GENERATOR.buttonTextGenerate}
          </Button>
          {/* 图片容器 */}
          <div className="relative border-solid border-1 rounded-lg overflow-hidden w-full bg-slate-50" style={{ minWidth: 'min(160px, 100%)'}}>
            <div className="absolute bottom-0 right-0 top-0 left-0 bg-transparent"></div>
            {status == 'empty' && (
              <div className="flex justify-center items-center min-h-60">
                <div className="opacity-50 h-5 text-[#191919]">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              </div>
            )}
            {status == 'generating' && (
              <div className="flex justify-center items-center min-h-60">
                {/* <LoadingSpinner /> */}
                {/* <LoadingDots /> */}
                {/* <LoadingCircle /> */}
                <LoadingDotSpinner />
                {/* <l-dot-spinner
                  size="40"
                  speed="0.9"
                  color="black" 
                ></l-dot-spinner> */}
              </div>
            )}
            {status == 'online' && currentImage && (
              <div className="flex justify-center items-center">
                <img src={currentImage} alt="Generated image" aria-labelledby="Generated image" className="object-contain" /> 
              </div>
            )}
            {status == 'failed' && (
              <div className="flex justify-center items-center min-h-60">
                <Info color="#fca5a5" />
                <div className="text-red-300 pl-2">生成失败，请重新尝试！</div>
              </div>
            )}
          </div>
          {/* demo */}
          <div className="relative overflow-hidden" style={{ minWidth: 'min(160px, 100%)'}}>
            <div className="flex items-center mb-2 text-xs text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" className="mr-1"><path fill="currentColor" d="M10 6h18v2H10zm0 18h18v2H10zm0-9h18v2H10zm-6 0h2v2H4zm0-9h2v2H4zm0 18h2v2H4z"></path></svg>
            Examples
            </div>
            <div className="flex flex-wrap gap-2">
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("1girl, souryuu asuka langley, neon genesis evangelion, plugsuit, pilot suit, red bodysuit, sitting, crossing legs, black eye patch, cat hat, throne, symmetrical, looking down, from bottom, looking at viewer, outdoors")
              }}>
              1girl, souryuu asuka langley, neon genesis evangelion, plugsuit, pilot suit, red bodysuit, sitting, crossing legs, black eye patch, cat hat, throne, symmetrical, looking down, from bottom, looking at viewer, outdoors
              </Button> 
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("1boy, male focus, yuuki makoto \(persona 3\), persona 3, black jacket, white shirt, long sleeves, closed mouth, glowing eyes, gun, hair over one eye, holding gun, handgun, looking at viewer, solo, upper body")
              }}>
              1boy, male focus, yuuki makoto \(persona 3\), persona 3, black jacket, white shirt, long sleeves, closed mouth, glowing eyes, gun, hair over one eye, holding gun, handgun, looking at viewer, solo, upper body
              </Button> 
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("1girl, makima \(chainsaw man\), chainsaw man, black jacket, black necktie, black pants, braid, business suit, fingernails, formal, hand on own chin, jacket on shoulders, light smile, long sleeves, looking at viewer, looking up, medium breasts, office lady, smile, solo, suit, upper body, white shirt, outdoors")
              }}>
              1girl, makima \(chainsaw man\), chainsaw man, black jacket, black necktie, black pants, braid, business suit, fingernails, formal, hand on own chin, jacket on shoulders, light smile, long sleeves, looking at viewer, looking up, medium breasts, office lady, smile, solo, suit, upper body, white shirt, outdoors
              </Button>
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("1boy, male focus, gojou satoru, jujutsu kaisen, black jacket, blindfold lift, blue eyes, glowing, glowing eyes, high collar, jacket, jujutsu tech uniform, solo, grin, white hair")
              }}>
              1boy, male focus, gojou satoru, jujutsu kaisen, black jacket, blindfold lift, blue eyes, glowing, glowing eyes, high collar, jacket, jujutsu tech uniform, solo, grin, white hair
              </Button>
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("1girl, cagliostro, granblue fantasy, violet eyes, standing, hand on own chin, looking at object, smile, closed mouth, table, beaker, glass tube, experiment apparatus, dark room, laboratory")
              }}>
              1girl, cagliostro, granblue fantasy, violet eyes, standing, hand on own chin, looking at object, smile, closed mouth, table, beaker, glass tube, experiment apparatus, dark room, laboratory
              </Button>
              <Button aria-label="prompt" variant="ghost" className="p-2 whitespace-normal w-full h-auto border-1 hover:border-orange-100 hover:!bg-orange-100 hover:text-orange-500" onClick={()=> {
                setPrompt("kimi no na wa., building, cityscape, cloud, cloudy sky, gradient sky, lens flare, no humans, outdoors, power lines, scenery, shooting star, sky, sparkle, star \(sky\), starry sky, sunset, tree, utility pole")
              }}>
              kimi no na wa., building, cityscape, cloud, cloudy sky, gradient sky, lens flare, no humans, outdoors, power lines, scenery, shooting star, sky, sparkle, star \(sky\), starry sky, sunset, tree, utility pole
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* <p>{GENERATOR.textFullFeature}</p> */}
      {visible && (
        <p className="text-red-500">
          Coming soon! Please join our{" "}
          <a href={WAITLIST_FORM_LINK} className="underline">
            waitlist
          </a>
          !
        </p>
      )}
    </section>

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
    </div>
  );
}

