"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

interface GenerateImageConfigProps {
  nodeId: string;
  initialData: any;
  onClose: () => void;
}

type GeneratorType = "dall-e" | "midjourney" | "stable-diffusion";
type ImageSize = "small" | "medium" | "large";

export const GenerateImageConfig: FC<GenerateImageConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [generatorType, setGeneratorType] = useState<GeneratorType>(
    initialData.generatorType || "dall-e"
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  const [imageSize, setImageSize] = useState<ImageSize>(
    initialData.imageSize || "medium"
  );
  const [numImages, setNumImages] = useState<number>(
    initialData.numImages || 1
  );

  const handleSave = () => {
    const data = {
      generatorType,
      prompt,
      imageSize,
      numImages,
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Image Generation</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Generator
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setGeneratorType("dall-e")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "dall-e"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            DALL-E
          </button>
          <button
            type="button"
            onClick={() => setGeneratorType("midjourney")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "midjourney"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Midjourney
          </button>
          <button
            type="button"
            onClick={() => setGeneratorType("stable-diffusion")}
            className={`px-4 py-2 text-sm border rounded-md ${
              generatorType === "stable-diffusion"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Stable Diffusion
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
          placeholder="Describe the image you want to generate..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setImageSize("small")}
            className={`px-4 py-2 text-sm border rounded-md ${
              imageSize === "small"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Small
          </button>
          <button
            type="button"
            onClick={() => setImageSize("medium")}
            className={`px-4 py-2 text-sm border rounded-md ${
              imageSize === "medium"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setImageSize("large")}
            className={`px-4 py-2 text-sm border rounded-md ${
              imageSize === "large"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Large
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="numImages"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Number of Images
        </label>
        <input
          type="number"
          id="numImages"
          min="1"
          max="10"
          value={numImages}
          onChange={(e) => setNumImages(parseInt(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
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