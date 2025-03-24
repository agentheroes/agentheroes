"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import { Label } from "@frontend/components/ui/label";
import { CheckCircle, XCircle, Info } from "lucide-react";

export interface SocialMediaFormProps {
  availableSocialMedia: string[];
  savedSocialMedia: Array<{
    id?: string;
    identifier: string;
    privateKey: string | { key: string };
    publicKey: string | { key: string };
  }>;
  socialMediaKeys: Record<string, { privateKey: string; publicKey: string }>;
  onSocialMediaKeyChange: (
    provider: string,
    field: "privateKey" | "publicKey",
    value: string,
  ) => void;
  onValidateKeys: (provider: string, forceValidation?: boolean) => void;
  validSocialMedia: Record<string, boolean>;
}

export function SocialMediaForm({
  availableSocialMedia,
  savedSocialMedia,
  socialMediaKeys,
  onSocialMediaKeyChange,
  onValidateKeys,
  validSocialMedia,
}: SocialMediaFormProps) {
  // Keep track of which providers have had their keys modified
  const [modifiedProviders, setModifiedProviders] = useState<
    Record<string, boolean>
  >({});

  // Initialize form with saved keys ONLY on mount (not on every render)
  // This effect is causing issues by resetting keys after validation, so we're removing it
  // The parent component should handle initial population of keys

  // When socialMediaKeys changes, mark saved media as valid - but only run once
  useEffect(() => {
    // This should only run once on initial mount, after keys have been populated from saved data
    const timeoutId = setTimeout(() => {
      // Check if we have loaded keys for saved social media
      savedSocialMedia.forEach((social) => {
        const provider = social.identifier;
        if (
          socialMediaKeys[provider]?.privateKey &&
          socialMediaKeys[provider]?.publicKey &&
          validSocialMedia[provider] !== true &&
          validSocialMedia[provider] !== false && // Don't override explicit validation results
          !modifiedProviders[provider] // Don't auto-validate if user has modified keys
        ) {
          // Force validation status to true for saved social media with keys
          // Don't force API validation, just mark as valid
          console.log(`Auto-validating ${provider} on initial load`);
          onValidateKeys(provider, false);
        }
      });
    }, 500); // Small delay to ensure all state has been properly set

    return () => clearTimeout(timeoutId);
    // Only run once on mount, don't run when modifiedProviders changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSocialMediaDisplayName = (identifier: string) => {
    return identifier.charAt(0).toUpperCase() + identifier.slice(1);
  };

  // Check if a social media is already saved
  const isSavedSocialMedia = (identifier: string) => {
    return savedSocialMedia.some((social) => social.identifier === identifier);
  };

  // Handler for input changes
  const handleInputChange = (
    provider: string,
    field: "privateKey" | "publicKey",
    value: string,
  ) => {
    console.log(`Input change for ${provider}.${field}:`, {
      from: socialMediaKeys[provider]?.[field]?.substring(0, 5) + "...",
      to: value.substring(0, 5) + "...",
    });

    // Mark this provider as modified by the user
    setModifiedProviders((prev) => {
      if (!prev[provider]) {
        console.log(`Marking ${provider} as modified`);
      }
      return {
        ...prev,
        [provider]: true,
      };
    });

    // Call the parent's change handler
    onSocialMediaKeyChange(provider, field, value);
  };

  // Handler for validation button
  const handleValidate = (provider: string) => {
    console.log(`Validating keys for ${provider} - Current keys:`, {
      privateKey: socialMediaKeys[provider]?.privateKey.substring(0, 5) + "...",
      publicKey: socialMediaKeys[provider]?.publicKey.substring(0, 5) + "...",
      isModified: modifiedProviders[provider] || false,
      validationStatus: validSocialMedia[provider],
    });

    // Always force validation when the button is clicked
    onValidateKeys(provider, true);

    // Keep the modified state true, so auto-validation doesn't override
    // the explicit validation we're doing now
    if (!modifiedProviders[provider]) {
      console.log(
        `Marking ${provider} as modified to prevent auto-validation from overriding`,
      );
      setModifiedProviders((prev) => ({
        ...prev,
        [provider]: true,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {availableSocialMedia.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No social media integrations are available at this time.
        </div>
      ) : (
        availableSocialMedia.map((provider) => {
          const displayName = getSocialMediaDisplayName(provider);
          const saved = isSavedSocialMedia(provider);
          const hasKeys =
            socialMediaKeys[provider]?.privateKey &&
            socialMediaKeys[provider]?.publicKey;
          const isModified = modifiedProviders[provider];

          // Determine validation status
          let isValid = validSocialMedia[provider];

          // For saved keys that haven't been modified AND haven't been explicitly invalidated,
          // consider them valid by default
          if (saved && hasKeys && !isModified && isValid !== false) {
            isValid = true;
          }

          // For keys that have been validated explicitly, always respect that result
          // regardless of saved status

          return (
            <div key={provider} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-lg">{displayName}</div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${provider}-private-key`}>Private Key</Label>
                  <Input
                    id={`${provider}-private-key`}
                    type="password"
                    value={socialMediaKeys[provider]?.privateKey || ""}
                    onChange={(e) =>
                      handleInputChange(provider, "privateKey", e.target.value)
                    }
                    placeholder="Enter private key"
                    className="font-mono text-sm"
                    key={`${provider}-private-key-${isModified ? "modified" : "default"}`}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${provider}-public-key`}>Public Key</Label>
                  <Input
                    id={`${provider}-public-key`}
                    value={socialMediaKeys[provider]?.publicKey || ""}
                    onChange={(e) =>
                      handleInputChange(provider, "publicKey", e.target.value)
                    }
                    placeholder="Enter public key"
                    className="font-mono text-sm"
                    key={`${provider}-public-key-${isModified ? "modified" : "default"}`}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2 text-sm">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-muted-foreground">
                    Add the following Redirect URL to your social media app settings:<br />
                    {new URL(window.location.href).origin}/v1/api/redirect
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
