"use client";

import { FC } from "react";
import { NodeButton } from "../../node-button.component";

interface WebhookTriggerProps {
  webhookId: string;
}

export const WebhookTrigger: FC<WebhookTriggerProps> = ({
  webhookId
}) => {
  // Generate a webhook URL for display
  const webhookUrl = webhookId 
    ? `https://api.agentheroes.ai/webhook/${webhookId}` 
    : "Will be generated after saving";

  const copyToClipboard = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="webhookUrl"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Webhook URL
      </label>
      <div className="flex items-center">
        <input
          type="text"
          id="webhookUrl"
          value={webhookUrl}
          readOnly
          className="block w-full rounded-l-md border-r-0 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
        />
        <button
          onClick={copyToClipboard}
          className="rounded-r-md border border-gray-300 px-3 py-2 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Copy
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Send a POST request to this URL to trigger your agent. The webhook accepts JSON payloads with data that can be used in your agent flow.
      </p>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Example JSON Payload</h4>
        <pre className="bg-gray-800 text-gray-200 p-3 rounded-md text-xs overflow-auto">
{`{
  "trigger": "webhook",
  "data": {
    "customField1": "value1",
    "customField2": "value2"
  }
}`}
        </pre>
      </div>
    </div>
  );
}; 