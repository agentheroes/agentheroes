"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";
import { Select } from "@frontend/components/ui/select";

interface NormalModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface GenerateStandardImageProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
  nodePathData?: any;
}

export const GenerateStandardImage: FC<GenerateStandardImageProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
  nodePathData,
}) => {
  const [models, setModels] = useState<NormalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(
    initialData.model || ""
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  const [style, setStyle] = useState<string>(
    initialData.style || "realism"
  );
  const [width, setWidth] = useState<number>(
    initialData.width || 512
  );
  const [height, setHeight] = useState<number>(
    initialData.height || 512
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";
  
  const fetch = useFetch();

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const response = await fetch("/models");
        if (response.ok) {
          const data = await response.json();
          if (data && data.list && data.list["normal-image"]) {
            const normalModels = data.list["normal-image"];
            setModels(normalModels);
            if (!selectedModel && normalModels.length > 0) {
              setSelectedModel(normalModels[0].model);
              updateData({ model: normalModels[0].model });
            }
          }
        } else {
          console.error("Failed to load models");
        }
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Update data when upstream prompt changes
  useEffect(() => {
    if (upstreamPrompt && !prompt) {
      setPrompt(upstreamPrompt);
      updateData({ prompt: upstreamPrompt });
    }
  }, [upstreamPrompt, prompt]);

  const updateData = (updates: any) => {
    const newData = {
      model: selectedModel,
      prompt,
      style,
      width,
      height,
      ...updates
    };
    
    onDataChange(newData);
    return newData;
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    updateData({ model });
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    updateData({ prompt: newPrompt });
  };

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    updateData({ style: newStyle });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (dimension === 'width') {
      setWidth(value);
      updateData({ width: value });
    } else {
      setHeight(value);
      updateData({ height: value });
    }
  };

  const styles = [
    { id: "realism", name: "Realism" },
    { id: "anime", name: "Anime" },
    { id: "cartoon", name: "Cartoon" },
    { id: "comic", name: "Comic" },
    { id: "fantasy", name: "Fantasy" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Model
        </label>
        {loading ? (
          <div className="flex items-center justify-center h-12 bg-gray-100 rounded-md">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {models.map((model) => (
              <Button
                key={model.model}
                variant={selectedModel === model.model ? "default" : "outline"}
                onClick={() => handleModelChange(model.model)}
                className="p-2 h-auto"
              >
                <span className="text-sm">{model.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {!upstreamTriggerIsApi && (
        <PromptInput
          initialValue={prompt}
          onChange={handlePromptChange}
          label="Prompt"
          placeholder="Describe the image you want to generate..."
          helpText="Be specific about details, style, lighting, etc."
          inputFromPreviousNode={upstreamPrompt}
        />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {styles.map((s) => (
            <Button
              key={s.id}
              variant={style === s.id ? "default" : "outline"}
              onClick={() => handleStyleChange(s.id)}
              className="px-3 py-2 h-auto"
            >
              {s.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Width (px)
          </label>
          <div className="relative">
            <Select
              value={width.toString()}
              onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
            >
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="768">768</option>
              <option value="1024">1024</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Height (px)
          </label>
          <div className="relative">
            <Select
              value={height.toString()}
              onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
            >
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="768">768</option>
              <option value="1024">1024</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}; 