"use client";

import { FC, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, treeSlice } from "../store";
import { NodeButton } from "../node-button.component";
import { PromptInput } from "../shared/prompt-input.component";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";

interface VideoModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface GenerateVideoConfigProps {
  nodeId: string;
  nodePath: string;
  initialData?: any;
  onClose: () => void;
  nodePathData?: any;
}

export const GenerateVideoConfig: FC<GenerateVideoConfigProps> = ({
  nodeId,
  nodePath,
  initialData,
  onClose,
  nodePathData,
}) => {
  const dispatch = useAppDispatch();
  const fetch = useFetch();
  
  // Get node data from Redux store
  const node = useAppSelector((state) => 
    state.tree.find(n => n.id === nodeId)
  );
  
  // Get input data from redux store
  const nodeInputs = node?.inputs || {};
  
  // Get workflow path data if available
  const pathData = useAppSelector((state) =>
    state.workflow.pathData[nodePath] || {}
  );
  
  // Check for prompt and image from upstream nodes
  const upstreamPrompt = pathData.prompt as string;
  const upstreamImage = pathData.images?.[0] as string;
  
  // Video model state
  const [videoModels, setVideoModels] = useState<VideoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(
    nodeInputs.videoModel || ""
  );
  const [prompt, setPrompt] = useState<string>(
    nodeInputs.prompt || ""
  );
  const [imageUrl, setImageUrl] = useState<string>(
    nodeInputs.imageUrl || ""
  );
  
  // Add the API trigger check
  const [quality, setQuality] = useState<string>(
    initialData.quality || "standard"
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";
  
  // Load video models
  useEffect(() => {
    const loadVideoModels = async () => {
      try {
        setLoading(true);
        const response = await fetch("/models");
        if (response.ok) {
          const data = await response.json();
          if (data && data.list && data.list["video"]) {
            const models = data.list["video"];
            setVideoModels(models);
            if (!selectedModel && models.length > 0) {
              setSelectedModel(models[0].model);
              updateVideoConfig({ videoModel: models[0].model });
            }
          }
        }
      } catch (error) {
        console.error("Error loading video models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideoModels();
  }, []);
  
  // Update from upstream data
  useEffect(() => {
    if (upstreamPrompt && !prompt) {
      setPrompt(upstreamPrompt);
      updateVideoConfig({ prompt: upstreamPrompt });
    }
    
    if (upstreamImage && !imageUrl) {
      setImageUrl(upstreamImage);
      updateVideoConfig({ imageUrl: upstreamImage });
    }
  }, [upstreamPrompt, upstreamImage, prompt, imageUrl]);
  
  const updateVideoConfig = (updates: any) => {
    const newInputs = {
      videoModel: selectedModel,
      prompt,
      imageUrl,
      ...updates
    };
    
    // Update node inputs
    dispatch(treeSlice.actions.updateNodeInputs({
      id: nodeId,
      inputs: newInputs
    }));

    // Also update outputs for downstream nodes
    const outputs = {
      ...newInputs,
      generatedVideo: 'https://example.com/generated-video.mp4' // Placeholder for actual generated video
    };

    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs
    }));
    
    return newInputs;
  };
  
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    updateVideoConfig({ videoModel: model });
  };
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    updateVideoConfig({ prompt: newPrompt });
  };

  const handleSave = () => {
    // For backward compatibility, still update node.data
    dispatch(treeSlice.actions.updateNodeData({ 
      id: nodeId, 
      data: { 
        videoModel: selectedModel,
        prompt,
        imageUrl
      } 
    }));
    
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Video Generation</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Model
          </label>
          {loading ? (
            <div className="flex items-center justify-center h-12 bg-gray-100 rounded-md">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {videoModels.map((model) => (
                <Button
                  key={model.model}
                  variant={selectedModel === model.model ? "default" : "outline"}
                  onClick={() => handleModelChange(model.model)}
                  className="p-2 h-auto flex flex-col items-start"
                >
                  <div className="text-sm font-medium">{model.label}</div>
                  <div className="text-xs text-gray-500">
                    Provider: {model.identifier}
                  </div>
                </Button>
              ))}
              
              {videoModels.length === 0 && (
                <div className="col-span-2 p-4 border border-gray-200 rounded-md bg-gray-50 text-center text-gray-500">
                  No video models available
                </div>
              )}
            </div>
          )}
        </div>
        
        {!upstreamTriggerIsApi && (
          <PromptInput
            initialValue={prompt}
            onChange={handlePromptChange}
            label="Prompt"
            placeholder="Describe the video you want to generate..."
            helpText="Be specific about what should happen in the video"
            inputFromPreviousNode={upstreamPrompt}
          />
        )}
        
        {upstreamImage ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Image
            </label>
            <div className="mt-1 border border-gray-300 rounded-md p-2 bg-gray-50">
              <div className="aspect-video relative bg-gray-200 rounded overflow-hidden">
                <img 
                  src={upstreamImage} 
                  alt="Source" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-md">
                  From Upstream
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (optional)
            </label>
            <Input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                updateVideoConfig({ imageUrl: e.target.value });
              }}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, this image will be used as the starting point for the video generation
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton 
          onClick={handleSave} 
          variant="primary"
        >
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 