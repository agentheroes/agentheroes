"use client";

import {useState, useEffect, useCallback} from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { Button } from "@frontend/components/ui/button";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { ModelSelectionCard } from "./model-selection-card";
import { ApiKeyForm } from "./api-key-form";
import { SocialMediaForm } from "./social-media-form";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAutoValidateApiKeys } from "@frontend/hooks/use-auto-validate-api-keys";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const fetch = useFetch();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [generationData, setGenerationData] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<Record<string, string[]>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [requiredServices, setRequiredServices] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validApiKeys, setValidApiKeys] = useState<Record<string, boolean>>({});
  const [serviceDocs, setServiceDocs] = useState<Record<string, string>>({});
  const router = useRouter();

  // Social media states
  const [availableSocialMedia, setAvailableSocialMedia] = useState<string[]>([]);
  const [savedSocialMedia, setSavedSocialMedia] = useState<Array<any>>([]);
  const [socialMediaKeys, setSocialMediaKeys] = useState<Record<string, { privateKey: string; publicKey: string }>>({});
  const [validSocialMedia, setValidSocialMedia] = useState<Record<string, boolean>>({});

  // Use the auto-validate hook to validate auto-populated API keys
  useAutoValidateApiKeys(apiKeys, validApiKeys, setValidApiKeys);

  const onComplete = useCallback(() => {
    router.push("/");
  }, []);

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
              docs?: string;
            }>;
            list: Record<string, Array<{
              identifier: string;
              model: string;
              label: string;
              category: string;
            }>>;
            inSystem: string[];
            saved: Array<{
              id: string;
              identifier: string;
              createdAt: string;
              updatedAt: string;
              deletedAt: null;
              privateKey: { key: string; iat: number };
              publicKey: { key: string; iat: number };
            }>;
          };
          
          setGenerationData(data);
          
          // Set available social media and saved social media data
          if (data.inSystem && Array.isArray(data.inSystem)) {
            setAvailableSocialMedia(data.inSystem);
          }
          
          if (data.saved && Array.isArray(data.saved)) {
            console.log('OnboardingForm - Saved social media data:', data.saved);
            setSavedSocialMedia(data.saved);
            
            // Initialize social media keys and validation state from saved data
            const initialSocialMediaKeys: Record<string, { privateKey: string; publicKey: string }> = {};
            const initialValidSocialMedia: Record<string, boolean> = {};
            
            data.saved.forEach(social => {
              // Handle both structures: direct string properties or nested objects with 'key' property
              const privateKey = typeof social.privateKey === 'string' ? social.privateKey : 
                             social.privateKey && typeof social.privateKey === 'object' ? social.privateKey.key || '' : '';
              
              const publicKey = typeof social.publicKey === 'string' ? social.publicKey :
                             social.publicKey && typeof social.publicKey === 'object' ? social.publicKey.key || '' : '';
              
              console.log(`OnboardingForm - Processing social ${social.identifier}:`, { privateKey, publicKey });
              
              if (privateKey && publicKey) {
                initialSocialMediaKeys[social.identifier] = {
                  privateKey: privateKey,
                  publicKey: publicKey
                };
                initialValidSocialMedia[social.identifier] = true; // Assume saved keys are valid
              }
            });
            
            console.log('OnboardingForm - initialSocialMediaKeys:', initialSocialMediaKeys);
            
            // Always set the states regardless of whether we have data or not
            setSocialMediaKeys(initialSocialMediaKeys);
            setValidSocialMedia(initialValidSocialMedia);
          }
          
          // Extract docs URLs
          const docsMap: Record<string, string> = {};
          if (data.models && Array.isArray(data.models)) {
            for (const model of data.models) {
              if (model.docs && model.container) {
                docsMap[model.container] = model.docs;
              }
            }
            setServiceDocs(docsMap);
          }
          
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

  // Social media handlers
  const handleSocialMediaKeyChange = (provider: string, field: 'privateKey' | 'publicKey', value: string) => {
    console.log(`handleSocialMediaKeyChange: ${provider}.${field} = ${value.substring(0, 5)}...`);
    
    // Create a new state object with the updated values
    setSocialMediaKeys(prev => {
      // Initialize the provider object if it doesn't exist
      const currentProvider = prev[provider] || { privateKey: '', publicKey: '' };
      
      // Create a new provider object with the updated field
      const updatedProvider = {
        ...currentProvider,
        [field]: value
      };
      
      // Return a new state object with the updated provider
      return {
        ...prev,
        [provider]: updatedProvider
      };
    });
    
    // Reset validation when keys change
    setValidSocialMedia(prev => ({
      ...prev,
      [provider]: false
    }));
    
    // Clear validation error when user modifies keys
    setValidationError(null);
  };

  const handleValidateSocialMediaKeys = async (provider: string, forceValidation = false) => {
    // Get the current values from socialMediaKeys state
    const currentPrivateKey = socialMediaKeys[provider]?.privateKey;
    const currentPublicKey = socialMediaKeys[provider]?.publicKey;
    
    // Make sure we have keys to validate
    if (!currentPrivateKey || !currentPublicKey) {
      console.log(`Cannot validate ${provider} - missing keys`);
      return;
    }
    
    console.log(`Validating keys for ${provider}:`, {
      privateKey: currentPrivateKey.substring(0, 5) + '...',
      publicKey: currentPublicKey.substring(0, 5) + '...'
    });
    
    // Check if this is a saved social media provider
    const isSaved = savedSocialMedia.some(social => social.identifier === provider);
    
    // ALWAYS make the API call when forced (button click), regardless of whether saved or not
    if (forceValidation) {
      try {
        console.log(`Making API call to validate keys for ${provider}`);
        setLoading(true);
        
        const response = await (await fetch(`/setup/social/status/${provider}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privateKey: currentPrivateKey,
            publicKey: currentPublicKey
          }),
        })).json();
        
        console.log(`Validation response for ${provider}:`, response);
        
        // Set validation status based on actual API response
        // This should override any auto-validation for saved keys
        if (response.valid) {
          console.log(`Marking ${provider} as VALID explicitly from API response`);
          setValidSocialMedia(prev => ({
            ...prev,
            [provider]: true
          }));
          setValidationError(null);
        } else {
          console.log(`Marking ${provider} as INVALID explicitly from API response`);
          setValidSocialMedia(prev => ({
            ...prev,
            [provider]: false
          }));
          
          const errorData = response;
          setValidationError(errorData.message || `Invalid keys for ${provider}`);
          
          // IMPORTANT: Do NOT revert the keys in the input fields when validation fails
          // The user should see what they entered even if it's invalid
        }
      } catch (error: any) {
        console.error(`Error validating ${provider} keys:`, error);
        console.log(`Marking ${provider} as INVALID explicitly due to API error`);
        setValidSocialMedia(prev => ({
          ...prev,
          [provider]: false
        }));
        setValidationError(error.message || `Failed to validate ${provider} keys`);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // For saved providers doing initial auto-validation, skip the API call
    if (isSaved) {
      // Only auto-validate if there isn't already an explicit validation result
      if (validSocialMedia[provider] !== false) {
        console.log(`Automatically validating saved keys for ${provider} (skipping API call)`);
        setValidSocialMedia(prev => ({
          ...prev,
          [provider]: true
        }));
        setValidationError(null);
      } else {
        console.log(`Not auto-validating ${provider} because it was explicitly invalidated`);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Before moving to step 3, ensure saved social media keys are marked as valid
      // But ONLY if they haven't been modified by the user
      if (savedSocialMedia.length > 0) {
        const updatedValidStatus = { ...validSocialMedia };
        
        // For each saved social media entry that has keys in our state, mark it as valid
        savedSocialMedia.forEach(social => {
          const provider = social.identifier;
          
          // Only auto-validate if keys exist and haven't been explicitly marked as invalid
          if (
            socialMediaKeys[provider]?.privateKey && 
            socialMediaKeys[provider]?.publicKey && 
            validSocialMedia[provider] !== false
          ) {
            updatedValidStatus[provider] = true;
          }
        });
        
        setValidSocialMedia(updatedValidStatus);
      }
      
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setValidationError(null);
    
    try {
      // First validate all social media keys that have been entered but not yet validated
      const socialMediaToValidate = Object.entries(socialMediaKeys)
        .filter(([provider, keys]) => 
          // Only validate if we have both keys and they haven't been validated yet
          keys.privateKey && 
          keys.publicKey && 
          !validSocialMedia[provider]
        );
      
      // If we have social media to validate, do it before proceeding
      if (socialMediaToValidate.length > 0) {
        const validationResults: Record<string, boolean> = {};
        let validationFailed = false;
        
        // Validate each set of social media keys
        for (const [provider, keys] of socialMediaToValidate) {
          try {
            const response = await fetch(`/setup/social/status/${provider}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                privateKey: keys.privateKey,
                publicKey: keys.publicKey
              }),
            });
            
            if (response.ok) {
              validationResults[provider] = true;
            } else {
              validationResults[provider] = false;
              validationFailed = true;
              
              const errorData = await response.json();
              throw new Error(errorData.message || `Invalid keys for ${provider}`);
            }
          } catch (error: any) {
            console.error(`Error validating ${provider} keys:`, error);
            setValidationError(error.message || `Failed to validate ${provider} keys`);
            setLoading(false);
            return; // Stop submission if validation fails
          }
        }
        
        // If any validation failed, stop the submission
        if (validationFailed) {
          setLoading(false);
          return;
        }
        
        // Update validation state with results
        setValidSocialMedia(prev => ({
          ...prev,
          ...validationResults
        }));
      }
      
      // Prepare the generators data
      const generatorsData = {
        list: requiredServices.size === 0 
          ? [] 
          : Array.from(requiredServices).map(identifier => ({
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
      
      // Prepare the social media data
      const validSocials = Object.entries(socialMediaKeys)
        .filter(([provider, keys]) => 
          keys.privateKey && 
          keys.publicKey
        )
        .map(([provider, keys]) => ({
          identifier: provider,
          privateKey: keys.privateKey,
          publicKey: keys.publicKey
        }));
      
      // Create an array of promises to execute in parallel
      const savePromises = [];
      
      // Add generators save request
      savePromises.push(
        fetch("/setup/generators", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generatorsData),
        })
      );
      
      // Add socials save request if we have valid social media data
      if (validSocials.length > 0) {
        savePromises.push(
          fetch("/setup/socials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ socials: validSocials }),
          })
        );
      }
      
      // Execute all save requests in parallel
      const responses = await Promise.all(savePromises);
      
      // Check if any requests failed
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save settings");
        }
      }
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Redirect or show success message
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

  // Check if all required API keys are provided and valid
  const allRequiredKeysProvided = requiredServices.size === 0 || 
    Array.from(requiredServices).every(
      service => apiKeys[service] && validApiKeys[service]
    );

  // Allow completion regardless of API key status if no models are selected
  const allCategoriesHaveSelection = true; // No longer require selections to proceed

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
                Step 1 of 3
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
              // Don't mark any categories as required
              const isRequired = false;
              
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
            >
              <span>Configure API Keys</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : step === 2 ? (
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
                Step 2 of 3
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
              serviceDocs={serviceDocs}
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-border/50 hover:bg-accent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Models</span>
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={requiredServices.size > 0 && !allRequiredKeysProvided}
            >
              <span>Configure Social Media</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Configure Social Media</h2>
                <p className="text-muted-foreground">
                  Add your social media API keys to enable publishing content directly to your social accounts
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Step 3 of 3
              </div>
            </div>
            
            {validationError && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            <SocialMediaForm
              availableSocialMedia={availableSocialMedia}
              savedSocialMedia={savedSocialMedia}
              socialMediaKeys={socialMediaKeys}
              onSocialMediaKeyChange={handleSocialMediaKeyChange}
              onValidateKeys={handleValidateSocialMediaKeys}
              validSocialMedia={validSocialMedia}
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-border/50 hover:bg-accent"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to API Keys</span>
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-pulse">Validating and Saving...</span>
                </>
              ) : (
                <span>Complete Setup</span>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 