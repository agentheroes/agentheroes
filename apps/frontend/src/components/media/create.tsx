"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@frontend/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@frontend/components/ui/tabs";
import { MediaPreview } from "./preview";
import { MediaStyleSelector } from "./style-selector";
import { ModelSelector } from "./model-selector";
import useSWR from "swr";

interface Character {
  id: string;
  name: string;
}

interface NormalModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

export function MediaCreationPage() {
  const searchParams = useSearchParams();
  const characterParam = searchParams.get('character');
  const sourceImageParam = searchParams.get('sourceImage');
  const sourcePromptParam = searchParams.get('sourcePrompt');
  
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realism");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [mode, setMode] = useState<"character" | "normal-image">("character");
  const [normalModels, setNormalModels] = useState<NormalModel[]>([]);
  const [selectedNormalModel, setSelectedNormalModel] = useState("");
  const [isLoadingNormalModels, setIsLoadingNormalModels] = useState(false);
  
  const fetch = useFetch();
  const { toast } = useToast();
  const router = useRouter();
  const { mutate } = useSWR("/user/self");

  // Set source image if provided via URL params
  useEffect(() => {
    if (sourceImageParam) {
      setGeneratedImage(decodeURIComponent(sourceImageParam));
    }
    
    if (sourcePromptParam) {
      setPrompt(decodeURIComponent(sourcePromptParam));
    }
    
    // When coming from media list with an image, default to normal-image mode
    if (sourceImageParam) {
      setMode("normal-image");
    }
  }, [sourceImageParam, sourcePromptParam]);

  // Fetch characters for the dropdown
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await fetch("/characters");
        if (response.ok) {
          const data = await response.json();
          setCharacters(data);
          // If characterParam exists, set it as selected character
          // Otherwise use the first character in the list
          if (characterParam) {
            setSelectedCharacter(characterParam);
            setMode("character");
          } else if (data.length > 0) {
            setSelectedCharacter(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading characters:", error);
      }
    };

    loadCharacters();
  }, [characterParam]);

  // Fetch normal models
  useEffect(() => {
    const fetchNormalModels = async () => {
      if (mode === "normal-image") {
        setIsLoadingNormalModels(true);
        try {
          const response = await fetch("/models");
          if (response.ok) {
            const data = await response.json();
            if (data && data.list && data.list["normal-image"]) {
              setNormalModels(data.list["normal-image"]);
              if (data.list["normal-image"].length > 0) {
                setSelectedNormalModel(data.list["normal-image"][0].model);
              }
            } else {
              // No models available from API
              setNormalModels([]);
              toast({
                title: "Warning",
                description: "No normal image models available",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error loading normal models:", error);
          setNormalModels([]);
          toast({
            title: "Error",
            description: "Failed to load normal models",
            variant: "destructive",
          });
        } finally {
          setIsLoadingNormalModels(false);
        }
      }
    };

    fetchNormalModels();
  }, [mode]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleStyleSelect = useCallback((style: string) => {
    setSelectedStyle(style);
  }, []);

  const handleCharacterSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCharacter(e.target.value);
  }, []);

  const handleNormalModelSelect = useCallback((model: string) => {
    setSelectedNormalModel(model);
  }, []);

  const handleVideoGenerated = useCallback((videoUrl: string) => {
    setGeneratedVideo(videoUrl);
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

    if (mode === "character" && !selectedCharacter) {
      toast({
        title: "Error",
        description: "Please select a character",
        variant: "destructive",
      });
      return;
    }

    if (mode === "normal-image" && !selectedNormalModel) {
      toast({
        title: "Error",
        description: "Please select a model",
        variant: "destructive",
      });
      return;
    }

    // Reset video state when generating a new image
    setGeneratedVideo("");

    setIsLoading(true);
    try {
      let response;
      
      if (mode === "character") {
        response = await fetch(`/models/generate/${selectedCharacter}`, {
          method: "POST",
          body: JSON.stringify({
            type: "IMAGE",
            prompt: `${prompt} in ${selectedStyle} style`,
            videoModel: undefined
          }),
        });
      } else {
        // For normal image mode, use selected model
        response = await fetch(`/models/generate`, {
          method: "POST",
          body: JSON.stringify({
            prompt: `${prompt} in ${selectedStyle} style`,
            model: selectedNormalModel,
            saveAsMedia: true,
            type: 'normal-image'
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(Array.isArray(data.generated) ? data.generated[0] : data.generated.originalUrl);
        
        // Refresh user data to update credits
        await mutate();
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

  return (
    <div className="max-w-7xl mx-auto w-full">
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
                <label className="block text-[#F0F0F0] mb-2">Source Type</label>
                <Tabs value={mode} onValueChange={(value: string) => setMode(value as "character" | "normal-image")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#2A2A2A] border border-[#3B3B3B] p-1">
                    <TabsTrigger 
                      value="character" 
                      className="data-[state=active]:bg-[#353535] data-[state=active]:text-[#FD7302] data-[state=active]:shadow-none transition-all"
                    >
                      Character
                    </TabsTrigger>
                    <TabsTrigger 
                      value="normal-image"
                      className="data-[state=active]:bg-[#353535] data-[state=active]:text-[#FD7302] data-[state=active]:shadow-none transition-all"
                    >
                      Normal Model
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="character" className="mt-4">
                    <ModelSelector 
                      mode="character"
                      characters={characters}
                      normalModels={normalModels}
                      selectedCharacter={selectedCharacter}
                      selectedNormalModel={selectedNormalModel}
                      isLoadingNormalModels={isLoadingNormalModels}
                      onCharacterSelect={setSelectedCharacter}
                      onNormalModelSelect={setSelectedNormalModel}
                    />
                  </TabsContent>
                  <TabsContent value="normal-image" className="mt-4">
                    <ModelSelector 
                      mode="normal-image"
                      characters={characters}
                      normalModels={normalModels}
                      selectedCharacter={selectedCharacter}
                      selectedNormalModel={selectedNormalModel}
                      isLoadingNormalModels={isLoadingNormalModels}
                      onCharacterSelect={setSelectedCharacter}
                      onNormalModelSelect={setSelectedNormalModel}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <MediaStyleSelector 
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3">
          <MediaPreview
            generatedImage={generatedImage}
            generatedVideo={generatedVideo}
            isLoading={isLoading}
            prompt={prompt}
            onVideoGenerated={handleVideoGenerated}
          />
          
          <Card className="border border-[#3B3B3B] bg-[#151515]">
            <CardContent className="p-6">
              <label className="block text-[#F0F0F0] mb-2">Prompt</label>
              <Textarea 
                placeholder="Type your text here..."
                className="bg-[#2A2A2A] border border-[#3B3B3B] text-[#F0F0F0] min-h-[100px]"
                value={prompt}
                onChange={handlePromptChange}
              />
              <div className="text-sm text-muted-foreground mt-2">
                Final prompt will be: <span className="italic">{prompt ? `${prompt} in ${selectedStyle} style` : `[your prompt] in ${selectedStyle} style`}</span>
              </div>
              <div className="mt-4 flex justify-between">
                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt || (mode === "character" && !selectedCharacter) || (mode === "normal-image" && !selectedNormalModel)}
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