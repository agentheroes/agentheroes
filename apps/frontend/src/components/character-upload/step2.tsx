"use client";

import { Button } from "@frontend/components/ui/button";
import { Spinner } from "@frontend/components/ui/spinner";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { useState, useEffect } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";

interface CharacterUploadStep2Props {
  selectedImages: string[];
  uploadedImages: Array<{id: string, url: string}>;
  onSubmit: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  selectedTrainingModel?: string;
  onTrainingModelSelect?: (model: string) => void;
}

interface Model {
  model: string;
  label: string;
  identifier: string;
  category: string;
}

export function CharacterUploadStep2({
  selectedImages,
  uploadedImages,
  onSubmit,
  onPrevious,
  isLoading,
  selectedTrainingModel,
  onTrainingModelSelect,
}: CharacterUploadStep2Props) {
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [trainingModels, setTrainingModels] = useState<Model[]>([]);
  const fetch = useFetch();

  useEffect(() => {
    const fetchTrainingModels = async () => {
      setIsLoadingModels(true);
      try {
        // Fetch models from the API
        const response = await fetch("/models").then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch models");
          }
          return res.json();
        });

        // Get training models
        if (response.list && response.list["trainer"]) {
          setTrainingModels(response.list["trainer"]);
          
          // Set default model if none selected
          if (response.list["trainer"].length > 0 && !selectedTrainingModel && onTrainingModelSelect) {
            onTrainingModelSelect(response.list["trainer"][0].model);
          }
        }
      } catch (err) {
        console.error("Error fetching training models:", err);
        setError("Failed to load training models. Please try again or check your connection.");
        setTrainingModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchTrainingModels();
  }, []);

  const handleModelSelect = (model: string) => {
    if (onTrainingModelSelect) {
      onTrainingModelSelect(model);
    }
  };

  const handleSubmit = async () => {
    if (!characterName.trim()) {
      setError("Please enter a character name");
      return;
    }

    if (!selectedTrainingModel) {
      setError("Please select a training model");
      return;
    }

    // At this point, we would typically send the character name, training model, 
    // and selected images URLs to an API
    try {
      // Prepare the payload for the training request
      const trainingPayload = {
        type: 'trainer',
        name: characterName,
        images: uploadedImages.map(img => img.url),
        baseImage: uploadedImages[0].url,
        model: selectedTrainingModel
      };
      
      // Send the training request to the API
      const response = await fetch("/models/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingPayload),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit training request");
      }
      
      // If successful, proceed with onSubmit callback
      setError("");
      onSubmit();
    } catch (err) {
      console.error("Error submitting training request:", err);
      setError("Failed to submit training request. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Step 2: Train Your Character Model</h3>
        <p className="text-gray-500 mb-4">
          Review your uploaded images and submit for training with LoRA.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="characterName">Character Name</Label>
          <Input
            id="characterName"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter a name for your character"
            className="mt-1"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <h4 className="font-medium mb-2">Select Training Model</h4>
          {isLoadingModels ? (
            <div className="flex items-center justify-center p-4">
              <Spinner className="mr-2" />
              <span>Loading models...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trainingModels.map((model) => (
                <div
                  key={model.model}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 ${
                    selectedTrainingModel === model.model ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => handleModelSelect(model.model)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-sm text-gray-500 mt-1">Provider: {model.identifier}</div>
                    </div>
                    {selectedTrainingModel === model.model && (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {trainingModels.length === 0 && (
                <div className="col-span-2 text-center p-4 border rounded-lg bg-gray-50">
                  <p className="text-gray-500">No training models available</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Selected Images ({uploadedImages.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden aspect-square">
                <img
                  src={image.url}
                  alt="Uploaded character"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Training Information</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your character will be trained using LoRA technology</li>
            <li>• Training typically takes 30-60 minutes</li>
            <li>• You'll receive a notification when training is complete</li>
            <li>• Your character will appear in your Characters dashboard</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Submitting...
            </>
          ) : (
            "Submit for Training"
          )}
        </Button>
      </div>
    </div>
  );
} 