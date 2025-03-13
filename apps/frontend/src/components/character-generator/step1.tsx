"use client";

import { useState, useEffect } from "react";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Spinner } from "@frontend/components/ui/spinner";
import {useFetch} from "@frontend/hooks/use-fetch";

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
    "video": Model[];
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
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>(Array(6).fill(true));

  // Effect to fetch models only once on mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        // Fetch models from the API
        const response = await fetch('/models').then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch models');
          }
          return res.json() as Promise<ModelsResponse>;
        });
        
        // Get both normal and look-alike models
        setAvailableModels(response.list["normal-image"]);
        setLookAlikeModels(response.list["look-a-like-image"]);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please refresh the page.");
        
        // Fallback to mock data in case the API fails
        const mockModels: Model[] = [
          {"label": "Fal Consistent Character", "model": "fofr/consiastent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772", "category": "normal-image", "identifier": "fal"},
          {"label": "Stable Diffusion XL", "model": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", "category": "normal-image", "identifier": "replicate"}
        ];
        
        const mockLookAlikeModels: Model[] = [
          {"label": "Look-a-like Model 1", "model": "look-a-like/model1", "category": "look-a-like-image", "identifier": "fal"},
          {"label": "Look-a-like Model 2", "model": "look-a-like/model2", "category": "look-a-like-image", "identifier": "replicate"}
        ];
        
        setAvailableModels(mockModels);
        setLookAlikeModels(mockLookAlikeModels);
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
  }, [availableModels, lookAlikeModels, selectedModel, lookAlikeModel, onModelSelect, onLookAlikeModelSelect]);

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
      const response = await fetch('/models/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "normal-image",
          model: selectedModel,
          prompt: prompt
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
      const response = await fetch('/models/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "look-a-like-image",
          model: lookAlikeModel,
          prompt: "Generate a consistent version of this character",
          image: referenceData.generated[0],
          amount: 1
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate consistent image: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store the consistent character image (shown to user)
      onImageGenerated(data);
      
      // Generate variations for selection
      await generateVariations(referenceData);
    } catch (err) {
      setError("Failed to generate consistent character. Please try again.");
      console.error(err);
    } finally {
      setIsGeneratingConsistent(false);
      setIsGenerating(false);
    }
  };

  // Generate variations for selection in step 1
  const generateVariations = async (referenceData: any) => {
    // Reset variations and set all containers to loading
    setVariations([]);
    setLoadingStates(Array(6).fill(true));
    
    // Process requests sequentially
    for (let i = 0; i < 6; i++) {
      await generateSingleVariation(i, referenceData);
      // Optional: Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const generateSingleVariation = async (index: number, referenceData: any) => {
    try {
      // Send POST request to generate the variation
      const response = await fetch('/models/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "look-a-like-image",
          model: lookAlikeModel,
          prompt: "Generate a variation of this character",
          image: referenceData.generated[0],
          amount: 1
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the variations array with the new image
      setVariations(prev => {
        const newVariations = [...prev];
        newVariations[index] = data.generated[0];
        return newVariations;
      });
      
      // Update loading state for this container
      setLoadingStates(prev => {
        const newLoadingStates = [...prev];
        newLoadingStates[index] = false;
        return newLoadingStates;
      });
    } catch (err) {
      console.error(`Error generating variation ${index}:`, err);
      
      // Update loading state even on error
      setLoadingStates(prev => {
        const newLoadingStates = [...prev];
        newLoadingStates[index] = false;
        return newLoadingStates;
      });
      
      // Add a placeholder for failed generations
      setVariations(prev => {
        const newVariations = [...prev];
        newVariations[index] = `https://placehold.co/600x800/ff0000/ffffff?text=Error+${index + 1}`;
        return newVariations;
      });
    }
  };

  const toggleImageSelection = (imageUrl: string, index: number) => {
    // Don't allow selection if the image is still loading
    if (loadingStates[index]) return;
    
    setSelectedVariations((prev) => {
      if (prev.includes(imageUrl)) {
        return prev.filter((url) => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const handleContinue = () => {
    if (selectedVariations.length < 3) {
      setError("Please select at least 3 variations");
      return;
    }
    
    setError("");
    onImagesSelected(selectedVariations);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Step 1: Generate Your Character</h3>
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
                  variant={selectedModel === model.model ? "default" : "outline"}
                  onClick={() => onModelSelect(model.model)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-500">{model.identifier}</div>
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
                  variant={lookAlikeModel === model.model ? "default" : "outline"}
                  onClick={() => onLookAlikeModelSelect(model.model)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-500">{model.identifier}</div>
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

          {variations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Select at least 3 variations to continue</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {variations.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer ${
                      selectedVariations.includes(imageUrl) ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => toggleImageSelection(imageUrl, index)}
                  >
                    {loadingStates[index] ? (
                      <div className="flex items-center justify-center h-48">
                        <Spinner className="h-8 w-8" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={imageUrl}
                          alt={`Character variation ${index + 1}`}
                          className="w-full h-auto"
                        />
                        {selectedVariations.includes(imageUrl) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {variations.length > 0 && (
            <div className="flex justify-end">
              <Button 
                onClick={handleContinue}
                disabled={selectedVariations.length < 3}
              >
                Continue to Step 2
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 