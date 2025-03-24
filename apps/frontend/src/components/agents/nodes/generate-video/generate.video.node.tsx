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

interface VideoModel {
  label: string;
  model: string;
  category: string;
  identifier: string;
}

interface GenerateVideoState {
  data: {
    prompt: string;
    model: string;
    image: string;
  };
  models: VideoModel[];
  isLoadingModels: boolean;
}

class VideoNodeComponent extends NodeComponent {
  state: GenerateVideoState = {
    data: {
      prompt: "",
      model: "",
      image: "",
    },
    models: [] as VideoModel[],
    isLoadingModels: false,
  };

  async componentDidMount() {
    await this.loadModels();
  }

  async loadModels() {
    this.setState({ isLoadingModels: true });
    try {
      const response = await this.props.fetch("/models");
      if (response.ok) {
        const data = await response.json();
        if (data && data.list && data.list["video"]) {
          const models = data.list["video"];
          this.setState({ 
            models,
            isLoadingModels: false
          });
          
          // Set default model if available
          if (models.length > 0 && !this.state.data.model) {
            this.handleModelSelect(models[0].model);
          }
        }
      }

      if (this.props.node.data) {
        this.setState({
          data: {
            ...this.state.data,
            ...this.props.node.data
          }
        });
      }
    } catch (error) {
      console.error("Error loading video models:", error);
    } finally {
      this.setState({ isLoadingModels: false });
    }
  }

  handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prompt = e.target.value;
    this.setState(
      (prevState: GenerateVideoState) => ({
        data: {
          ...prevState.data,
          prompt,
        },
      })
    );
  };

  handleModelSelect = (modelId: string) => {
    this.setState(
      (prevState: GenerateVideoState) => ({
        data: {
          ...prevState.data,
          model: modelId,
        },
      })
    );
  };

  renderModelSelector() {
    const { models, isLoadingModels, data } = this.state;

    if (isLoadingModels) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner className="mr-2" />
          <span>Loading video models...</span>
        </div>
      );
    }

    if (models.length === 0) {
      return (
        <div className="text-center p-4 border rounded-lg bg-[#2A2A2A]">
          <p className="text-[#F0F0F0]">No video models available</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3">
        {models.map((model) => (
          <div
            key={model.model}
            className={`border border-[#3B3B3B] rounded-lg p-3 cursor-pointer transition-all hover:border-[#FD7302] ${
              data.model === model.model ? 'bg-[#252525] border-[#FD7302]' : ''
            }`}
            onClick={() => this.handleModelSelect(model.model)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F0F0F0]">{model.label}</div>
                <div className="text-sm text-[#A0A0A0] mt-1">Provider: {model.identifier}</div>
              </div>
              {data.model === model.model && (
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
    );
  }

  render(): ReactNode {
    return (
      <NodeWrapperContextProvider
        depth={0}
        values={["prompt", "image"]}
      >
        <Card className="border border-[#3B3B3B] bg-[#151515] w-full">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="block text-[#F0F0F0] mb-2">Video Model</Label>
                {this.renderModelSelector()}
              </div>

              <RenderField property="prompt" exists={false} overrideValues={this.props.values}>
                <div>
                  <Label className="block text-[#F0F0F0] mb-2">Prompt</Label>
                  <Textarea
                    placeholder="Enter a prompt for video generation..."
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
    const selectedModel = this.state.models.find(m => m.model === this.state.data.model);
    const modelName = selectedModel ? selectedModel.label : this.state.data.model;
    
    return `Generate video using ${modelName}${this.state.data.prompt ? ` with prompt: ${this.state.data.prompt}` : ''}`;
  }

  async validate(): Promise<string[] | true> {
    const errors: string[] = [];
    
    if (!this.state.data.model) {
      errors.push("Please select a video model");
    }
    
    // Only validate prompt if it's required and visible
    const promptExists = this.props.values.indexOf('prompt') > -1;
    if (!promptExists && !this.state.data.prompt) {
      errors.push("Please enter a prompt for video generation");
    }
    
    return errors.length ? errors : true;
  }
}

export default nodesHighOrderComponent({
  title: "Generate Video",
  outputs: ["video_url"],
  identifier: "generate-video",
  component: VideoNodeComponent,
  type: NodeType.GENERATE_VIDEO,
});
