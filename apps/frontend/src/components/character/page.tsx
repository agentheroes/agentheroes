"use client";

import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { Plus, Trash2, User, Clock, CheckCircle, AlertCircle, Image } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Card } from "@frontend/components/ui/card";
import { useToast } from "@frontend/hooks/use-toast";
import { GenerateMediaButton } from "./generate-media-button";

type CharacterStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface Character {
  id: string;
  name: string;
  description?: string;
  avatar: string;
  status: CharacterStatus;
  // Add other character properties as needed
}

export function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fetch = useFetch();
  const { toast } = useToast();

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/characters");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load characters",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading characters:", error);
      toast({
        title: "Error",
        description: "Failed to load characters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      // First click - ask for confirmation
      setDeleteConfirm(id);
      return;
    }

    try {
      const response = await fetch(`/characters/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Character deleted successfully",
        });
        // Refresh the character list
        loadCharacters();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete character",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Cancel delete confirmation if clicked elsewhere
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get status icon and color based on character status
  const getStatusInfo = (status: CharacterStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "In Progress",
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/10"
        };
      case "COMPLETED":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Completed",
          color: "text-green-400",
          bgColor: "bg-green-400/10"
        };
      case "FAILED":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Failed",
          color: "text-red-400",
          bgColor: "bg-red-400/10"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Unknown",
          color: "text-gray-400",
          bgColor: "bg-gray-400/10"
        };
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto" onClick={cancelDelete}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Characters</h2>
        <div className="flex gap-2">
          <Link href="/characters/upload">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create from Existing Files
            </Button>
          </Link>
          <Link href="/characters/generate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Character
            </Button>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading characters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.length > 0 ? (
            characters.map((character) => (
              <Card 
                key={character.id} 
                className="border border-[#3B3B3B] rounded-lg pt-4 pl-4 pr-4 flex flex-col bg-[#151515] relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F0F0F0]">{character.name}</h3>
                    {character.status && (
                      <div className={`flex items-center mt-1 px-2 py-1 rounded-full text-xs ${getStatusInfo(character.status).bgColor} ${getStatusInfo(character.status).color} w-fit`}>
                        {getStatusInfo(character.status).icon}
                        <span className="ml-1">{getStatusInfo(character.status).label}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <GenerateMediaButton 
                      characterId={character.id}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 !p-0"
                    />
                    <Button
                      variant={deleteConfirm === character.id ? "destructive" : "ghost"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(character.id);
                      }}
                      className="h-8 w-8 !p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="-mx-4 mt-4 flex-grow flex items-center justify-center">
                  {character.avatar ? (
                    <div className="w-full h-32 overflow-hidden border-2 border-[#3B3B3B]">
                      <img 
                        src={character.avatar} 
                        alt={character.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          // (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23F0F0F0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                      <User className="h-16 w-16 text-[#F0F0F0]" />
                    </div>
                  )}
                </div>
                
                {character.description && (
                  <p className="text-[#A0A0A0] mt-4 line-clamp-2 text-center">{character.description}</p>
                )}
                
                {deleteConfirm === character.id && (
                  <div 
                    className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-white mb-4 text-center">Are you sure you want to delete this character?</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(character.id);
                        }}
                      >
                        Delete
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="border border-[#3B3B3B] rounded-lg p-4 text-center flex flex-col items-center justify-center h-64 bg-[#151515] col-span-full">
              <Plus className="h-12 w-12 text-[#F0F0F0] mb-2" />
              <p className="text-[#F0F0F0]">No characters yet</p>
              <Link href="/characters/generate" className="mt-4">
                <Button>Create Your First Character</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
