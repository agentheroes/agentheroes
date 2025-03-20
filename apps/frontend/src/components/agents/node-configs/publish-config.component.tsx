"use client";

import { FC, useState } from "react";
import { useAppDispatch } from "../store";
import { treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

interface PublishConfigProps {
  nodeId: string;
  initialData: any;
  onClose: () => void;
}

type PublishPlatform = "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok";
type PublishTime = "now" | "scheduled";

export const PublishConfig: FC<PublishConfigProps> = ({
  nodeId,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [selectedPlatforms, setSelectedPlatforms] = useState<PublishPlatform[]>(
    initialData.platforms || ["twitter"]
  );
  const [publishTime, setPublishTime] = useState<PublishTime>(
    initialData.publishTime || "now"
  );
  const [scheduleDate, setScheduleDate] = useState<string>(
    initialData.scheduleDate || ""
  );
  const [caption, setCaption] = useState<string>(
    initialData.caption || ""
  );
  const [hashtags, setHashtags] = useState<string>(
    initialData.hashtags || ""
  );

  const togglePlatform = (platform: PublishPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  const handleSave = () => {
    const data = {
      platforms: selectedPlatforms,
      publishTime,
      scheduleDate: publishTime === "scheduled" ? scheduleDate : null,
      caption,
      hashtags,
    };
    
    dispatch(treeSlice.actions.updateNodeData({ id: nodeId, data }));
    onClose();
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Publication</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Publishing Platforms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "twitter", label: "Twitter" },
            { id: "instagram", label: "Instagram" },
            { id: "linkedin", label: "LinkedIn" },
            { id: "facebook", label: "Facebook" },
            { id: "tiktok", label: "TikTok" }
          ].map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id as PublishPlatform)}
              className={`px-4 py-2 text-sm border rounded-md ${
                selectedPlatforms.includes(platform.id as PublishPlatform)
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>
        {selectedPlatforms.length === 0 && (
          <p className="text-xs text-red-500 mt-1">
            Please select at least one platform
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Publish Time
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPublishTime("now")}
            className={`px-4 py-2 text-sm border rounded-md ${
              publishTime === "now"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => setPublishTime("scheduled")}
            className={`px-4 py-2 text-sm border rounded-md ${
              publishTime === "scheduled"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Schedule
          </button>
        </div>
      </div>

      {publishTime === "scheduled" && (
        <div className="mb-4">
          <label
            htmlFor="scheduleDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule Date & Time
          </label>
          <input
            type="datetime-local"
            id="scheduleDate"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="caption"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Caption
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Write your post caption here..."
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="hashtags"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Hashtags
        </label>
        <input
          type="text"
          id="hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="#content #ai #generated"
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton onClick={handleSave} variant="primary">
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 