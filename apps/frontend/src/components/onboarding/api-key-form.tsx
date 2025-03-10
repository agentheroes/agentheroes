import { Card } from "@frontend/components/ui/card";
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
}

export function ApiKeyForm({
  services,
  apiKeys,
  onApiKeyChange,
  onValidationChange,
}: ApiKeyFormProps) {
  const { validationResults, validateApiKey } = useApiKeyValidation();

  // Validate on blur
  const handleBlur = async (service: string, value: string) => {
    if (value.trim()) {
      const isValid = await validateApiKey(service, value);
      onValidationChange?.(service, isValid);
    }
  };

  // Update parent component when validation results change
  useEffect(() => {
    services.forEach(service => {
      const result = validationResults[service];
      if (result && !result.isValidating) {
        onValidationChange?.(service, result.isValid);
      }
    });
  }, [validationResults, services, onValidationChange]);

  // Validate auto-populated API keys when component mounts
  useEffect(() => {
    services.forEach(service => {
      const apiKey = apiKeys[service];
      if (apiKey && !validationResults[service]) {
        // Only validate if we have an API key and it hasn't been validated yet
        validateApiKey(service, apiKey);
      }
    });
  }, [services, apiKeys, validationResults, validateApiKey]);

  return (
    <Card className="p-6">
      {services.map((service) => {
        const validation = validationResults[service];
        
        return (
          <div key={service} className="mb-4">
            <Label htmlFor={`api-key-${service}`} className="block mb-2">
              {service.charAt(0).toUpperCase() + service.slice(1)} API Key
            </Label>
            <div className="relative">
              <Input
                id={`api-key-${service}`}
                type="password"
                value={apiKeys[service] || ''}
                onChange={(e) => onApiKeyChange(service, e.target.value)}
                onBlur={(e) => handleBlur(service, e.target.value)}
                className={`w-full pr-10 ${validation?.error ? 'border-red-500' : validation?.isValid ? 'border-green-500' : ''}`}
                placeholder={`Enter your ${service} API key`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {validation?.isValidating && <Spinner size="sm" />}
                {validation?.isValid && !validation.isValidating && <CheckCircle className="h-5 w-5 text-green-500" />}
                {validation?.error && !validation.isValidating && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
            {validation?.error && (
              <p className="text-red-500 text-sm mt-1">{validation.error}</p>
            )}
          </div>
        );
      })}
      
      {services.length === 0 && (
        <p className="text-gray-500">No API keys required for the selected models</p>
      )}
    </Card>
  );
} 