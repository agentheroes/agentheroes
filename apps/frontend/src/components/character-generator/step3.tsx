"use client";

import { Button } from "@frontend/components/ui/button";
import { Spinner } from "@frontend/components/ui/spinner";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { useState } from "react";

interface CharacterGeneratorStep3Props {
  baseImage: string;
  selectedImages: string[];
  onSubmit: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export function CharacterGeneratorStep3({
  baseImage,
  selectedImages,
  onSubmit,
  onPrevious,
  isLoading,
}: CharacterGeneratorStep3Props) {
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!characterName.trim()) {
      setError("Please enter a name for your character");
      return;
    }
    
    setError("");
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Step 3: Train Your Character Model</h3>
        <p className="text-gray-500 mb-4">
          Review your selections and submit for training with LoRA.
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
          <h4 className="font-medium mb-2">Base Image</h4>
          <div className="border rounded-lg overflow-hidden w-1/3">
            <img
              src={baseImage}
              alt="Base character"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Selected Variations ({selectedImages.length})</h4>
          <div className="grid grid-cols-5 gap-2">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Selected variation ${index + 1}`}
                  className="w-full h-auto"
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