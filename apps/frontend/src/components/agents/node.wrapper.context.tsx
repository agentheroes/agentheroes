"use client";

import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { uniq } from "lodash";

export const NodeWrapperContext = createContext<any>([] as string[]);
export const useNodeWrapper = () => useContext(NodeWrapperContext);

export const NodeWrapperContextProvider = (params: {
  depth: number;
  values: string[];
  children: ReactNode;
}) => {
  const existingValues = useNodeWrapper();
  return (
    <NodeWrapperContext.Provider
      value={uniq([...existingValues, ...params.values])}
    >
      {params.children}
    </NodeWrapperContext.Provider>
  );
};

export const RenderField: FC<{
  property: string;
  exists: boolean;
  overrideValues?: string[];
  children: ReactNode;
}> = (props) => {
  const { property, exists, children, overrideValues } = props;
  const existingValues = useNodeWrapper();

  const fieldExists = useMemo(() => {
    return (overrideValues || existingValues || []).some(
      (p: string) => p === property,
    );
  }, [existingValues, property, overrideValues]);

  return fieldExists === exists ? children : null;
};
