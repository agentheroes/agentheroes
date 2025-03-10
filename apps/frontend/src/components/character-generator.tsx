"use client";

import { useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export function CharacterGenerator() {
  const [prompt, setPrompt] = useState("");
  const [character, setCharacter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const generateCharacter = async () => {
    setIsGenerating(true);
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Generate a character description based on the following prompt: ${prompt}`,
      });
      setCharacter(text);
    } catch (error) {
      console.error("Error generating character:", error);
    }
    setIsGenerating(false);
  };

  const confirmCharacter = () => {
    setIsConfirmed(true);
    // Here you would implement the logic to generate 20 more images and move to model trainer
  };

  const regenerateCharacter = () => {
    setCharacter(null);
    setIsConfirmed(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <Label htmlFor="prompt">Character Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your character..."
          />
        </div>
        <Button
          onClick={generateCharacter}
          disabled={isGenerating || prompt.length === 0}
        >
          {isGenerating ? "Generating..." : "Generate Character"}
        </Button>
        {character && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Generated Character:</h3>
            <p className="mb-4">{character}</p>
            {!isConfirmed && (
              <div className="flex space-x-4">
                <Button onClick={confirmCharacter}>Confirm Character</Button>
                <Button variant="outline" onClick={regenerateCharacter}>
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}
        {isConfirmed && (
          <p className="mt-4 text-green-600">
            Character confirmed! Generating additional images...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
