"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { ModelSelectionCard } from "./model-selection-card";
import { ApiKeyForm } from "./api-key-form";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAutoValidateApiKeys } from "@frontend/hooks/use-auto-validate-api-keys";

export interface OnboardingFormProps {
  onComplete?: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [generationData, setGenerationData] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<Record<string, string[]>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [requiredServices, setRequiredServices] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validApiKeys, setValidApiKeys] = useState<Record<string, boolean>>({});

  // Use the auto-validate hook to validate auto-populated API keys
  useAutoValidateApiKeys(apiKeys, validApiKeys, setValidApiKeys);

  // Fetch generation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/setup");
        if (response.ok) {
          const responseData = await response.json();
          
          // Type assertion for the entire data object
          const data = responseData as {
            models: Array<{
              organizationId: string;
              container: string;
              models: string;
              apiKey: string;
            }>;
            list: Record<string, Array<{
              identifier: string;
              model: string;
              label: string;
              category: string;
            }>>;
          };
          
          setGenerationData(data);
          
          // Populate form with existing data if available
          if (data.models && Array.isArray(data.models) && data.models.length > 0) {
            // Initialize selected models from existing data
            const initialSelectedModels: Record<string, string[]> = {};
            const initialApiKeys: Record<string, string> = {};
            const initialValidApiKeys: Record<string, boolean> = {};
            
            // Process each model configuration
            for (let i = 0; i < data.models.length; i++) {
              const modelConfig = data.models[i] as {
                organizationId: string;
                container: string;
                models: string;
                apiKey: string;
              };
              
              // Parse the models JSON string if needed
              const modelsList = typeof modelConfig.models === 'string' 
                ? JSON.parse(modelConfig.models) 
                : modelConfig.models;
              
              // Find which categories these models belong to
              if (data.list) {
                for (const category in data.list) {
                  if (Object.prototype.hasOwnProperty.call(data.list, category)) {
                    const categoryModels = data.list[category] as Array<{
                      identifier: string;
                      model: string;
                      label: string;
                      category: string;
                    }>;
                    
                    // Filter models that belong to this provider and category
                    const categoryModelIds: string[] = [];
                    for (const model of categoryModels) {
                      if (model.identifier === modelConfig.container && modelsList.includes(model.model)) {
                        categoryModelIds.push(model.model);
                      }
                    }
                    
                    // Add to selected models if any found
                    if (categoryModelIds.length > 0) {
                      initialSelectedModels[category] = [
                        ...(initialSelectedModels[category] || []),
                        ...categoryModelIds
                      ];
                    }
                  }
                }
              }
              
              // Store API key
              initialApiKeys[modelConfig.container] = modelConfig.apiKey;
              // Mark API key as valid since it's from the server
              initialValidApiKeys[modelConfig.container] = true;
            }
            
            // Update state with the populated data
            setSelectedModels(initialSelectedModels);
            setApiKeys(initialApiKeys);
            setValidApiKeys(initialValidApiKeys);
          }
        }
      } catch (error) {
        console.error("Error fetching setup data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetch]);

  // Update required services when selected models change
  useEffect(() => {
    const services = new Set<string>();
    
    Object.values(selectedModels).flat().forEach(modelId => {
      // Find the service for this model
      if (generationData?.list) {
        Object.values(generationData.list).forEach((categoryModels: any) => {
          categoryModels.forEach((model: any) => {
            if (model.model === modelId) {
              services.add(model.identifier);
            }
          });
        });
      }
    });
    
    setRequiredServices(services);
  }, [selectedModels, generationData]);

  const handleModelSelection = (category: string, modelId: string) => {
    setSelectedModels(prev => {
      const currentSelected = prev[category] || [];
      
      // If already selected, remove it
      if (currentSelected.includes(modelId)) {
        return {
          ...prev,
          [category]: currentSelected.filter(id => id !== modelId)
        };
      }
      
      // Otherwise add it
      return {
        ...prev,
        [category]: [...currentSelected, modelId]
      };
    });
    
    // Clear validation error when user makes a selection
    setValidationError(null);
  };

  const handleApiKeyChange = (service: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
    
    // Reset validation status when key changes
    setValidApiKeys(prev => ({
      ...prev,
      [service]: false
    }));
  };

  const handleValidationChange = (service: string, isValid: boolean) => {
    // Prevent unnecessary state updates if the value hasn't changed
    if (validApiKeys[service] !== isValid) {
      setValidApiKeys(prev => ({
        ...prev,
        [service]: isValid
      }));
      
      // Clear validation error when a key becomes valid
      if (isValid) {
        setValidationError(null);
      }
    }
  };

  const handleNext = () => {
    // Validate that each category has at least one model selected
    const missingCategories = Object.values(GenerationCategory).filter(category => {
      // Check if the category has models available
      const hasAvailableModels = generationData?.list?.[category]?.length > 0;
      // If models are available, check if at least one is selected
      return hasAvailableModels && (!selectedModels[category] || selectedModels[category].length === 0);
    });
    
    if (missingCategories.length > 0) {
      const formattedCategories = missingCategories.map(category => 
        category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      ).join(', ');
      
      setValidationError(`Please select at least one model for each category: ${formattedCategories}`);
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async () => {
    // Check if all API keys are valid
    const invalidServices = Array.from(requiredServices).filter(
      service => !validApiKeys[service]
    );
    
    if (invalidServices.length > 0) {
      const formattedServices = invalidServices.map(service => 
        service.charAt(0).toUpperCase() + service.slice(1)
      ).join(', ');
      
      setValidationError(`Please provide valid API keys for: ${formattedServices}`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert Set to Array to avoid iterator issues
      const requiredServicesArray = Array.from(requiredServices);
      
      // Format the data according to SetupDto
      const setupData = {
        list: requiredServicesArray.map(identifier => ({
          identifier,
          apiKey: apiKeys[identifier],
          models: Object.entries(selectedModels)
            .flatMap(([category, modelIds]) => 
              modelIds.filter(modelId => {
                // Find if this model belongs to the current service
                if (generationData?.list) {
                  for (const categoryModels of Object.values(generationData.list)) {
                    for (const model of categoryModels as any) {
                      if (model.model === modelId && model.identifier === identifier) {
                        return true;
                      }
                    }
                  }
                }
                return false;
              })
            )
        }))
      };
      
      // Send the data to the backend
      const response = await fetch("/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setupData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings");
      }
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Redirect or show success message
        alert("Onboarding completed successfully!");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setValidationError(error.message || "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check if each category with available models has at least one selection
  const allCategoriesHaveSelection = Object.values(GenerationCategory).every(category => {
    // Check if the category has models available
    const hasAvailableModels = generationData?.list?.[category]?.length > 0;
    // If no models are available, we don't require a selection
    if (!hasAvailableModels) return true;
    // If models are available, check if at least one is selected
    return selectedModels[category]?.length > 0;
  });

  const allRequiredKeysProvided = Array.from(requiredServices).every(
    service => apiKeys[service] && validApiKeys[service]
  );

  return (
    <div className="space-y-8">
      {step === 1 ? (
        <>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Select AI Models</h2>
                <p className="text-muted-foreground">
                  Choose the AI models you want to use for character generation, video creation, and content generation
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Step 1 of 2
              </div>
            </div>
            
            {validationError && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            {Object.values(GenerationCategory).map((category) => {
              const hasModels = generationData?.list?.[category]?.length > 0;
              const hasSelection = selectedModels[category]?.length > 0;
              const isRequired = hasModels && !hasSelection;
              
              return (
                <div key={category}>
                  {isRequired && (
                    <div className="text-destructive text-sm mb-1">* Required - Select at least one model</div>
                  )}
                  <ModelSelectionCard
                    category={category}
                    models={generationData?.list?.[category] || []}
                    selectedModels={selectedModels[category] || []}
                    onModelSelect={(modelId) => handleModelSelection(category, modelId)}
                    isRequired={isRequired}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={!allCategoriesHaveSelection}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Configure API Keys</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Configure API Keys</h2>
                <p className="text-muted-foreground">
                  Enter your API keys for the selected AI services (e.g., Stable Diffusion, RunwayML, OpenAI)
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Step 2 of 2
              </div>
            </div>
            
            {validationError && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <ApiKeyForm
              services={Array.from(requiredServices)}
              apiKeys={apiKeys}
              onApiKeyChange={handleApiKeyChange}
              onValidationChange={handleValidationChange}
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="border-border/50 hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Models</span>
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={!allRequiredKeysProvided}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Complete Setup
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 