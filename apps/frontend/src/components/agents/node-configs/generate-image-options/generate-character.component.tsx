"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface GenerateCharacterProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
  nodePathData?: any;
}

export const GenerateCharacter: FC<GenerateCharacterProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
  nodePathData,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(
    initialData.characterId || ""
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  const [style, setStyle] = useState<string>(
    initialData.style || "realism"
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";

  const fetch = useFetch();

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        const response = await fetch("/characters");
        if (response.ok) {
          const data = await response.json();
          setCharacters(data);
          if (!selectedCharacterId && data.length > 0) {
            setSelectedCharacterId(data[0].id);
            updateData({ characterId: data[0].id });
          }
        } else {
          console.error("Failed to load characters");
        }
      } catch (error) {
        console.error("Error loading characters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // Update data when upstream prompt changes
  useEffect(() => {
    if (upstreamPrompt && !prompt) {
      setPrompt(upstreamPrompt);
      updateData({ prompt: upstreamPrompt });
    }
  }, [upstreamPrompt, prompt]);

  const updateData = (updates: any) => {
    const newData = {
      characterId: selectedCharacterId,
      prompt,
      style,
      ...updates
    };
    
    onDataChange(newData);
    return newData;
  };

  const handleCharacterChange = (id: string) => {
    setSelectedCharacterId(id);
    updateData({ characterId: id });
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    updateData({ prompt: newPrompt });
  };

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    updateData({ style: newStyle });
  };

  const styles = [
    { id: "realism", name: "Realism" },
    { id: "anime", name: "Anime" },
    { id: "cartoon", name: "Cartoon" },
    { id: "comic", name: "Comic" },
    { id: "fantasy", name: "Fantasy" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Character
        </label>
        {loading ? (
          <div className="flex items-center justify-center h-12 bg-gray-100 rounded-md">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {characters.map((character) => (
              <Button
                key={character.id}
                type="button"
                onClick={() => handleCharacterChange(character.id)}
                variant={selectedCharacterId === character.id ? "default" : "outline"}
                className="p-2 flex items-center justify-start h-auto"
              >
                {character.avatar && (
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2 bg-gray-200">
                    <img 
                      src={character.avatar} 
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span className="text-sm truncate">{character.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {!upstreamTriggerIsApi && (
        <PromptInput
          initialValue={prompt}
          onChange={handlePromptChange}
          label="Prompt"
          placeholder="Describe the scene or pose for your character..."
          helpText="Be specific about the character pose, background, and other details"
          inputFromPreviousNode={upstreamPrompt}
        />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {styles.map((s) => (
            <Button
              key={s.id}
              variant={style === s.id ? "default" : "outline"}
              onClick={() => handleStyleChange(s.id)}
              className="px-3 py-2 h-auto"
            >
              {s.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}; 