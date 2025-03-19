'use client';

import { useSocialMedia } from './social.media.context';

export function DebugRefreshWarning() {
  const { socials } = useSocialMedia();
  
  if (!socials || socials.length === 0) {
    return (
      <div className="bg-red-600 text-white p-3 mb-4 font-bold text-center">
        DEBUG: No social media accounts found
      </div>
    );
  }
  
  const refreshNeeded = socials.filter(social => social.shouldRefresh === true);
  
  return (
    <div className="bg-green-600 text-white p-3 mb-4 font-bold">
      <div>DEBUG: Total socials: {socials.length}</div>
      <div>DEBUG: Accounts needing refresh: {refreshNeeded.length}</div>
      {refreshNeeded.length > 0 && (
        <div>
          <p>Refresh needed for:</p>
          <ul>
            {refreshNeeded.map(social => (
              <li key={social.id}>
                {social.name} (id: {social.id}, shouldRefresh: {String(social.shouldRefresh)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 