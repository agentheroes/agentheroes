'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useFetch} from "@frontend/hooks/use-fetch";

export interface SocialMedia {
  id: string;
  identifier: string;
  name: string;
  profilePic: string;
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
      setSocials(data);
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