"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { CharacterUploadStep1 } from "@frontend/components/character-upload/step1";
import { CharacterUploadStep2 } from "@frontend/components/character-upload/step2";

export function CharacterUploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingModel, setTrainingModel] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string}>>([]);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleImageSelection = (images: string[]) => {
    setSelectedImages(images);
  };

  const handleTrainingModelSelect = (model: string) => {
    setTrainingModel(model);
  };

  const handleImagesUploaded = (images: Array<{id: string, url: string}>) => {
    setUploadedImages(images);
  };

  const handleSubmitTraining = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/characters";
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-4">Create Character from Existing Files</h2>

      <div className="mb-6">
        <div className="flex items-center">
          <div
            className={`flex-1 h-2 ${currentStep >= 1 ? "bg-[#FD7302]" : "bg-gray-200"}`}
          ></div>
          <div
            className={`flex-1 h-2 ${currentStep >= 2 ? "bg-[#FD7302]" : "bg-gray-200"}`}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className={currentStep === 1 ? "font-bold" : ""}>
            1. Upload Images
          </div>
          <div className={currentStep === 2 ? "font-bold" : ""}>
            2. Train Model
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <CharacterUploadStep1
              uploadedImages={uploadedImages}
              onImagesUploaded={handleImagesUploaded}
              onImagesSelected={handleImageSelection}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <CharacterUploadStep2
              selectedImages={selectedImages}
              uploadedImages={uploadedImages}
              onSubmit={handleSubmitTraining}
              onPrevious={handlePreviousStep}
              isLoading={isLoading}
              selectedTrainingModel={trainingModel}
              onTrainingModelSelect={handleTrainingModelSelect}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 