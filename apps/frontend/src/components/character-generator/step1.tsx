"use client";

import { useState, useEffect } from "react";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Spinner } from "@frontend/components/ui/spinner";
import { useFetch } from "@frontend/hooks/use-fetch";

interface Model {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface ModelsResponse {
  models: Array<{
    container: string;
    models: string;
  }>;
  list: {
    "normal-image": Model[];
    "look-a-like-image": Model[];
    video: Model[];
  };
}

interface CharacterGeneratorStep1Props {
  selectedModel: string;
  prompt: string;
  referenceImage: string;
  generatedImage: any;
  lookAlikeModel: string;
  onModelSelect: (model: string) => void;
  onPromptChange: (prompt: string) => void;
  onReferenceImageGenerated: (imageUrl: string) => void;
  onImageGenerated: (imageUrl: string) => void;
  onLookAlikeModelSelect: (model: string) => void;
  onImagesSelected: (images: string[]) => void;
  onNext: () => void;
}

export function CharacterGeneratorStep1({
  selectedModel,
  prompt,
  referenceImage,
  generatedImage,
  lookAlikeModel,
  onModelSelect,
  onPromptChange,
  onReferenceImageGenerated,
  onImageGenerated,
  onLookAlikeModelSelect,
  onImagesSelected,
  onNext,
}: CharacterGeneratorStep1Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingConsistent, setIsGeneratingConsistent] = useState(false);
  const fetch = useFetch();
  const [error, setError] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [lookAlikeModels, setLookAlikeModels] = useState<Model[]>([]);

  // Effect to fetch models only once on mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        // Fetch models from the API
        const response = await fetch("/models").then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch models");
          }
          return res.json() as Promise<ModelsResponse>;
        });

        // Get both normal and look-alike models
        setAvailableModels(response.list["normal-image"]);
        setLookAlikeModels(response.list["look-a-like-image"]);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please refresh the page or check your connection.");
        setAvailableModels([]);
        setLookAlikeModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to select the first model if none is selected
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      onModelSelect(availableModels[0].model);
    }
    if (!lookAlikeModel && lookAlikeModels.length > 0) {
      onLookAlikeModelSelect(lookAlikeModels[0].model);
    }
  }, [
    availableModels,
    lookAlikeModels,
    selectedModel,
    lookAlikeModel,
    onModelSelect,
    onLookAlikeModelSelect,
  ]);

  // Generate the initial reference image (not shown to user)
  const handleGenerateReference = async () => {
    if (!selectedModel) {
      setError("Please select a model");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      // Send POST request to generate the reference character
      const response = await fetch("/models/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "normal-image",
          model: selectedModel,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const data = await response.json();

      // Store the reference image (not shown to user)
      onReferenceImageGenerated(data);

      // Now generate the consistent character based on this reference
      await generateConsistentCharacter(data);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
      setIsGenerating(false);
    }
  };

  // Generate the consistent character based on the reference image
  const generateConsistentCharacter = async (referenceData: any) => {
    if (!lookAlikeModel) {
      setError("Please select a look-alike model");
      setIsGenerating(false);
      return;
    }

    setIsGeneratingConsistent(true);

    try {
      // Send POST request to generate the consistent character
      const response = await fetch("/models/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "look-a-like-image",
          model: lookAlikeModel,
          prompt: "Generate a consistent version of this character",
          image: referenceData.generated[0],
          amount: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate consistent image: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Store the consistent character image (shown to user)
      onImageGenerated(data);
    } catch (err) {
      setError("Failed to generate consistent character. Please try again.");
      console.error(err);
    } finally {
      setIsGeneratingConsistent(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Step 1: Generate Your Character
        </h3>
        <p className="text-gray-500 mb-4">
          Select a model and enter a prompt to generate your character.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="model">Select Base Model</Label>
          {isLoadingModels ? (
            <div className="flex items-center justify-center h-24">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {availableModels.map((model) => (
                <Button
                  key={model.model}
                  type="button"
                  variant={
                    selectedModel === model.model ? "default" : "outline"
                  }
                  onClick={() => onModelSelect(model.model)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-500">
                      {model.identifier}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="lookAlikeModel">Select Look-alike Model</Label>
          {isLoadingModels ? (
            <div className="flex items-center justify-center h-24">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {lookAlikeModels.map((model) => (
                <Button
                  key={model.model}
                  type="button"
                  variant={
                    lookAlikeModel === model.model ? "default" : "outline"
                  }
                  onClick={() => onLookAlikeModelSelect(model.model)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-500">
                      {model.identifier}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="prompt">Character Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your character..."
            className="mt-1"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleGenerateReference}
          disabled={isGenerating || isLoadingModels}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Spinner className="mr-2" />
              Generating...
            </>
          ) : (
            "Generate Character"
          )}
        </Button>
      </div>

      {generatedImage && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Your Character</h4>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={generatedImage.generated[0]}
                alt="Generated character"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onNext}>Continue to Variations</Button>
          </div>
        </div>
      )}
    </div>
  );
}
