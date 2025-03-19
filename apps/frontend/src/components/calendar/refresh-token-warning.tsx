"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useSocialMedia, SocialMedia } from "./social.media.context";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);

interface SingleChannelWarningProps {
  social: SocialMedia;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function SingleChannelWarning({
  social,
  isRefreshing,
  onRefresh,
}: SingleChannelWarningProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium text-xs">
          Authentication for {social.name} has expired. You need to reconnect to
          continue using this account.
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="ml-4 px-3 py-1 bg-white text-red-600 font-medium text-xs rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition-colors disabled:opacity-50"
      >
        {isRefreshing ? "Redirecting..." : "Reconnect Now"}
      </button>
    </div>
  );
}

interface MultiChannelWarningProps {
  socials: SocialMedia[];
  refreshingIds: Record<string, boolean>;
  onRefresh: (id: string) => void;
}

function MultiChannelWarning({
  socials,
  refreshingIds,
  onRefresh,
}: MultiChannelWarningProps) {
  return (
    <>
      <div className="mb-1 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium text-xs">
          Multiple social media accounts need reconnection
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {socials.map((social) => (
          <div
            key={social.id}
            className="flex items-center justify-between bg-red-700 p-2 rounded-md"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img
                  src={social.profilePic || `/socials/${social.identifier}.png`}
                  alt={`${social.name} profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for image load errors
                    (e.target as HTMLImageElement).src =
                      "/social-placeholder.png";
                  }}
                />
              </div>
              <span className="text-xs">{social.name}</span>
            </div>
            <button
              onClick={() => onRefresh(social.id)}
              disabled={refreshingIds[social.id] || false}
              className="px-2 py-0.5 bg-white text-red-600 font-medium text-xs rounded-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-white transition-colors disabled:opacity-50"
            >
              {refreshingIds[social.id] ? "Redirecting..." : "Reconnect"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function RefreshTokenWarning() {
  const { socials } = useSocialMedia();
  const [refreshingIds, setRefreshingIds] = useState<Record<string, boolean>>(
    {},
  );
  const fetch = useFetch();

  // Add useEffect to debug social media channels that need refresh
  useEffect(() => {
    if (socials && socials.length > 0) {
      const refreshNeeded = socials.filter(
        (social) => social.shouldRefresh === true,
      );
      if (refreshNeeded.length > 0) {
        console.log("Social media accounts needing refresh:", refreshNeeded);
      }
    }
  }, [socials]);

  // Make sure socials is defined before checking
  if (!socials || socials.length === 0) return null;

  // Get all social media accounts that need refreshing
  const socialsToRefresh = socials.filter(
    (social) => social.shouldRefresh === true,
  );

  // If no refresh needed, don't render anything
  if (socialsToRefresh.length === 0) return null;

  const handleRefreshClick = async (socialId: string) => {
    // Get the social media account to refresh
    const socialToRefresh = socials.find((social) => social.id === socialId);

    if (!socialToRefresh || refreshingIds[socialId]) return;

    // Mark this social as refreshing
    setRefreshingIds((prev) => ({ ...prev, [socialId]: true }));

    try {
      // Get current URL for the referer parameter
      const referer = new URL(window.location.href).origin;
      const offset = dayjs.tz().utcOffset();

      const response = await fetch(
        `/socials/url?identifier=${socialToRefresh.identifier}&rootInternalId=${socialToRefresh.rootInternalId}&internalId=${socialToRefresh.currentInternalId}&referer=${encodeURIComponent(referer)}&timezone=${offset}&refresh=true`,
      );

      if (!response.ok) {
        throw new Error(`Failed to get connection URL: ${response.status}`);
      }

      const data = await response.json();

      // Redirect the user to the authorization URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL provided");
      }
    } catch (err) {
      console.error("Error refreshing social media token:", err);
      setRefreshingIds((prev) => ({ ...prev, [socialId]: false }));
    }
  };

  // We'll render different UI based on number of accounts needing refresh
  return (
    <div className="bg-red-600 text-white p-2 rounded-md mb-3 shadow-lg border border-red-400 text-xs">
      {socialsToRefresh.length === 1 ? (
        <SingleChannelWarning
          social={socialsToRefresh[0]}
          isRefreshing={refreshingIds[socialsToRefresh[0].id] || false}
          onRefresh={() => handleRefreshClick(socialsToRefresh[0].id)}
        />
      ) : (
        <MultiChannelWarning
          socials={socialsToRefresh}
          refreshingIds={refreshingIds}
          onRefresh={handleRefreshClick}
        />
      )}
    </div>
  );
}
