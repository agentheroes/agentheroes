"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Spinner } from "@frontend/components/ui/spinner";
import { CharacterGeneratorStep1 } from "../../../components/character-generator/step1";
import { CharacterGeneratorStep2 } from "../../../components/character-generator/step2";
import { CharacterGeneratorStep3 } from "../../../components/character-generator/step3";

export default function CharacterGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lookAlikeModel, setLookAlikeModel] = useState("");

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model);
  }, []);

  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
  }, []);

  const handleReferenceImageGenerated = (imageUrl: string) => {
    setReferenceImage(imageUrl);
  };

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleImageSelection = (images: string[]) => {
    setSelectedImages(images);
  };

  const handleLookAlikeModelSelect = (model: string) => {
    setLookAlikeModel(model);
  };

  const handleSubmitTraining = () => {
    setIsLoading(true);
    // Mock API call for training
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to characters page
      window.location.href = "/characters";
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Character Generator</h2>
      
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`flex-1 h-2 ${currentStep >= 1 ? "bg-blue-500" : "bg-gray-200"}`}></div>
          <div className={`flex-1 h-2 ${currentStep >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
          <div className={`flex-1 h-2 ${currentStep >= 3 ? "bg-blue-500" : "bg-gray-200"}`}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className={currentStep === 1 ? "font-bold" : ""}>1. Generate Character</div>
          <div className={currentStep === 2 ? "font-bold" : ""}>2. Select Variations</div>
          <div className={currentStep === 3 ? "font-bold" : ""}>3. Train Model</div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <CharacterGeneratorStep1
              selectedModel={selectedModel}
              prompt={prompt}
              referenceImage={referenceImage}
              generatedImage={generatedImage}
              lookAlikeModel={lookAlikeModel}
              onModelSelect={handleModelSelect}
              onPromptChange={handlePromptChange}
              onReferenceImageGenerated={handleReferenceImageGenerated}
              onImageGenerated={handleImageGenerated}
              onLookAlikeModelSelect={handleLookAlikeModelSelect}
              onImagesSelected={handleImageSelection}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <CharacterGeneratorStep2
              referenceImage={referenceImage}
              baseImage={generatedImage}
              selectedImages={selectedImages}
              lookAlikeModel={lookAlikeModel}
              onLookAlikeModelSelect={handleLookAlikeModelSelect}
              onImagesSelected={handleImageSelection}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}

          {currentStep === 3 && (
            <CharacterGeneratorStep3
              baseImage={generatedImage}
              selectedImages={selectedImages}
              onSubmit={handleSubmitTraining}
              onPrevious={handlePreviousStep}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 