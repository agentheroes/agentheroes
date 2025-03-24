"use client";

import { useState } from "react";
import { useFetch } from "./use-fetch";

interface ValidationResult {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
}

type ValidationResults = Record<string, ValidationResult>;

export function useApiKeyValidation() {
  const fetch = useFetch();
  const [validationResults, setValidationResults] = useState<ValidationResults>({});

  const validateApiKey = async (provider: string, key: string) => {
    if (!key || key.trim() === "") {
      const newResult = { isValid: false, isValidating: false, error: "API key is required" };
      if (JSON.stringify(validationResults[provider]) !== JSON.stringify(newResult)) {
        setValidationResults(prev => ({
          ...prev,
          [provider]: newResult
        }));
      }
      return false;
    }

    try {
      if (!validationResults[provider]?.isValidating) {
        setValidationResults(prev => ({
          ...prev,
          [provider]: { ...prev[provider], isValidating: true, error: null }
        }));
      }

      const response = await fetch(`/setup/status/${provider}`, {
        method: "POST",
        body: JSON.stringify({ key })
      });

      const data = await response.json();
      const isValid = response.ok && data.valid;
      const newResult = { 
        isValid, 
        isValidating: false, 
        error: isValid ? null : (data.message || "Invalid API key") 
      };

      if (JSON.stringify(validationResults[provider]) !== JSON.stringify(newResult)) {
        setValidationResults(prev => ({
          ...prev,
          [provider]: newResult
        }));
      }

      return isValid;
    } catch (error) {
      const newResult = { 
        isValid: false, 
        isValidating: false, 
        error: "Failed to validate API key" 
      };
      
      if (JSON.stringify(validationResults[provider]) !== JSON.stringify(newResult)) {
        setValidationResults(prev => ({
          ...prev,
          [provider]: newResult
        }));
      }
      return false;
    }
  };

  return {
    validationResults,
    validateApiKey,
    clearValidation: (provider: string) => {
      setValidationResults(prev => {
        const newResults = { ...prev };
        delete newResults[provider];
        return newResults;
      });
    }
  };
} 