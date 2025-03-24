"use client";

import { useEffect } from "react";
import { useApiKeyValidation } from "./use-api-key-validation";

/**
 * Custom hook to automatically validate API keys when they're auto-populated
 * @param apiKeys Record of service identifiers to API keys
 * @param validApiKeys Record of service identifiers to validation status
 * @param setValidApiKeys Function to update validation status
 */
export function useAutoValidateApiKeys(
  apiKeys: Record<string, string>,
  validApiKeys: Record<string, boolean>,
  setValidApiKeys: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void
): void {
  const { validateApiKey, validationResults } = useApiKeyValidation();

  // Automatically validate API keys when they're auto-populated
  useEffect(() => {
    const validateAutoPopulatedKeys = async () => {
      for (const [service, key] of Object.entries(apiKeys)) {
        // Only validate keys that are marked as valid in validApiKeys but don't have validation results
        if (validApiKeys[service] && !validationResults[service]) {
          await validateApiKey(service, key);
        }
      }
    };

    validateAutoPopulatedKeys();
  }, [apiKeys, validApiKeys, validateApiKey, validationResults]);
} 