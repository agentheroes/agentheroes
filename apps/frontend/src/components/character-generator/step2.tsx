"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
    video: Model[];
  };
}

interface CharacterGeneratorStep2Props {
  referenceImage: any; // Hidden reference image (not used anymore)
  baseImage: any; // Visible consistent character - now used as reference
  selectedImages: string[];
  lookAlikeModel: string;
  onLookAlikeModelSelect: (model: string) => void;
  onImagesSelected: (images: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  savedVariations?: Array<{num: number, image: string, selected: boolean}>;
  onVariationsGenerated?: (variations: Array<{num: number, image: string, selected: boolean}>) => void;
}

// Component for individual variation box
function VariationBox({
  index,
  baseImage,
  lookAlikeModel,
  isSelected,
  onSelect,
  savedImage = "",
}: {
  index: number;
  baseImage: any;
  lookAlikeModel: string;
  isSelected: boolean;
  onSelect: (imageUrl: string) => void;
  savedImage?: string;
}) {
  const [isLoading, setIsLoading] = useState(savedImage ? false : true);
  const [imageUrl, setImageUrl] = useState(savedImage || "");
  const [error, setError] = useState("");
  const fetch = useFetch();

  useEffect(() => {
    // If we already have a saved image, don't generate a new one
    if (imageUrl) return;
    
    const generateVariation = async (retries = 0) => {
      try {
        const response = await fetch("/models/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "look-a-like-image",
            model: lookAlikeModel,
            prompt: "Generate a variation of this character",
            image: baseImage.generated[0],
            amount: 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate image: ${response.statusText}`);
        }

        const data = await response.json();
        setImageUrl(data.generated[0]);
      } catch (err) {
        if (retries < 3) {
          return generateVariation(retries + 1);
        }

        console.error(`Error generating variation ${index}:`, err);
        setError(
          `Error: ${err instanceof Error ? err.message : "Failed to generate"}`,
        );
        setImageUrl(
          `https://placehold.co/600x800/ff0000/ffffff?text=Error+${index + 1}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    generateVariation(0);
  }, []);

  const handleClick = () => {
    if (!isLoading && imageUrl) {
      onSelect(imageUrl);
    }
  };

  return (
    <div
      className={`relative border rounded-lg overflow-hidden ${
        isLoading ? "cursor-not-allowed" : "cursor-pointer"
      } ${isSelected ? "ring-4 ring-blue-500 border-blue-500" : ""}`}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-48 bg-gray-50">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <img
            src={imageUrl}
            alt={`Character variation ${index + 1}`}
            className="w-full h-auto"
          />
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
              ✓
            </div>
          )}
        </>
      )}
    </div>
  );
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
  savedVariations,
  onVariationsGenerated,
}: CharacterGeneratorStep2Props) {
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const fetch = useFetch();
  const TOTAL_VARIATIONS = 2;
  const NEEDED_VARIATIONS = 2;

  // Initialize allVariations with savedVariations if available
  const [allVariations, setAllVariations] = useState(
    savedVariations && savedVariations.length > 0
      ? savedVariations
      : Array(TOTAL_VARIATIONS)
          .fill(0)
          .map((p, index) => ({ num: index, image: "", selected: false })),
  );

  // Update parent component when allVariations changes
  useEffect(() => {
    if (onVariationsGenerated) {
      onVariationsGenerated(allVariations);
    }
  }, [allVariations, onVariationsGenerated]);

  const resetVariations = useCallback(() => {
    setAllVariations(
      Array(TOTAL_VARIATIONS)
        .fill(0)
        .map((p, index) => ({ num: index, image: "", selected: false })),
    );
  }, [TOTAL_VARIATIONS]);

  const localSelected = useMemo(() => {
    return allVariations.filter((f) => f.selected && f.image);
  }, [allVariations]);

  const handleModelSelect = (model: string) => {
    onLookAlikeModelSelect(model);
    setGeneratedUrls([]);
    setError("");
  };

  const startGeneratingVariations = useCallback(() => {
    if (lookAlikeModel && baseImage) {
      setIsGenerating(true);
      resetVariations();
    } else {
      setError("Missing model or base image");
    }
  }, [lookAlikeModel, baseImage, resetVariations]);

  // Automatically start generating variations when component mounts if look-alike model is selected
  // and we don't have saved variations
  useEffect(() => {
    if (!isGenerating && lookAlikeModel && baseImage && !isLoadingModels && 
        (!savedVariations || savedVariations.length === 0 || !savedVariations.some(v => v.image))) {
      startGeneratingVariations();
    } else if (savedVariations && savedVariations.length > 0 && savedVariations.some(v => v.image)) {
      // If we have saved variations with images, set isGenerating to true to show the grid
      setIsGenerating(true);
    }
  }, [lookAlikeModel, baseImage, isLoadingModels, isGenerating, startGeneratingVariations, savedVariations]);

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

        // Filter for look-a-like-image models only
        setAvailableModels(response.list["look-a-like-image"]);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please refresh the page or check your connection.");
        setAvailableModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleImageSelection = (current: any) => (imageUrl: string) => {
    if (!imageUrl) return;

    setAllVariations((prev) => {
      return prev.map((p) => {
        if (p.num === current.num) {
          return { ...p, image: imageUrl, selected: !p.selected };
        }
        return p;
      });
    });
  };

  const handleContinue = () => {
    if (localSelected.length < NEEDED_VARIATIONS) {
      setError(`Please select at least ${NEEDED_VARIATIONS} variations`);
      return;
    }

    setError("");
    onImagesSelected(
      allVariations.filter((f) => f.selected && f.image).map((p) => p.image),
    );
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Step 2: Select Character Variations
        </h3>
        <p className="text-gray-500 mb-4">
          Select at least {NEEDED_VARIATIONS} variations that best match your character.
        </p>
      </div>

      {isLoadingModels ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-12 h-12 mb-4" />
          <p>Loading models...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-full">
              <h4 className="font-medium mb-2">Your Character</h4>
              <div className="border rounded-lg overflow-hidden max-w-xs mx-auto">
                <img
                  src={baseImage.generated[0]}
                  alt="Your character"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                This character will be used as the reference for all variations
              </p>
            </div>
          </div>

          {!isGenerating ? (
            <div className="flex justify-center mt-6">
              {error && (
                <Button
                  onClick={startGeneratingVariations}
                  disabled={!lookAlikeModel}
                  className="w-full md:w-auto"
                >
                  Retry Generating Variations
                </Button>
              )}
              {!error && (
                <div className="flex flex-col items-center">
                  <Spinner className="h-8 w-8 mb-2" />
                  <p className="text-sm text-gray-500">Automatically generating variations...</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allVariations.map((current, index) => (
                  <VariationBox
                    key={`variation-${index}`}
                    index={index}
                    baseImage={baseImage}
                    lookAlikeModel={lookAlikeModel}
                    isSelected={current.selected}
                    onSelect={toggleImageSelection(current)}
                    savedImage={current.image}
                  />
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={onPrevious}>
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {localSelected.length} of {TOTAL_VARIATIONS} selected (min {NEEDED_VARIATIONS})
                  </span>
                  <Button
                    onClick={handleContinue}
                    disabled={localSelected.length < NEEDED_VARIATIONS}
                  >
                    Continue to Training
                  </Button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
