"use client";

import { FC, useState } from "react";
import { GenerateImageConfig } from "./generate-image-config.component";
import { GenerateImagePreview } from "./generate-image-preview.component";

export interface GenerateImageProps {
  nodeId: string;
  nodePath: string;
  onClose?: () => void;
}

export const GenerateImage: FC<GenerateImageProps> = ({ nodeId, nodePath, onClose }) => {
  const [activeTab, setActiveTab] = useState<"config" | "preview">("config");

  return (
    <div className="rounded-lg shadow-sm border border-gray-200 bg-white">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("config")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "config"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "preview"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Preview
          </button>
        </nav>
      </div>

      <div className="p-0">
        {activeTab === "config" ? (
          <GenerateImageConfig nodeId={nodeId} nodePath={nodePath} />
        ) : (
          <GenerateImagePreview nodeId={nodeId} />
        )}
      </div>

      {onClose && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}; 