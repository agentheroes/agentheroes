"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";
import { Input } from "@frontend/components/ui/input";
import { Textarea } from "@frontend/components/ui/textarea";
import { Button } from "@frontend/components/ui/button";
import { Checkbox } from "@frontend/components/ui/checkbox";
import { Select } from "@frontend/components/ui/select";

interface RSSFeedProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
  nodePathData?: any; // Add this to receive more path data
}

export const RSSFeed: FC<RSSFeedProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
  nodePathData,
}) => {
  const [feedUrl, setFeedUrl] = useState<string>(
    initialData.feedUrl || ""
  );
  const [promptTemplate, setPromptTemplate] = useState<string>(
    initialData.promptTemplate || "Latest from {title}: {description}"
  );
  const [useLatestOnly, setUseLatestOnly] = useState<boolean>(
    initialData.useLatestOnly !== undefined ? initialData.useLatestOnly : true
  );
  const [maxItems, setMaxItems] = useState<number>(
    initialData.maxItems || 1
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";
  
  // Debug logs
  console.log("RSS Feed nodePathData:", nodePathData);
  console.log("RSS Feed upstreamTriggerIsApi:", upstreamTriggerIsApi);
  
  // Update data when upstream prompt changes
  useEffect(() => {
    if (upstreamPrompt && !promptTemplate) {
      setPromptTemplate(upstreamPrompt);
      updateRssData({ promptTemplate: upstreamPrompt });
    }
  }, [upstreamPrompt, promptTemplate]);
  
  const updateRssData = (updates: any) => {
    const newData = {
      feedUrl,
      promptTemplate,
      useLatestOnly,
      maxItems,
      ...updates
    };
    
    onDataChange(newData);
    return newData;
  };
  
  const handleFeedUrlChange = (newUrl: string) => {
    setFeedUrl(newUrl);
    updateRssData({ feedUrl: newUrl });
  };
  
  const handlePromptTemplateChange = (newTemplate: string) => {
    setPromptTemplate(newTemplate);
    updateRssData({ promptTemplate: newTemplate });
  };
  
  const toggleUseLatestOnly = () => {
    const newValue = !useLatestOnly;
    setUseLatestOnly(newValue);
    updateRssData({ useLatestOnly: newValue });
  };
  
  const handleMaxItemsChange = (newMaxItems: number) => {
    setMaxItems(newMaxItems);
    updateRssData({ maxItems: newMaxItems });
  };
  
  const testRssFeed = () => {
    alert(`RSS Feed test request would be sent to: ${feedUrl}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="feedUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          RSS Feed URL
        </label>
        <Input
          type="text"
          id="feedUrl"
          value={feedUrl}
          onChange={(e) => handleFeedUrlChange(e.target.value)}
          placeholder="https://example.com/feed.xml"
        />
      </div>
      
      {/* Show different prompt UI based on trigger type */}
      {upstreamTriggerIsApi ? (
        <div>
          <label
            htmlFor="promptTemplate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Prompt Template
          </label>
          <div className="relative">
            <Textarea
              id="promptTemplate"
              value="Content will be provided by the API trigger at runtime"
              readOnly
              rows={3}
              disabled
            />
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-tr-md">
              From API
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The prompt will be provided by the API trigger when this workflow runs.
          </p>
        </div>
      ) : (
        <div>
          <label
            htmlFor="promptTemplate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Prompt Template
          </label>
          <Textarea
            id="promptTemplate"
            value={promptTemplate}
            onChange={(e) => handlePromptTemplateChange(e.target.value)}
            rows={3}
            className="w-full"
            placeholder="Latest from {title}: {description}"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {'{title}'}, {'{description}'}, {'{link}'}, {'{pubDate}'} as placeholders that will be replaced with RSS feed data.
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="useLatestOnly"
          checked={useLatestOnly}
          onCheckedChange={toggleUseLatestOnly}
        />
        <label
          htmlFor="useLatestOnly"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Use latest item(s) only
        </label>
      </div>
      
      {useLatestOnly && (
        <div className="pl-6">
          <label
            htmlFor="maxItems"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Number of latest items to fetch
          </label>
          <Select
            id="maxItems"
            value={maxItems.toString()}
            onChange={(e) => handleMaxItemsChange(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 10].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </Select>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          onClick={testRssFeed}
          className="w-full"
        >
          Test RSS Feed
        </Button>
      </div>
    </div>
  );
}; 