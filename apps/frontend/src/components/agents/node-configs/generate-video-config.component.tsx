"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

interface GenerateVideoConfigProps {
  nodeId: string;
  initialData: any;
  onClose: () => void;
}

type VideoGeneratorType = "runway" | "pika" | "gen-2";
type VideoLength = "short" | "medium" | "long";
type VideoQuality = "standard" | "high";

export const GenerateVideoConfig: FC<GenerateVideoConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [generatorType, setGeneratorType] = useState<VideoGeneratorType>(
    initialData.generatorType || "runway"
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  const [videoLength, setVideoLength] = useState<VideoLength>(
    initialData.videoLength || "short"
  );
  const [videoQuality, setVideoQuality] = useState<VideoQuality>(
    initialData.videoQuality || "standard"
  );
  const [useImage, setUseImage] = useState<boolean>(
    initialData.useImage || false
  );
  
  const handleSave = () => {
    const data = {
      generatorType,
      prompt,
      videoLength,
      videoQuality,
      useImage,
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Video Generation</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Generator
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setGeneratorType("runway")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "runway"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Runway
          </button>
          <button
            type="button"
            onClick={() => setGeneratorType("pika")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "pika"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Pika
          </button>
          <button
            type="button"
            onClick={() => setGeneratorType("gen-2")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "gen-2"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Gen-2
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe the video you want to generate..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Length
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setVideoLength("short")}
            className={`px-4 py-2 text-sm border rounded-md ${
              videoLength === "short"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Short
          </button>
          <button
            type="button"
            onClick={() => setVideoLength("medium")}
            className={`px-4 py-2 text-sm border rounded-md ${
              videoLength === "medium"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setVideoLength("long")}
            className={`px-4 py-2 text-sm border rounded-md ${
              videoLength === "long"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Long
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Quality
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVideoQuality("standard")}
            className={`px-4 py-2 text-sm border rounded-md ${
              videoQuality === "standard"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setVideoQuality("high")}
            className={`px-4 py-2 text-sm border rounded-md ${
              videoQuality === "high"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            High
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useImage}
            onChange={(e) => setUseImage(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Use Generated Image as Input
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          If checked, the video will be generated using the image from the previous step
        </p>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton onClick={handleSave} variant="primary">
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 