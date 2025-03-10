"use client";
import { createContext, FC, ReactNode } from "react";

const EnvVariablesContext = createContext({} as any);
export const EnvVariables: FC<{ value: any; children: ReactNode }> = ({
  value,
  children,
}) => {
  return (
    <EnvVariablesContext.Provider value={value}>
      {children}
    </EnvVariablesContext.Provider>
  );
};
