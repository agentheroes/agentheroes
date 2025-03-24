"use client";

import { FC, useState, useEffect } from "react";
import { Label } from "@frontend/components/ui/label";
import { Spinner } from "@frontend/components/ui/spinner";
import { useFetch } from "@frontend/hooks/use-fetch";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@frontend/components/ui/select";

interface Model {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface TextModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export const TextModelSelector: FC<TextModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
}) => {
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [textModels, setTextModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();

  useEffect(() => {
    const fetchTextModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch("/models");
        if (response.ok) {
          const data = await response.json();
          if (data && data.list && data.list[GenerationCategory.TEXT]) {
            setTextModels(data.list[GenerationCategory.TEXT]);

            // Set default model if none selected
            if (
              data.list[GenerationCategory.TEXT].length > 0 &&
              !selectedModel
            ) {
              onModelSelect(data.list[GenerationCategory.TEXT][0].model);
            }
          } else {
            setTextModels([]);
          }
        } else {
          setError("Failed to fetch models");
        }
      } catch (error) {
        console.error("Error loading text models:", error);
        setError("Failed to load text models");
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchTextModels();
  }, []);

  const handleModelSelect = (e: string) => {
    onModelSelect(e);
  };

  if (isLoadingModels) {
    return (
      <div className="flex items-center justify-center p-2">
        <Spinner className="mr-2" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-2 border rounded-lg bg-[#2A2A2A]">
        <p className="text-[#F0F0F0]">{error}</p>
      </div>
    );
  }

  if (textModels.length === 0) {
    return (
      <div className="text-center p-2 border rounded-lg bg-[#2A2A2A]">
        <p className="text-[#F0F0F0]">No text models available</p>
      </div>
    );
  }

  return (
    <div className="text-select-center">
      <Select value={selectedModel} onValueChange={handleModelSelect}>
        <SelectTrigger id="modelText">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          {textModels.map((model) => (
            <SelectItem key={model.label} value={model.model}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
