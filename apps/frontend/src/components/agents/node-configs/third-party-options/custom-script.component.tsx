"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";
import { Button } from "@frontend/components/ui/button";
import { Textarea } from "@frontend/components/ui/textarea";

interface CustomScriptProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
  nodePathData?: any;
}

export const CustomScript: FC<CustomScriptProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
  nodePathData,
}) => {
  const [scriptContent, setScriptContent] = useState<string>(
    initialData.customScript || "// Write your custom script here\n\n// Example:\n// function processData(data) {\n//   return { processed: data };\n// }"
  );
  const [scriptLanguage, setScriptLanguage] = useState<string>(
    initialData.scriptLanguage || "javascript"
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  
  // Add the API trigger check
  const [requiresAuth, setRequiresAuth] = useState<boolean>(
    initialData.requiresAuth || false
  );
  
  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";
  
  // Update data when upstream prompt changes
  useEffect(() => {
    if (upstreamPrompt && !prompt) {
      setPrompt(upstreamPrompt);
      updateScriptData({ prompt: upstreamPrompt });
    }
  }, [upstreamPrompt, prompt]);
  
  const updateScriptData = (updates: any) => {
    const newData = {
      customScript: scriptContent,
      scriptLanguage,
      prompt,
      ...updates
    };
    
    onDataChange(newData);
    return newData;
  };
  
  const handleScriptChange = (newScript: string) => {
    setScriptContent(newScript);
    updateScriptData({ customScript: newScript });
  };
  
  const handleLanguageChange = (language: string) => {
    setScriptLanguage(language);
    updateScriptData({ scriptLanguage: language });
  };
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    updateScriptData({ prompt: newPrompt });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Script Language
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "javascript", label: "JavaScript" },
            { id: "python", label: "Python" },
            { id: "typescript", label: "TypeScript" }
          ].map((lang) => (
            <Button
              key={lang.id}
              variant={scriptLanguage === lang.id ? "default" : "outline"}
              onClick={() => handleLanguageChange(lang.id)}
            >
              {lang.label}
            </Button>
          ))}
        </div>
      </div>
      
      {!upstreamTriggerIsApi && (
        <PromptInput
          initialValue={prompt}
          onChange={handlePromptChange}
          label="Script Input"
          placeholder="Enter a prompt for the script to use..."
          helpText="This will be available to your script as 'prompt' variable"
          inputFromPreviousNode={upstreamPrompt}
        />
      )}
      
      <div>
        <label
          htmlFor="scriptContent"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Custom Script
        </label>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {scriptLanguage === "javascript" 
                ? "JavaScript" 
                : scriptLanguage === "python" 
                  ? "Python" 
                  : "TypeScript"}
            </span>
            <span className="text-xs text-gray-400">Custom Code Editor</span>
          </div>
          <Textarea
            id="scriptContent"
            value={scriptContent}
            onChange={(e) => handleScriptChange(e.target.value)}
            rows={12}
            className="block w-full border-0 focus:ring-0 focus:outline-none font-mono text-sm p-3"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Write a custom script to process data from the previous steps and prepare it for the next steps.
        </p>
      </div>
      
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800 mb-1">Important Notes:</h4>
        <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
          <li>Custom scripts run in a sandboxed environment.</li>
          <li>The script will receive data from previous steps as input.</li>
          <li>The script should return an object that will be passed to the next step.</li>
          <li>Execution time is limited to 10 seconds.</li>
        </ul>
      </div>
    </div>
  );
}; 