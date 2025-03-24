"use client";

import useSWR from "swr";
import { FC, ReactNode, useCallback } from "react";
import { useFetch } from "@frontend/hooks/use-fetch";
import { redirect, usePathname } from "next/navigation";

export const useUser = () => {
  const fetch = useFetch();
  const getUser = useCallback(async () => {
    const self = await fetch("/users/self");
    if (self?.status >= 200 && self?.status < 300) {
      return self.json();
    }

    return false;
  }, []);

  return useSWR("/user/self", getUser);
};

export const UserWrapper: FC<{ children: ReactNode }> = (props) => {
  const { children } = props;
  const { isLoading, data } = useUser();
  const path = usePathname();

  if (isLoading) {
    return null;
  }

  if (!data && !path.startsWith("/auth")) {
    return redirect("/auth");
  }

  if (data && path.startsWith("/auth")) {
    return redirect("/");
  }

  return children;
};
