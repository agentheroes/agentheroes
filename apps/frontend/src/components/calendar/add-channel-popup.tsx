"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useSocialMedia } from "./social.media.context";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";
dayjs.extend(timezone);
dayjs.extend(utc);

interface AvailableSocialMedia {
  identifier: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface AvailableSocialsResponse {
  saved: AvailableSocialMedia[];
}

interface AddChannelPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddChannelPopup({ isOpen, onClose }: AddChannelPopupProps) {
  const [availableSocials, setAvailableSocials] = useState<
    AvailableSocialMedia[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetch = useFetch();
  const { refreshSocials } = useSocialMedia();

  // Check if the URL has a success or error parameter from redirection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const successParam = urlParams.get("social_connect_success");
      const refreshParam = urlParams.get("social_connect_refresh");
      const errorParam = urlParams.get("social_connect_error");

      if (successParam === "true" || refreshParam === "true") {
        // If we have a success or refresh parameter, refresh socials
        refreshSocials();

        // Clean up URL parameters
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } else if (errorParam) {
        // Handle error if needed
        console.error("Error connecting social media:", errorParam);
      }
    }
  }, [refreshSocials]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSocials();
    }
  }, [isOpen]);

  const fetchAvailableSocials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/socials/available");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch available social media: ${response.status}`,
        );
      }

      const data: AvailableSocialsResponse = await response.json();
      setAvailableSocials(data.saved || []);
    } catch (err) {
      console.error("Error fetching available social media:", err);
      setError(
        "Failed to load available social media. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSocial = async (identifier: string) => {
    try {
      // Get current URL for the referer parameter
      const referer = new URL(window.location.href).origin;
      const offset = dayjs.tz().utcOffset();
      // Fetch the connection URL
      const response = await fetch(
        `/socials/url?identifier=${identifier}&referer=${encodeURIComponent(referer)}&timezone=${offset}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to get connection URL: ${response.status}`);
      }

      const data = await response.json();

      // Redirect the user to the authorization URL
      if (data.url) {
        onClose(); // Close the popup before redirecting
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL provided");
      }
    } catch (err) {
      console.error("Error connecting to social media:", err);
      setError("Failed to connect to social media. Please try again later.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white">
            Connect a Channel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-400">
                Loading available channels...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-red-500">
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && availableSocials.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <span>No available channels to connect</span>
            </div>
          )}

          {!isLoading && !error && availableSocials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableSocials.map((social) => (
                <SocialMediaCard
                  name={social.name}
                  key={social.identifier}
                  identifier={social.identifier}
                  onClick={() => handleConnectSocial(social.identifier)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface SocialMediaCardProps {
  identifier: string;
  name: string;
  onClick: () => void;
}

function SocialMediaCard({ name, identifier, onClick }: SocialMediaCardProps) {
  // Function to get proper display name from identifier
  return (
    <button
      onClick={onClick}
      className="flex items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
        <img
          src={`/socials/${identifier}.png`}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for image load errors
            (e.target as HTMLImageElement).src = "/social-placeholder.png";
          }}
        />
      </div>
      <div className="ml-4 text-left">
        <div className="font-medium text-white">{name}</div>
        <div className="text-sm text-gray-400">Connect account</div>
      </div>
    </button>
  );
}
