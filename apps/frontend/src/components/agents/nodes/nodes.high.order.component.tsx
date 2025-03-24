"use client";

import { NodeType } from "@packages/shared/agents/agent.flow";
import { Component, ComponentType, ReactNode, forwardRef, ForwardedRef, ComponentClass, createRef, useImperativeHandle } from "react";
import React from "react";
import { TreeState } from "@frontend/components/agents/store";

interface Node {
  node: TreeState;
  updateData?: (data: any) => string;
  fetch: (url: string, request?: RequestInit) => Promise<Response>;
  values: string[]
}

// Define the ref handle type
export interface NodeComponentHandle {
  data: () => Record<string, any>;
  renderNode: () => string;
  validate: () => Promise<string[] | true>;
}

export abstract class NodeComponent extends Component<Node, any> {
  state = {
    data: {},
  };

  abstract render(): ReactNode;
  
  data() {
    return { ...this.state.data };
  }

  // New renderNode method that returns a string representation of the node
  renderNode(): string {
    return ``;
  }

  async validate(): Promise<string[] | true> {
    return true;
  }
}

export interface NodesHighOrderComponent  {
  component: ComponentType<Node>;
  identifier: string;
  type: NodeType;
  title: string;
  outputs: string[];
}

// Function to create a forwarded ref version of a NodeComponent
export function createNodeWithRef<T extends typeof NodeComponent>(
  NodeComponentClass: T
): ComponentType<Node & { ref?: ForwardedRef<NodeComponentHandle> }> {
  return forwardRef<NodeComponentHandle, Node>((props, ref) => {
    // This is a functional component wrapper that creates a class instance
    // and forwards the ref to access the data method
    const instanceRef = createRef<InstanceType<T>>();
    
    // Use useImperativeHandle to expose only what we want from the ref
    useImperativeHandle(ref, () => ({
      data: () => {
        return instanceRef.current ? instanceRef.current.data() : {};
      },
      renderNode: () => {
        return instanceRef.current ? instanceRef.current.renderNode() : "";
      },
      validate: async () => {
        return instanceRef.current ? instanceRef.current.validate() : true;
      }
    }), [instanceRef]);
    
    // @ts-ignore - We know this is a valid component class
    return <NodeComponentClass ref={instanceRef} {...props} />;
  });
}

export const nodesHighOrderComponent = (params: NodesHighOrderComponent): NodesHighOrderComponent => {
  return params;
};
