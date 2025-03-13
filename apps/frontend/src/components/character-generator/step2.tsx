"use client";

import { useState, useEffect } from "react";
import { Button } from "@frontend/components/ui/button";
import { Spinner } from "@frontend/components/ui/spinner";
import { Label } from "@frontend/components/ui/label";
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
    "video": Model[];
  };
}

interface CharacterGeneratorStep2Props {
  referenceImage: any; // Hidden reference image
  baseImage: any; // Visible consistent character
  selectedImages: string[];
  lookAlikeModel: string;
  onLookAlikeModelSelect: (model: string) => void;
  onImagesSelected: (images: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function CharacterGeneratorStep2({
  referenceImage,
  baseImage,
  selectedImages,
  lookAlikeModel,
  onLookAlikeModelSelect,
  onImagesSelected,
  onNext,
  onPrevious,
}: CharacterGeneratorStep2Props) {
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [variations, setVariations] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>(selectedImages);
  const [loadingStates, setLoadingStates] = useState<boolean[]>(Array(10).fill(true));
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const fetch = useFetch();

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
        
        // Filter for look-a-like-image models only
        setAvailableModels(response.list["look-a-like-image"]);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please refresh the page.");
        
        // Fallback to mock data in case the API fails
        const mockModels: Model[] = [
          {"label": "Look-a-like Model 1", "model": "look-a-like/model1", "category": "look-a-like-image", "identifier": "fal"},
          {"label": "Look-a-like Model 2", "model": "look-a-like/model2", "category": "look-a-like-image", "identifier": "replicate"}
        ];
        
        setAvailableModels(mockModels);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelSelect = (model: string) => {
    onLookAlikeModelSelect(model);
    // Clear previous variations when selecting a new model
    setVariations([]);
    setLocalSelected([]);
    setError("");
  };

  const startGeneratingVariations = () => {
    if (lookAlikeModel && referenceImage) {
      setIsGeneratingVariations(true);
      generateVariations();
    } else {
      setError("Missing model or reference image");
    }
  };

  const generateVariations = async () => {
    // Reset variations and set all containers to loading
    setVariations([]);
    setLoadingStates(Array(10).fill(true));
    
    // Process requests sequentially instead of in parallel
    for (let i = 0; i < 10; i++) {
      await generateSingleVariation(i);
      // Optional: Add a small delay between requests to make the sequential loading more visible
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const generateSingleVariation = async (index: number) => {
    try {
      // Send POST request to generate the variation using the reference image (not shown to user)
      const response = await fetch('/models/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "look-a-like-image",
          model: lookAlikeModel,
          prompt: "Generate a variation of this character",
          image: referenceImage.generated[0], // Use the reference image instead of baseImage
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
    
    setLocalSelected((prev) => {
      if (prev.includes(imageUrl)) {
        return prev.filter((url) => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const handleContinue = () => {
    if (localSelected.length < 4) {
      setError("Please select at least 4 more variations");
      return;
    }
    
    setError("");
    onImagesSelected([...selectedImages, ...localSelected]);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Step 2: Select More Character Variations</h3>
        <p className="text-gray-500 mb-4">
          Select at least 4 more variations that best match your character.
        </p>
      </div>

      {isLoadingModels ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-12 h-12 mb-4" />
          <p>Loading models...</p>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="model">Look-a-like Model</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {availableModels.map((model) => (
                <Button
                  key={model.model}
                  type="button"
                  variant={lookAlikeModel === model.model ? "default" : "outline"}
                  onClick={() => handleModelSelect(model.model)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-500">{model.identifier}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <h4 className="font-medium mb-2">Your Character</h4>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={baseImage.generated[0]}
                  alt="Your character"
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h4 className="font-medium mb-2">Selected Variations ({selectedImages.length})</h4>
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.slice(0, 3).map((imageUrl, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Selected variation ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
                {selectedImages.length > 3 && (
                  <div className="border rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 text-gray-500 p-4">
                    +{selectedImages.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isGeneratingVariations ? (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={startGeneratingVariations}
                disabled={!lookAlikeModel}
                className="w-full md:w-auto"
              >
                Generate More Variations
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, index) => (
                  <div 
                    key={index}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer ${
                      variations[index] && localSelected.includes(variations[index]) ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => variations[index] && toggleImageSelection(variations[index], index)}
                  >
                    {loadingStates[index] ? (
                      <div className="flex items-center justify-center h-48">
                        <Spinner className="h-8 w-8" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={variations[index]}
                          alt={`Character variation ${index + 1}`}
                          className="w-full h-auto"
                        />
                        {variations[index] && localSelected.includes(variations[index]) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={onPrevious}>
                  Back
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={localSelected.length < 4}
                >
                  Continue to Training
                </Button>
              </div>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
} 