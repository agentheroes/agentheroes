"use client";

import { Button } from "@frontend/components/ui/button";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@frontend/hooks/use-toast";

interface OpenGeneratorButtonProps {
  refe: any;
  mediaId: string;
  prompt: string;
}

export function OpenGeneratorButton({ mediaId, prompt, refe }: OpenGeneratorButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenInGenerator = async () => {
    try {
      setIsLoading(true);
      
      // Navigate to the media generator page with the image URL and prompt as query parameters
      // We'll encode them to ensure they can be properly passed in the URL
      const encodedImageUrl = encodeURIComponent(refe.current.getAttribute("src"));
      const encodedPrompt = encodeURIComponent(prompt);
      
      router.push(`/media/create?sourceImage=${encodedImageUrl}&sourcePrompt=${encodedPrompt}`);
    } catch (error) {
      console.error("Error opening in generator:", error);
      toast({
        title: "Error",
        description: "Failed to open in media generator",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleOpenInGenerator();
      }}
      disabled={isLoading}
      className="h-8 w-8 !p-0"
      title="Open in Media Generator"
    >
      <Wand2 className="h-4 w-4" />
    </Button>
  );
} 