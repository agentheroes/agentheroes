"use client";

import {
  NodeComponent,
  nodesHighOrderComponent,
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ReactNode } from "react";
import { Label } from "@frontend/components/ui/label";
import { Card, CardContent } from "@frontend/components/ui/card";
import { Textarea } from "@frontend/components/ui/textarea";
import { Spinner } from "@frontend/components/ui/spinner";
import { 
  RenderField, 
  NodeWrapperContextProvider 
} from "@frontend/components/agents/node.wrapper.context";

interface Character {
  id: string;
  name: string;
}

interface GenerateCharacterState {
  data: {
    prompt: string;
    character: string;
  };
  characters: Character[];
  isLoadingCharacters: boolean;
}

class CharacterNodeComponent extends NodeComponent {
  state: GenerateCharacterState = {
    data: {
      prompt: "",
      character: "",
    },
    characters: [] as Character[],
    isLoadingCharacters: false,
  };

  async componentDidMount() {
    await this.loadCharacters();
    
    // After characters are loaded, trigger a re-render to make sure everything updates correctly
    this.forceUpdate();
  }

  async loadCharacters() {
    this.setState({ isLoadingCharacters: true });
    try {
      const response = await this.props.fetch("/characters");
      if (response.ok) {
        const data = await response.json();
        const characters = data && data.length > 0 ? data : [];
        
        // First load the node data if it exists
        let nodeData = { ...this.state.data };
        if (this.props.node.data) {
          nodeData = {
            ...nodeData,
            ...this.props.node.data
          };
        }
        
        // If character is not set in node data and characters are available, set the first one
        if (!nodeData.character && characters.length > 0) {
          nodeData.character = characters[0].id;
        }
        
        // Update state with all changes at once
        this.setState({
          characters,
          isLoadingCharacters: false,
          data: nodeData
        });
      }
    } catch (error) {
      console.error("Error loading characters:", error);
      this.setState({ isLoadingCharacters: false });
    }
  }

  handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prompt = e.target.value;
    this.setState(
      (prevState: GenerateCharacterState) => ({
        data: {
          ...prevState.data,
          prompt,
        },
      })
    );
  };

  handleCharacterSelect = (characterId: string) => {
    this.setState(
      (prevState: GenerateCharacterState) => ({
        data: {
          ...prevState.data,
          character: characterId,
        },
      })
    );
  };

  renderCharacterSelector() {
    const { characters, isLoadingCharacters, data } = this.state;

    if (isLoadingCharacters) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner className="mr-2" />
          <span>Loading characters...</span>
        </div>
      );
    }

    if (characters.length === 0) {
      return (
        <div className="text-center p-4 border rounded-lg bg-[#2A2A2A]">
          <p className="text-[#F0F0F0]">No characters available</p>
        </div>
      );
    }

    // Ensure a character is selected if we have characters but none is selected
    if (characters.length > 0 && !data.character) {
      // Use setTimeout to avoid direct state mutation during render
      setTimeout(() => {
        this.handleCharacterSelect(characters[0].id);
      }, 0);
    }

    return (
      <select 
        className="w-full bg-[#2A2A2A] border border-[#3B3B3B] rounded-md p-2 text-[#F0F0F0] focus:border-[#FD7302] focus:ring-1 focus:ring-[#FD7302]"
        value={data.character || ''}
        onChange={(e) => this.handleCharacterSelect(e.target.value)}
      >
        {characters.map(character => (
          <option key={character.id} value={character.id}>
            {character.name}
          </option>
        ))}
      </select>
    );
  }

  render(): ReactNode {
    return (
      <NodeWrapperContextProvider
        depth={0}
        values={["prompt"]}
      >
        <Card className="border border-[#3B3B3B] bg-[#151515] w-full">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="block text-[#F0F0F0] mb-2">Character</Label>
                {this.renderCharacterSelector()}
              </div>

              <RenderField property="prompt" exists={false} overrideValues={this.props.values}>
                <div>
                  <Label className="block text-[#F0F0F0] mb-2">Prompt</Label>
                  <Textarea
                    placeholder="Enter a prompt for character image generation..."
                    className="w-full bg-[#2A2A2A] border border-[#3B3B3B] rounded-md p-2 text-[#F0F0F0] min-h-[100px]"
                    value={this.state.data.prompt}
                    onChange={this.handlePromptChange}
                  />
                </div>
              </RenderField>
            </div>
          </CardContent>
        </Card>
      </NodeWrapperContextProvider>
    );
  }

  renderNode() {
    const character = this.state.characters.find(c => c.id === this.state.data.character);
    const characterName = character ? character.name : this.state.data.character;
    
    return `Generate character image using ${characterName}${this.state.data.prompt ? ` with prompt: ${this.state.data.prompt}` : ''}`;
  }

  async validate(): Promise<string[] | true> {
    const errors: string[] = [];
    
    if (!this.state.data.character) {
      errors.push("Please select a character");
    }
    
    // Only validate prompt if it's required and visible
    const promptExists = this.props.values.indexOf('prompt') > -1;
    if (!promptExists && !this.state.data.prompt) {
      errors.push("Please enter a prompt for character generation");
    }
    
    return errors.length ? errors : true;
  }
}

export default nodesHighOrderComponent({
  title: "Generate Character",
  outputs: ["image_url"],
  identifier: "generate-character",
  component: CharacterNodeComponent,
  type: NodeType.GENERATE_IMAGE,
});
