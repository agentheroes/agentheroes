"use client";

import { FC, useState, useEffect } from "react";
import { treeSlice, useAppDispatch, useAppSelector, RootState } from "../store";
import { GenerateCharacter } from "./generate-image-options/generate-character.component";
import { GenerateStandardImage } from "./generate-image-options/generate-standard-image.component";
import { Button } from "@frontend/components/ui/button";

export interface GenerateImageConfigProps {
  nodeId: string;
  nodePath: string;
}

type GenerationMode = "character" | "standard";

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

  // Create nodePathData object to pass to child components
  const nodePathData = {
    triggerType: pathData.triggerType,
    ...pathData
  };

  // Set up state for generation mode
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    nodeInputs.generationMode || "standard"
  );

  // State for image generation data
  const [imageData, setImageData] = useState<any>({
    generationMode: nodeInputs.generationMode || "standard",
    ...(nodeInputs || {})
  });

  // Update the Redux store when our configuration changes
  useEffect(() => {
    dispatch(treeSlice.actions.updateNodeInputs({ 
      id: nodeId, 
      inputs: imageData 
    }));

    // Also set outputs for downstream nodes
    const outputs = {
      ...imageData,
      images: ['https://example.com/generated-image.jpg'] // Placeholder for actual generated image
    };

    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs
    }));
  }, [imageData, dispatch, nodeId]);

  const handleModeChange = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setImageData((prevData: any) => ({
      ...prevData,
      generationMode: mode
    }));
  };

  const handleImageDataChange = (data: any) => {
    setImageData((prevData: any) => ({
      ...prevData,
      ...data
    }));
  };

  // Render the appropriate generation component based on the mode
  const renderGenerationOptions = () => {
    switch (generationMode) {
      case "character":
        return (
          <GenerateCharacter 
            initialData={imageData} 
            onDataChange={handleImageDataChange}
            upstreamPrompt={upstreamPrompt}
            nodePathData={nodePathData}
          />
        );
      case "standard":
        return (
          <GenerateStandardImage 
            initialData={imageData} 
            onDataChange={handleImageDataChange}
            upstreamPrompt={upstreamPrompt}
            nodePathData={nodePathData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-medium text-gray-900">Image Generation Settings</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Generation Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={generationMode === "standard" ? "default" : "outline"}
            onClick={() => handleModeChange("standard")}
          >
            Generate Image
          </Button>
          <Button
            variant={generationMode === "character" ? "default" : "outline"}
            onClick={() => handleModeChange("character")}
          >
            Generate Character
          </Button>
        </div>
      </div>

      {renderGenerationOptions()}
    </div>
  );
}; 