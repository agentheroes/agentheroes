"use client";

import { FC, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, treeSlice } from "../store";
import { NodeButton } from "../node-button.component";
import { PromptInput } from "../shared/prompt-input.component";
import { useFetch } from "@frontend/hooks/use-fetch";
import { SocialMediaChannelSelector } from "@frontend/components/post/social-media-channel-selector";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Textarea } from "@frontend/components/ui/textarea";

interface Media {
  id: string;
  type: "IMAGE" | "VIDEO";
  prompt: string;
  media: string;
  createdAt: string;
}

interface PublishConfigProps {
  nodeId: string;
  nodePath: string;
  initialData?: any;
  onClose: () => void;
  nodePathData?: any;
}

export const PublishConfig: FC<PublishConfigProps> = ({
  nodeId,
  nodePath,
  initialData,
  onClose,
  nodePathData,
}) => {
  const dispatch = useAppDispatch();
  const fetch = useFetch();
  
  // Get node data from Redux store
  const node = useAppSelector((state) => 
    state.tree.find(n => n.id === nodeId)
  );
  
  // Get input data from redux store
  const nodeInputs = node?.inputs || {};
  
  // Get workflow path data if available
  const pathData = useAppSelector((state) =>
    state.workflow.pathData[nodePath] || {}
  );
  
  // Check for message content and media from upstream nodes
  const upstreamPrompt = pathData.prompt as string;
  const upstreamMedia = 
    (pathData.images && pathData.images.length > 0 ? pathData.images[0] : null) || 
    (pathData.generatedVideo ? pathData.generatedVideo : null);
  
  // State for publishing data
  const [message, setMessage] = useState<string>(
    nodeInputs.message || ""
  );
  const [mediaUrl, setMediaUrl] = useState<string>(
    nodeInputs.mediaUrl || ""
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    nodeInputs.channels || []
  );
  const [scheduleDate, setScheduleDate] = useState<string>(
    nodeInputs.scheduleDate || ""
  );
  
  // State for media selection
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    nodeInputs.selectedMediaId || null
  );
  
  // Add the API trigger check
  const [url, setUrl] = useState<string>(
    initialData?.url || ""
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";
  
  // Load media items
  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/media?page=1`);
        if (response.ok) {
          const data = await response.json();
          setAllMedia(data.media);
        }
      } catch (error) {
        console.error("Error loading media:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, []);
  
  // Update from upstream data
  useEffect(() => {
    if (upstreamPrompt && !message) {
      setMessage(upstreamPrompt);
      updatePublishConfig({ message: upstreamPrompt });
    }
    
    if (upstreamMedia && !mediaUrl) {
      setMediaUrl(upstreamMedia);
      updatePublishConfig({ mediaUrl: upstreamMedia });
    }
  }, [upstreamPrompt, upstreamMedia, message, mediaUrl]);
  
  const updatePublishConfig = (updates: any) => {
    const newInputs = {
      message,
      mediaUrl,
      channels: selectedChannels,
      scheduleDate,
      selectedMediaId,
      ...updates
    };
    
    // Update node inputs
    dispatch(treeSlice.actions.updateNodeInputs({
      id: nodeId,
      inputs: newInputs
    }));

    // Set outputs for downstream nodes
    const outputs = {
      ...newInputs,
      publishedPostId: 'post-' + Date.now(), // Placeholder for actual post ID
      publishedAt: scheduleDate || new Date().toISOString()
    };

    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs
    }));
    
    return newInputs;
  };
  
  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    updatePublishConfig({ message: newMessage });
  };
  
  const handleChannelsChange = (channels: string[]) => {
    setSelectedChannels(channels);
    updatePublishConfig({ channels });
  };
  
  const handleDateChange = (date: string) => {
    setScheduleDate(date);
    updatePublishConfig({ scheduleDate: date });
  };
  
  const handleMediaSelect = (media: Media | null) => {
    if (media) {
      setSelectedMediaId(media.id);
      setMediaUrl(media.media);
      updatePublishConfig({
        selectedMediaId: media.id,
        mediaUrl: media.media
      });
    } else {
      setSelectedMediaId(null);
      setMediaUrl("");
      updatePublishConfig({
        selectedMediaId: null,
        mediaUrl: ""
      });
    }
  };

  const handleSave = () => {
    // For backward compatibility, still update node.data
    dispatch(treeSlice.actions.updateNodeData({ 
      id: nodeId, 
      data: { 
        message,
        mediaUrl,
        channels: selectedChannels,
        scheduleDate,
        selectedMediaId
      } 
    }));
    
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Social Media Publishing</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Social Media Channels
          </label>
          <SocialMediaChannelSelector
            selectedChannels={selectedChannels}
            onChange={handleChannelsChange}
          />
        </div>
        
        {upstreamTriggerIsApi ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <div className="relative">
              <Textarea
                value="Content will be provided by the API trigger"
                readOnly
                className="bg-gray-50"
                rows={3}
                disabled
              />
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-tr-md">
                From API
              </div>
            </div>
          </div>
        ) : !upstreamPrompt ? (
          <PromptInput
            initialValue={message}
            onChange={handleMessageChange}
            label="Message Content"
            placeholder="Enter your social media post content..."
            helpText="Write your post message here - remember to keep it concise and engaging"
            inputFromPreviousNode={upstreamPrompt}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <div className="relative">
              <Textarea
                value={upstreamPrompt}
                readOnly
                className="bg-gray-50"
                rows={3}
                disabled
              />
              <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-tr-md">
                From Upstream
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Date
          </label>
          <Input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            When should this post be published? Leave empty for immediate posting.
          </p>
        </div>
        
        {upstreamMedia ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Attachment
            </label>
            <div className="mt-1 border border-gray-300 rounded-md p-2 bg-gray-50">
              <div className="aspect-video relative bg-gray-200 rounded overflow-hidden">
                {upstreamMedia.endsWith('.mp4') ? (
                  <video
                    src={upstreamMedia}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={upstreamMedia} 
                    alt="Media to publish" 
                    className="w-full h-full object-contain"
                  />
                )}
                <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-md">
                  From Upstream
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Media
            </label>
            {loading ? (
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : allMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allMedia.slice(0, 6).map((media) => (
                  <Button
                    key={media.id}
                    type="button"
                    variant={selectedMediaId === media.id ? "default" : "outline"}
                    onClick={() => handleMediaSelect(media)}
                    className="p-0 h-auto overflow-hidden aspect-video relative"
                  >
                    {media.type === "VIDEO" ? (
                      <video 
                        src={media.media} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={media.media} 
                        alt={media.prompt} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selectedMediaId === media.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-500">No media found. Generate some images or videos first.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton 
          onClick={handleSave} 
          variant="primary"
        >
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 