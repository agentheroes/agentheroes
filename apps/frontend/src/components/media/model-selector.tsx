"use client";

import { useCallback } from "react";
import { Spinner } from "@frontend/components/ui/spinner";

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

interface ModelSelectorProps {
  mode: "character" | "normal-image";
  characters: Character[];
  normalModels: NormalModel[];
  selectedCharacter: string;
  selectedNormalModel: string;
  isLoadingNormalModels: boolean;
  onCharacterSelect: (characterId: string) => void;
  onNormalModelSelect: (modelId: string) => void;
}

export function ModelSelector({
  mode,
  characters,
  normalModels,
  selectedCharacter,
  selectedNormalModel,
  isLoadingNormalModels,
  onCharacterSelect,
  onNormalModelSelect
}: ModelSelectorProps) {
  
  const handleCharacterSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onCharacterSelect(e.target.value);
  }, [onCharacterSelect]);
  
  const handleNormalModelSelect = useCallback((model: string) => {
    onNormalModelSelect(model);
  }, [onNormalModelSelect]);
  
  return (
    <div className="mb-6">
      <label className="block text-[#F0F0F0] mb-2">Source Type</label>
      <div>
        {mode === "character" ? (
          <div className="flex justify-between">
            <div className="flex-1">
              <select 
                className="w-full bg-[#2A2A2A] border border-[#3B3B3B] rounded-md p-2 text-[#F0F0F0] focus:border-[#FD7302] focus:ring-1 focus:ring-[#FD7302]"
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
        ) : (
          <>
            {isLoadingNormalModels ? (
              <div className="flex items-center justify-center p-4">
                <Spinner className="mr-2" />
                <span>Loading models...</span>
              </div>
            ) : (
              <>
                {normalModels.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {normalModels.map((model) => (
                      <div
                        key={model.model}
                        className={`border border-[#3B3B3B] rounded-lg p-3 cursor-pointer transition-all hover:border-[#FD7302] ${
                          selectedNormalModel === model.model ? 'bg-[#252525] border-[#FD7302]' : ''
                        }`}
                        onClick={() => handleNormalModelSelect(model.model)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[#F0F0F0]">{model.label}</div>
                            <div className="text-sm text-[#A0A0A0] mt-1">Provider: {model.identifier}</div>
                          </div>
                          {selectedNormalModel === model.model && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#353535] text-[#FD7302]">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-lg bg-[#2A2A2A]">
                    <p className="text-[#F0F0F0]">No models available</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 