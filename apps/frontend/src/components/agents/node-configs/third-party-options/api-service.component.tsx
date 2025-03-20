"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import { Checkbox } from "@frontend/components/ui/checkbox";

interface APIServiceProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
  nodePathData?: any;
}

export const APIService: FC<APIServiceProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
  nodePathData,
}) => {
  const [apiUrl, setApiUrl] = useState<string>(
    initialData.apiUrl || "https://"
  );
  const [apiMethod, setApiMethod] = useState<string>(
    initialData.apiMethod || "GET"
  );
  const [prompt, setPrompt] = useState<string>(
    initialData.prompt || ""
  );
  const [requiresAuth, setRequiresAuth] = useState<boolean>(
    initialData.requiresAuth || false
  );
  const [authType, setAuthType] = useState<string>(
    initialData.authType || "bearer"
  );
  const [authValue, setAuthValue] = useState<string>(
    initialData.authValue || ""
  );

  // Check if the upstream trigger is of type "API"
  const upstreamTriggerIsApi = nodePathData?.triggerType === "api";

  // Update data when upstream prompt changes
  useEffect(() => {
    if (upstreamPrompt && !prompt) {
      setPrompt(upstreamPrompt);
      updateApiData({ prompt: upstreamPrompt });
    }
  }, [upstreamPrompt, prompt]);

  // Handler for updating all API related data
  const updateApiData = (updates: any) => {
    const newData = {
      apiUrl,
      apiMethod,
      prompt,
      requiresAuth,
      authType,
      authValue,
      ...updates
    };
    
    onDataChange(newData);
    return newData;
  };

  const handleApiUrlChange = (newUrl: string) => {
    setApiUrl(newUrl);
    updateApiData({ apiUrl: newUrl });
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    updateApiData({ prompt: newPrompt });
  };

  const handleApiMethodChange = (newMethod: string) => {
    setApiMethod(newMethod);
    updateApiData({ apiMethod: newMethod });
  };

  const toggleAuthRequired = () => {
    const newRequiresAuth = !requiresAuth;
    setRequiresAuth(newRequiresAuth);
    updateApiData({ requiresAuth: newRequiresAuth });
  };

  const handleAuthTypeChange = (newType: string) => {
    setAuthType(newType);
    updateApiData({ authType: newType });
  };

  const handleAuthValueChange = (newValue: string) => {
    setAuthValue(newValue);
    updateApiData({ authValue: newValue });
  };

  const testApi = () => {
    // In a real app, this would make a test request to the API
    alert(`API test request would be sent to: ${apiUrl}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="apiUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          API URL
        </label>
        <Input
          type="text"
          id="apiUrl"
          value={apiUrl}
          onChange={(e) => handleApiUrlChange(e.target.value)}
          placeholder="https://api.example.com/v1/data"
        />
      </div>
      
      {!upstreamTriggerIsApi && (
        <PromptInput
          initialValue={prompt}
          onChange={handlePromptChange}
          label="API Prompt"
          placeholder="Enter a prompt for the API call..."
          helpText="This will be sent as part of the request body"
          inputFromPreviousNode={upstreamPrompt}
        />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Method
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["GET", "POST", "PUT", "DELETE"].map((method) => (
            <Button
              key={method}
              type="button"
              variant={apiMethod === method ? "default" : "outline"}
              onClick={() => handleApiMethodChange(method)}
            >
              {method}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="requiresAuth"
          checked={requiresAuth}
          onCheckedChange={toggleAuthRequired}
        />
        <label 
          htmlFor="requiresAuth" 
          className="text-sm text-gray-700 cursor-pointer"
        >
          Requires Authentication
        </label>
      </div>
      
      {requiresAuth && (
        <div className="pl-4 border-l-2 border-indigo-100 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authentication Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bearer", label: "Bearer Token" },
                { id: "basic", label: "Basic Auth" },
                { id: "api-key", label: "API Key" }
              ].map((type) => (
                <Button
                  key={type.id}
                  type="button"
                  variant={authType === type.id ? "default" : "outline"}
                  onClick={() => handleAuthTypeChange(type.id)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label
              htmlFor="authValue"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {authType === "bearer" 
                ? "Token" 
                : authType === "basic" 
                  ? "Credentials (username:password)" 
                  : "API Key"}
            </label>
            <Input
              type="text"
              id="authValue"
              value={authValue}
              onChange={(e) => handleAuthValueChange(e.target.value)}
              placeholder={authType === "bearer" 
                ? "Bearer token" 
                : authType === "basic" 
                  ? "username:password" 
                  : "API key value"}
            />
            {authType === "basic" && (
              <p className="text-xs text-gray-500 mt-1">
                Format: username:password
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          onClick={testApi}
          variant="outline"
          className="w-full"
        >
          Test API Connection
        </Button>
      </div>
    </div>
  );
}; 