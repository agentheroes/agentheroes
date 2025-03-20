"use client";

import { FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { treeSlice, useAppDispatch, useAppSelector, RootState } from "../store";
import { PromptInput } from "../shared/prompt-input.component";

export interface GenerateImageConfigProps {
  nodeId: string;
  nodePath: string;
}

interface GenerateImageData {
  prompt: string;
  negativePrompt?: string;
  modelType: string;
  width: number;
  height: number;
  numImages: number;
}

export const GenerateImageConfig: FC<GenerateImageConfigProps> = ({ nodeId, nodePath }) => {
  const dispatch = useAppDispatch();

  // Get any existing inputs for this node from the Redux store
  const nodeInputs = useAppSelector((state: RootState) => 
    state.tree.find(n => n.id === nodeId)?.inputs || {}
  );

  // Get any inputs from parent nodes from the workflow path data
  const pathData = useAppSelector((state) =>
    state.workflow.pathData[nodePath] || {}
  );

  // Check if we have a prompt from a parent node
  const upstreamPrompt = pathData.prompt as string;

  const [imageData, setImageData] = useState<GenerateImageData>({
    prompt: nodeInputs.prompt || "",
    negativePrompt: nodeInputs.negativePrompt || "",
    modelType: nodeInputs.modelType || "stable-diffusion-v1-5",
    width: nodeInputs.width || 512,
    height: nodeInputs.height || 512,
    numImages: nodeInputs.numImages || 1,
  });

  // Update the Redux store when our configuration changes
  useEffect(() => {
    dispatch(treeSlice.actions.updateNodeInputs({ 
      id: nodeId, 
      inputs: imageData 
    }));
  }, [imageData, dispatch, nodeId]);

  const handlePromptChange = (value: string) => {
    const updatedData = { ...imageData, prompt: value };
    setImageData(updatedData);
  };

  const handleNegativePromptChange = (value: string) => {
    const updatedData = { ...imageData, negativePrompt: value };
    setImageData(updatedData);
  };

  const handleModelChange = (modelType: string) => {
    const updatedData = { ...imageData, modelType };
    setImageData(updatedData);
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    const updatedData = { ...imageData, [dimension]: value };
    setImageData(updatedData);
  };

  const handleNumImagesChange = (value: number) => {
    const updatedData = { ...imageData, numImages: value };
    setImageData(updatedData);
  };

  const modelOptions = [
    { id: 'stable-diffusion-v1-5', name: 'Stable Diffusion v1.5' },
    { id: 'stable-diffusion-v2', name: 'Stable Diffusion v2' },
    { id: 'dalle-3', name: 'DALL·E 3' },
    { id: 'midjourney', name: 'Midjourney' },
  ];

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-medium text-gray-900">Image Generation Settings</h3>
      
      <PromptInput
        initialValue={imageData.prompt}
        onChange={handlePromptChange}
        label="Prompt"
        placeholder="Enter a detailed description of the image you want to generate..."
        helpText="Be specific about the subject, style, colors, composition, etc."
        inputFromPreviousNode={upstreamPrompt}
      />

      <PromptInput
        initialValue={imageData.negativePrompt}
        onChange={handleNegativePromptChange}
        label="Negative Prompt"
        placeholder="Specify what you don't want in the image..."
        helpText="Things to avoid in the generation (e.g., 'blurry, bad anatomy, distorted')"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Model Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {modelOptions.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => handleModelChange(model.id)}
              className={`py-2 px-4 text-sm font-medium rounded-md ${
                imageData.modelType === model.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Width (px)
          </label>
          <select
            value={imageData.width}
            onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="256">256</option>
            <option value="512">512</option>
            <option value="768">768</option>
            <option value="1024">1024</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Height (px)
          </label>
          <select
            value={imageData.height}
            onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="256">256</option>
            <option value="512">512</option>
            <option value="768">768</option>
            <option value="1024">1024</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Number of Images
        </label>
        <select
          value={imageData.numImages}
          onChange={(e) => handleNumImagesChange(parseInt(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {[1, 2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 