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
import { Alert, AlertDescription } from "@frontend/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  RenderField, 
  NodeWrapperContextProvider 
} from "@frontend/components/agents/node.wrapper.context";

interface SocialMedia {
  id: string;
  identifier: string;
  currentInternalId: string;
  rootInternalId: string;
  name: string;
  profilePic: string;
  shouldRefresh: boolean;
  selectionRequired: boolean;
}

interface SocialMediaNodeState {
  data: {
    text: string;
    selectedChannels: string[];
    media: string;
  };
  socials: SocialMedia[];
  isLoadingSocials: boolean;
  error: string | null;
}

class SocialMediaNodeComponent extends NodeComponent {
  state: SocialMediaNodeState = {
    data: {
      text: "",
      selectedChannels: [],
      media: "",
    },
    socials: [],
    isLoadingSocials: false,
    error: null,
  };

  async componentDidMount() {
    await this.loadSocialChannels();
    
    if (this.props.node.data) {
      this.setState({
        data: {
          ...this.state.data,
          ...this.props.node.data
        }
      });
    }
  }

  async loadSocialChannels() {
    this.setState({ isLoadingSocials: true, error: null });
    try {
      const response = await this.props.fetch("/socials");
      if (response.ok) {
        const data = await response.json();
        // Make sure shouldRefresh and selectionRequired are properly typed as booleans
        const typedData = data.map((social: any) => ({
          ...social,
          shouldRefresh: Boolean(social.shouldRefresh),
          selectionRequired: Boolean(social.selectionRequired)
        }));
        
        this.setState({ 
          socials: typedData,
          isLoadingSocials: false
        });
        
        // If we have channels and none are selected, select the first one by default
        if (typedData.length > 0 && this.state.data.selectedChannels.length === 0) {
          this.handleChannelToggle(typedData[0].id);
        }
      } else {
        this.setState({
          error: "Failed to load social media channels",
          isLoadingSocials: false
        });
      }
    } catch (error) {
      console.error("Error loading social channels:", error);
      this.setState({
        error: "Failed to load social media channels",
        isLoadingSocials: false
      });
    }
  }

  handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    this.setState(
      (prevState: SocialMediaNodeState) => ({
        data: {
          ...prevState.data,
          text,
        },
      })
    );
  };

  handleChannelToggle = (channelId: string) => {
    this.setState(
      (prevState: SocialMediaNodeState) => {
        const selectedChannels = [...prevState.data.selectedChannels];
        
        if (selectedChannels.includes(channelId)) {
          // Remove if already selected
          return {
            data: {
              ...prevState.data,
              selectedChannels: selectedChannels.filter(id => id !== channelId),
            },
          };
        } else {
          // Add if not selected
          return {
            data: {
              ...prevState.data,
              selectedChannels: [...selectedChannels, channelId],
            },
          };
        }
      }
    );
  };

  renderChannelSelector() {
    const { socials, isLoadingSocials, error, data } = this.state;

    if (isLoadingSocials) {
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner className="mr-2" />
          <span>Loading social media channels...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (socials.length === 0) {
      return (
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No social media channels available. Please add channels in the settings.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="flex flex-row flex-wrap gap-3">
        {socials.map((channel) => (
          <div 
            key={channel.id}
            onClick={() => this.handleChannelToggle(channel.id)}
            className={`
              border border-[#3B3B3B] rounded-lg p-3 cursor-pointer transition-all
              hover:border-[#FD7302]
              ${data.selectedChannels.includes(channel.id) ? 'bg-[#252525] border-[#FD7302]' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 relative">
                {/* Profile Picture */}
                <img 
                  src={channel.profilePic}
                  alt={`${channel.name}'s profile picture`}
                  className="w-full h-full bg-cover rounded-full"
                  onError={(e) => {
                    // Fallback for image load errors
                    (e.target as HTMLImageElement).src = '/social-placeholder.png';
                  }}
                />
                
                {/* Social Media Icon Overlay */}
                <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 rounded-full overflow-hidden">
                  <img 
                    src={`/socials/${channel.identifier}.png`}
                    alt={`${channel.identifier} icon`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/social-placeholder.png';
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="font-medium text-[#F0F0F0]">{channel.name}</div>
              </div>
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
        values={["text", "media"]}
      >
        <Card className="border border-[#3B3B3B] bg-[#151515] w-full">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="block text-[#F0F0F0] mb-2">Social Media Channels</Label>
                {this.renderChannelSelector()}
                {this.state.data.selectedChannels.length === 0 && (
                  <div className="text-sm text-red-500 mt-1">
                    At least one channel must be selected
                  </div>
                )}
              </div>

              <RenderField property="prompt" exists={false} overrideValues={this.props.values}>
                <div>
                  <Label className="block text-[#F0F0F0] mb-2">Post Text</Label>
                  <Textarea
                    placeholder="Enter text for your social media post..."
                    className="w-full bg-[#2A2A2A] border border-[#3B3B3B] rounded-md p-2 text-[#F0F0F0] min-h-[100px]"
                    value={this.state.data.text}
                    onChange={this.handleTextChange}
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
    const { selectedChannels, text } = this.state.data;
    const channelCount = selectedChannels.length;
    const channelNames = selectedChannels.map(id => {
      const channel = this.state.socials.find(s => s.id === id);
      return channel ? channel.name : id;
    }).join(', ');
    
    if (channelCount === 0) {
      return 'Post to social media (no channels selected)';
    }
    
    return `Post to ${channelNames} ${text ? `with text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"` : ''}`;
  }

  async validate(): Promise<string[] | true> {
    const errors: string[] = [];
    
    if (this.state.data.selectedChannels.length === 0) {
      errors.push("Please select at least one social media channel");
    }
    
    // Only validate text if it's required and visible
    const textExists = this.props.values.indexOf('prompt') > -1;
    if (!textExists && !this.state.data.text) {
      errors.push("Please enter text for your social media post");
    }
    
    return errors.length ? errors : true;
  }
}

export default nodesHighOrderComponent({
  title: "Social Media",
  outputs: [],
  identifier: "social-media",
  component: SocialMediaNodeComponent,
  type: NodeType.PUBLISH,
});
