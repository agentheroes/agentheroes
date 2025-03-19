'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useFetch} from "@frontend/hooks/use-fetch";

export interface SocialMedia {
  id: string;
  identifier: string;
  currentInternalId: string;
  rootInternalId: string;
  name: string;
  profilePic: string;
  shouldRefresh: boolean;
  selectionRequired: boolean;
}

interface SocialMediaContextType {
  socials: SocialMedia[];
  loading: boolean;
  error: string | null;
  refreshSocials: () => Promise<void>;
}

const SocialMediaContext = createContext<SocialMediaContextType | undefined>(undefined);

export function useSocialMedia() {
  const context = useContext(SocialMediaContext);
  if (context === undefined) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
}

interface SocialMediaProviderProps {
  children: ReactNode;
}

export function SocialMediaProvider({ children }: SocialMediaProviderProps) {
  const [socials, setSocials] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();

  const fetchSocials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/socials');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch social media channels: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug log to ensure shouldRefresh values are maintained
      console.log('Fetched social media channels:', data);
      
      // Make sure shouldRefresh is properly typed as a boolean
      const typedData = data.map((social: any) => ({
        ...social,
        shouldRefresh: Boolean(social.shouldRefresh),
        selectionRequired: Boolean(social.selectionRequired)
      }));
      
      setSocials(typedData);
      
      // Log any channels that need refresh
      const refreshNeeded = typedData.filter((social: SocialMedia) => social.shouldRefresh === true);
      if (refreshNeeded.length > 0) {
        console.log('Social media channels needing refresh:', refreshNeeded);
      }
    } catch (err) {
      console.error('Error fetching social media channels:', err);
      setError('Failed to load social media channels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSocials = async () => {
    await fetchSocials();
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  return (
    <SocialMediaContext.Provider value={{ socials, loading, error, refreshSocials }}>
      {children}
    </SocialMediaContext.Provider>
  );
} 