import { CharacterGenerator } from "@frontend/components/character-generator";
export default function CharactersPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Generate Character</h2>
      <CharacterGenerator />
    </div>
  );
}
