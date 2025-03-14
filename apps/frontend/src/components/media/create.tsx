"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useToast } from "@frontend/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@frontend/components/ui/dialog";
import { Spinner } from "@frontend/components/ui/spinner";

interface Character {
  id: string;
  name: string;
}

interface VideoModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

export function MediaCreationPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("v.2.1");
  const [selectedStyle, setSelectedStyle] = useState("realism");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [videoModels, setVideoModels] = useState<VideoModel[]>([]);
  const [selectedVideoModel, setSelectedVideoModel] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
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

  // Fetch video models
  useEffect(() => {
    const fetchVideoModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch("/models");
        if (response.ok) {
          const data = await response.json();
          if (data.list && data.list["video"]) {
            setVideoModels(data.list["video"]);
            if (data.list["video"].length > 0) {
              setSelectedVideoModel(data.list["video"][0].model);
            }
          }
        }
      } catch (error) {
        console.error("Error loading video models:", error);
        // Fallback to mock data in case the API fails
        const mockVideoModels = [
          {
            label: "Standard Video",
            model: "standard-video",
            category: "video",
            identifier: "runwayml",
          },
          {
            label: "High Quality Video",
            model: "high-quality-video",
            category: "video",
            identifier: "runwayml",
          },
        ];
        setVideoModels(mockVideoModels);
        if (mockVideoModels.length > 0) {
          setSelectedVideoModel(mockVideoModels[0].model);
        }
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchVideoModels();
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

  const handleVideoModelSelect = useCallback((model: string) => {
    setSelectedVideoModel(model);
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

  const handleGenerateVideo = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVideoModel) {
      toast({
        title: "Error",
        description: "Please select a video model",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const response = await fetch(`/models/generate/${selectedCharacter}`, {
        method: "POST",
        body: JSON.stringify({
          type: "VIDEO",
          prompt,
          videoModel: selectedVideoModel,
          image: generatedImage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedVideo(data.generated.media);
        toast({
          title: "Success",
          description: "Video generated successfully",
        });
        setShowVideoDialog(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate video",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Error",
        description: "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage && !generatedVideo) {
      toast({
        title: "Error",
        description: "Please generate an image or video first",
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
          video: generatedVideo,
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
                ) : generatedVideo ? (
                  <video 
                    src={generatedVideo} 
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Your generated media will appear here</p>
                  </div>
                )}
              </div>
              {generatedImage && !generatedVideo && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setShowVideoDialog(true)}
                    className="flex items-center"
                    variant="outline"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Generate Video
                  </Button>
                </div>
              )}
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
              <div className="mt-4 flex justify-between">
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || (!generatedImage && !generatedVideo)}
                  variant="outline"
                >
                  Save
                </Button>
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

      {/* Video Model Selection Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Video</DialogTitle>
            <DialogDescription>
              Select a video model to generate a video from your image.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingModels ? (
            <div className="flex items-center justify-center p-8">
              <Spinner className="mr-2" />
              <span>Loading video models...</span>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                {videoModels.map((model) => (
                  <div
                    key={model.model}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 ${
                      selectedVideoModel === model.model ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400' : ''
                    }`}
                    onClick={() => handleVideoModelSelect(model.model)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provider: {model.identifier}</div>
                      </div>
                      {selectedVideoModel === model.model && (
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {videoModels.length === 0 && (
                  <div className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">No video models available</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !selectedVideoModel}
            >
              {isGeneratingVideo ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Video"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 