"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
}

export function MediaCreationPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("v.2.1");
  const [selectedStyle, setSelectedStyle] = useState("realism");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const fetch = useFetch();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch characters for the dropdown
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await fetch("/characters");
        if (response.ok) {
          const data = await response.json();
          setCharacters(data);
          if (data.length > 0) {
            setSelectedCharacter(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading characters:", error);
      }
    };

    loadCharacters();
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model);
  }, []);

  const handleStyleSelect = useCallback((style: string) => {
    setSelectedStyle(style);
  }, []);

  const handleCharacterSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCharacter(e.target.value);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCharacter) {
      toast({
        title: "Error",
        description: "Please select a character",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/models/generate/${selectedCharacter}`, {
        method: "POST",
        body: JSON.stringify({
          type: "IMAGE",
          prompt
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.generated.media);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/media`, {
        method: "POST",
        body: JSON.stringify({
          characterId: selectedCharacter,
          prompt,
          image: generatedImage,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Media saved successfully",
        });
        router.push("/media");
      } else {
        toast({
          title: "Error",
          description: "Failed to save media",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving media:", error);
      toast({
        title: "Error",
        description: "Failed to save media",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/media" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-1">
          <Card className="border border-[#3B3B3B] bg-[#151515] flex-1">
            <CardContent className="p-6">
              <div className="mb-6">
                <label className="block text-[#F0F0F0] mb-2">Character</label>
                <div className="flex justify-between">
                  <div className="flex-1">
                    <select 
                      className="w-full bg-[#2A2A2A] border border-[#3B3B3B] rounded-md p-2 text-[#F0F0F0]"
                      value={selectedCharacter}
                      onChange={handleCharacterSelect}
                    >
                      {characters.map(character => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[#F0F0F0] mb-2">Model</label>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedModel === "v.2.1" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleModelSelect("v.2.1")}
                  >
                    <span className="text-[#F0F0F0] text-sm">V.2.1</span>
                  </div>
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedModel === "v.4" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleModelSelect("v.4")}
                  >
                    <span className="text-[#F0F0F0] text-sm">V.4</span>
                  </div>
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedModel === "v.11.2" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleModelSelect("v.11.2")}
                  >
                    <span className="text-[#F0F0F0] text-sm">V.11.2</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[#F0F0F0] mb-2">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedStyle === "realism" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleStyleSelect("realism")}
                  >
                    <span className="text-[#F0F0F0] text-sm">Realism</span>
                  </div>
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedStyle === "comics" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleStyleSelect("comics")}
                  >
                    <span className="text-[#F0F0F0] text-sm">Comics</span>
                  </div>
                  <div 
                    className={`aspect-square bg-[#2A2A2A] rounded-md flex items-center justify-center cursor-pointer border-2 ${selectedStyle === "painting" ? "border-primary" : "border-transparent"}`}
                    onClick={() => handleStyleSelect("painting")}
                  >
                    <span className="text-[#F0F0F0] text-sm">Painting</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3">
          <Card className="border border-[#3B3B3B] bg-[#151515] mb-6">
            <CardContent className="p-6">
              <div className="w-full h-96 bg-[#0A0A0A] rounded-md flex items-center justify-center mb-4">
                {isLoading ? (
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
                ) : generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Your generated image will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#3B3B3B] bg-[#151515]">
            <CardContent className="p-6">
              <label className="block text-[#F0F0F0] mb-2">Prompt</label>
              <Textarea 
                placeholder="Type your text here..."
                className="bg-[#2A2A2A] border border-[#3B3B3B] text-[#F0F0F0] min-h-[100px]"
                value={prompt}
                onChange={handlePromptChange}
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt}
                >
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 