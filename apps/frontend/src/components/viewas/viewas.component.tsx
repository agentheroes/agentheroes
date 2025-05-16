"use client";

import { useState, useCallback, useRef, useEffect, FC } from "react";
import { useUser } from "@frontend/hooks/use-user";
import { useFetch } from "@frontend/hooks/use-fetch";
import useSWR, { mutate } from "swr";
import { Button } from "@frontend/components/ui/button";
import { useToast } from "@frontend/hooks/use-toast";
import {
  ExternalLink,
  UserRound,
  Search,
  Loader2,
  Package,
  Plus,
} from "lucide-react";
import { Input } from "@frontend/components/ui/input";
import { debounce } from "lodash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@frontend/components/ui/select";

interface UserWithOrganization {
  organizationId: string;
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface PricingPlan {
  identifier: string;
  name: string;
  month: {
    price: number;
    currency: string;
  };
  year: {
    price: number;
    currency: string;
  };
}

export const ViewasComponent = () => {
  const { data: userData } = useUser();
  if (!userData?.isSuperAdmin) {
    return null;
  }

  return (
    <ViewasComponentInner
      viewingAs={userData?.viewas}
      subscription={userData?.org?.subscription}
    />
  );
};

export const ViewasComponentInner: FC<{
  viewingAs: string;
  subscription: any;
}> = (props) => {
  const { viewingAs, subscription } = props;
  const [current, setCurrent] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [creditsToAdd, setCreditsToAdd] = useState<string>("100");
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fetch = useFetch();

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      if (term.length > 0) {
        setIsDropdownOpen(true);
      } else {
        setIsDropdownOpen(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (viewingAs) {
      fetchUsers(viewingAs).then((p) => {
        console.log(p[0].user.email);
        setCurrent(p[0].user.email);
      });
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = useCallback(
    async (search: string) => {
      try {
        if (!search) return [];

        const response = await fetch(
          `/users/all-users?search=${encodeURIComponent(search)}`
        );
        if (response.ok) {
          const data = await response.json();
          return data as UserWithOrganization[];
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
      }
    },
    [fetch]
  );

  const { data: users, isLoading } = useSWR([`users-search`, searchTerm], () =>
    fetchUsers(searchTerm)
  );

  const handleViewAs = async (userId: string) => {
    if (userId === "reset") {
      document.cookie =
        "viewas=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
      return;
    }
    document.cookie = `viewas=${userId}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const handleAddCredits = async () => {
    if (!viewingAs || !creditsToAdd) return;
    
    setIsAddingCredits(true);
    try {
      const response = await fetch(`/users/credits/${creditsToAdd}`, {
        method: "POST"
      });
      
      if (response.ok) {
        toast({
          title: "Credits Added",
          description: `Added ${creditsToAdd} credits successfully.`,
        });
        
        // Refresh user data
        mutate("user");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to add credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddingCredits(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#151515] via-[#1a1a1a] to-[#1f1f1f] border-b border-[#2a2a2a] px-4 py-1 z-50">
      <div className="flex items-center justify-center max-w-[100rem] gap-2 mx-auto h-8">
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm font-medium text-gray-300 flex items-center">
            <UserRound className="h-4 w-4 mr-1 text-[#FD7302]" />
            {viewingAs ? "Viewing as:" : "View as:"}
          </span>

          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <Search className="h-4 w-4 absolute left-2 top-1.5 text-gray-400" />
              <Input
                className="w-60 h-7 pl-8 border-[#2a2a2a] bg-[#1f1f1f] text-gray-200 text-sm"
                placeholder="Search users..."
                {...(current ? { value: current } : {})}
                onChange={(e) => debouncedSearch(e.target.value)}
                onFocus={() => searchTerm.length > 0 && setIsDropdownOpen(true)}
              />

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-[#1f1f1f] border border-[#2a2a2a] shadow-lg max-h-60 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-400 ml-2">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <>
                      {users && users.length > 0 ? (
                        users.map((item) => (
                          <div
                            key={`${item.user.id}-${item.organizationId}`}
                            className="px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer text-gray-300 text-sm"
                            onClick={() => handleViewAs(item.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-white">
                                {item.user.email}
                              </span>
                              <span className="text-xs text-gray-400">
                                Org ID: {item.organizationId.substring(0, 20)}
                                ...
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400 text-sm">
                          No users found
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!!viewingAs && (
            <>
              {!subscription && (
                <div className="flex items-center gap-2">
                  <div className="relative flex h-7">
                    <Input
                      type="number"
                      value={creditsToAdd}
                      onChange={(e) => setCreditsToAdd(e.target.value)}
                      className="w-32 h-7 border-[#2a2a2a] bg-[#1f1f1f] text-gray-300 text-xs pr-10"
                      placeholder="Credits"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-gray-400">
                      credits
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCredits}
                    disabled={isAddingCredits}
                    className="h-7 px-3 text-xs border-[#2a2a2a] bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a] hover:text-white flex items-center gap-1"
                  >
                    {isAddingCredits ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3 text-[#FD7302]" />
                    )}
                    <span>{isAddingCredits ? "Adding..." : "Add Credits"}</span>
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-[#2a2a2a] bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                onClick={() => handleViewAs("reset")}
              >
                You are in view mode - Reset View
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
