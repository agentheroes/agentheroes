"use client";

import { FC, useState, useEffect } from "react";
import { PromptInput } from "../../shared/prompt-input.component";

interface APIServiceProps {
  initialData: any;
  onDataChange: (data: any) => void;
  upstreamPrompt?: string;
}

export const APIService: FC<APIServiceProps> = ({
  initialData,
  onDataChange,
  upstreamPrompt,
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
        <input
          type="text"
          id="apiUrl"
          value={apiUrl}
          onChange={(e) => handleApiUrlChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://api.example.com/v1/data"
        />
      </div>
      
      <PromptInput
        initialValue={prompt}
        onChange={handlePromptChange}
        label="API Prompt"
        placeholder="Enter a prompt for the API call..."
        helpText="This will be sent as part of the request body"
        inputFromPreviousNode={upstreamPrompt}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Method
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["GET", "POST", "PUT", "DELETE"].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => handleApiMethodChange(method)}
              className={`px-4 py-2 text-sm border rounded-md ${
                apiMethod === method
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          id="requiresAuth"
          type="checkbox"
          checked={requiresAuth}
          onChange={toggleAuthRequired}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="requiresAuth" className="ml-2 block text-sm text-gray-700">
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
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleAuthTypeChange(type.id)}
                  className={`px-4 py-2 text-sm border rounded-md ${
                    authType === type.id
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {type.label}
                </button>
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
            <input
              type="text"
              id="authValue"
              value={authValue}
              onChange={(e) => handleAuthValueChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <button
          onClick={testApi}
          className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}; 