"use client";
import { createContext, FC, ReactNode, useCallback, useContext } from "react";
import { useCreditsDialog } from "@frontend/components/credits/credits-dialog-context";
import { toast } from "@frontend/hooks/use-toast";

export const FetchContext = createContext({
  beforeRequest: (
    url: string,
    requestInit?: RequestInit,
  ): Promise<RequestInit> => Promise.resolve(requestInit!),
  afterRequest: (
    response: Response,
    url: string,
    requestInit?: RequestInit,
  ): Promise<Response> => Promise.resolve(response),
});

export const FetchProviderComponent: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { openCreditsDialog } = useCreditsDialog();

  return (
    <FetchContext.Provider
      value={{
        afterRequest: async (res, url) => {
          if (res.headers.get("onboarding")) {
            window.location.href = "/onboarding";
          } else if (res.headers.get("reload")) {
            window.location.reload();
          } else if (res.status === 402) {
            // Payment Required - out of credits
            toast({
              title: "Out of Credits",
              description: "You don't have enough credits for this operation.",
              variant: "destructive",
            });
            openCreditsDialog();
          }
          return res;
        },
        beforeRequest: (url, requestInit) => Promise.resolve(requestInit!),
      }}
    >
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => {
  const { beforeRequest, afterRequest } = useContext(FetchContext);

  return useCallback(async (url: string, requestInit?: RequestInit) => {
    const loadRequest = await beforeRequest(url, requestInit);
    const refer = typeof window !== "undefined" ? new URL(window.location.href).origin : '';
    const load = await fetch("/v1/api" + url, {
      method: "GET",
      ...loadRequest,
      headers: {
        ...requestInit?.headers,
        refer,
        ...(requestInit?.body && requestInit?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    });

    return afterRequest(load, url, requestInit);
  }, []);
};
