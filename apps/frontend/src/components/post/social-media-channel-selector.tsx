'use client';

import React, { useState, useEffect } from 'react';
import { SocialMedia, useSocialMedia } from '../calendar/social.media.context';
import { SelectableChannelItem } from './selectable-channel-item';
import { Alert, AlertDescription } from "@frontend/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SocialMediaChannelSelectorProps {
  selectedChannels: string[];
  onChange: (selectedChannels: string[]) => void;
}

export function SocialMediaChannelSelector({ 
  selectedChannels, 
  onChange 
}: SocialMediaChannelSelectorProps) {
  const { socials, loading, error } = useSocialMedia();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate selected channels when they change
  useEffect(() => {
    if (selectedChannels.length === 0 && socials.length > 0) {
      setValidationError('At least one channel must be selected');
    } else {
      setValidationError(null);
    }
  }, [selectedChannels, socials]);

  // Handle toggling a channel selection
  const handleToggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      // Remove channel from selection (allow deselecting all channels)
      const newSelectedChannels = selectedChannels.filter(id => id !== channelId);
      onChange(newSelectedChannels);
      
      // Show validation error if no channels are selected
      if (newSelectedChannels.length === 0) {
        setValidationError('At least one channel must be selected');
      }
    } else {
      // Add to selection
      onChange([...selectedChannels, channelId]);
      setValidationError(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-500">Loading channels...</span>
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
    <div className="space-y-2">
      <div className="flex flex-row flex-wrap gap-2 overflow-x-auto py-1">
        {socials.map((channel: SocialMedia) => (
          <SelectableChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannels.includes(channel.id)}
            onToggle={handleToggleChannel}
          />
        ))}
      </div>
    </div>
  );
} 