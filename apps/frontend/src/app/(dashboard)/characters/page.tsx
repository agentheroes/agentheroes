import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function CharactersPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Characters</h2>
        <Link href="/character-generator">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Character
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* This would be populated with actual characters from an API */}
        <div className="border border-[#3B3B3B] rounded-lg p-4 text-center flex flex-col items-center justify-center h-64 bg-[#151515]">
          <Plus className="h-12 w-12 text-[#F0F0F0] mb-2" />
          <p className="text-[#F0F0F0]">No characters yet</p>
          <Link href="/character-generator" className="mt-4">
            <Button>Create Your First Character</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
