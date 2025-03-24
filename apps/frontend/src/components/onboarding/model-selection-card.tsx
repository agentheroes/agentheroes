"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@frontend/components/ui/card";
import { Check } from "lucide-react";

interface ModelSelectionCardProps {
  category: string;
  models: Array<{
    identifier: string;
    model: string;
    label: string;
    category: string;
  }>;
  selectedModels: string[];
  onModelSelect: (modelId: string) => void;
  isRequired?: boolean;
}

export function ModelSelectionCard({
  category,
  models,
  selectedModels,
  onModelSelect,
  isRequired = false,
}: ModelSelectionCardProps) {
  // Format category name for display (e.g., "character-generation" -> "Character Generation")
  const formattedCategory = category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Get category description
  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      'character-generation': 'Models for generating unique character designs',
      'video-generation': 'Models for creating animated videos and motion',
      'image-training': 'Models for training on character images (LoRA)',
      'content-generation': 'Models for generating social media content',
      'news-processing': 'Models for processing and analyzing news'
    };
    return descriptions[category] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formattedCategory}
          {isRequired && <span className="text-destructive">*</span>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{getCategoryDescription(category)}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models?.map((model) => {
            const isSelected = selectedModels.includes(model.model);
            return (
              <Card
                key={model.model} 
                className={`relative group rounded-lg p-4 cursor-pointer transition-all hover:border-[#4D4D4D] ${
                  isSelected ? 'bg-[#2E2E2E] border-[#4D4D4D]' : ''
                }`}
                onClick={() => onModelSelect(model.model)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{model.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">Provider: {model.identifier}</div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          
          {(!models || models.length === 0) && (
            <p className="text-muted-foreground">No models available for this category</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 