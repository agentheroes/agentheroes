"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@frontend/components/ui/card";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { useApiKeyValidation } from "@frontend/hooks/use-api-key-validation";
import { Spinner } from "@frontend/components/ui/spinner";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ApiKeyFormProps {
  services: string[];
  apiKeys: Record<string, string>;
  onApiKeyChange: (service: string, value: string) => void;
  onValidationChange?: (service: string, isValid: boolean) => void;
  serviceDocs?: Record<string, string>;
}

export function ApiKeyForm({
  services,
  apiKeys,
  onApiKeyChange,
  onValidationChange,
  serviceDocs = {},
}: ApiKeyFormProps) {
  const { validationResults, validateApiKey } = useApiKeyValidation();

  useEffect(() => {
    if (onValidationChange) {
      Object.entries(validationResults).forEach(([service, result]) => {
        onValidationChange(service, result.isValid);
      });
    }
  }, [validationResults, onValidationChange]);

  const handleBlur = (service: string, value: string) => {
    if (value.trim()) {
      validateApiKey(service, value);
    }
  };

  // Get service description and link
  const getServiceInfo = (service: string) => {
    return {
      description: 'Find the API keys here: ',
      link: serviceDocs[service] || ''
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Service Configuration</CardTitle>
        <CardDescription>
          Configure your API keys for the selected AI services. These keys will be used to access various AI models for character generation, video creation, and content generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {services.map((service) => {
          const validation = validationResults[service];
          const isValid = validation?.isValid;
          const isError = validation?.error;
          const serviceInfo = getServiceInfo(service);
          
          return (
            <div key={service}>
              <Label 
                htmlFor={`api-key-${service}`}
                className="text-sm font-medium text-foreground mb-2 block"
              >
                {service.charAt(0).toUpperCase() + service.slice(1)} API Key
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {serviceInfo.description}{' '}
                {serviceInfo.link && (
                  <a 
                    href={`https://${serviceInfo.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Get API Key
                  </a>
                )}
              </p>
              <div className="relative">
                <Input
                  id={`api-key-${service}`}
                  type="password"
                  value={apiKeys[service] || ''}
                  onChange={(e) => onApiKeyChange(service, e.target.value)}
                  onBlur={(e) => handleBlur(service, e.target.value)}
                  className={`w-full pr-10 bg-background/50 border-border/50 ${
                    isError ? 'border-destructive focus:border-destructive' : 
                    isValid ? 'border-primary/50 focus:border-primary' : ''
                  }`}
                  placeholder={`Enter your ${service} API key`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {validation?.isValidating && <Spinner className="text-muted-foreground" />}
                  {isValid && !validation?.isValidating && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                  {isError && !validation?.isValidating && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
              {isError && (
                <p className="text-destructive text-sm mt-1">{validation.error}</p>
              )}
            </div>
          );
        })}
        
        {services.length === 0 && (
          <p className="text-muted-foreground">No API keys required for the selected models</p>
        )}
      </CardContent>
    </Card>
  );
} 