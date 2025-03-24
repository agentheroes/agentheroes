"use client";

import generateCharacterNode from "@frontend/components/agents/nodes/generate-image/generate.character.node";
import generateImageNode from "@frontend/components/agents/nodes/generate-image/generate.image.node";
import generateVideoNode from "@frontend/components/agents/nodes/generate-video/generate.video.node";
import apiNode from "@frontend/components/agents/nodes/trigger/api.node";
import rssNode from "@frontend/components/agents/nodes/third-party/rss.node";
import socialMediaNode from "@frontend/components/agents/nodes/publish/social.media.node";
import scheduleNode from "@frontend/components/agents/nodes/trigger/schedule.node";
import {
  NodesHighOrderComponent, 
  createNodeWithRef, 
  NodeComponentHandle 
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { MutableRefObject } from "react";

/**
 * List of all available nodes in the application
 * To access node data via ref:
 * 
 * 1. Import createNodeWithRef and NodeComponentHandle
 * 2. Create a ref: const nodeRef = useRef<NodeComponentHandle>(null);
 * 3. Create a forwarded component: 
 *    const ForwardedComponent = createNodeWithRef(NodeComponentClass);
 * 4. Use the forwarded component with ref: <ForwardedComponent ref={nodeRef} ... />
 * 5. Access data with: nodeRef.current?.data();
 * 6. Get string representation with: nodeRef.current?.renderNode();
 */
export const nodeList: NodesHighOrderComponent[] = [
  apiNode,
  scheduleNode,
  rssNode,
  generateCharacterNode,
  generateImageNode,
  generateVideoNode,
  socialMediaNode,
];

/**
 * Helper function to wrap a node component with ref forwarding
 * This makes it easy to access methods from a parent component
 * 
 * @param nodeIdentifier - The identifier of the node to create the forwarded component for
 * @returns - A tuple with the forwarded component and helper functions to access node methods
 */
export function getForwardedNodeComponent(nodeIdentifier: string) {
  const node = nodeList.find(node => node.identifier === nodeIdentifier);
  
  if (!node) {
    throw new Error(`Node with identifier ${nodeIdentifier} not found`);
  }
  
  // Create the forwarded ref component
  const ForwardedComponent = createNodeWithRef(node.component as any);
  
  // Helper to access data from the ref
  const getDataFromRef = (ref: MutableRefObject<NodeComponentHandle | null>) => {
    return ref.current?.data() || {};
  };

  // Helper to get rendered node string from the ref
  const getRenderedNodeFromRef = (ref: MutableRefObject<NodeComponentHandle | null>) => {
    return ref.current?.renderNode() || "";
  };
  
  return {
    ForwardedComponent,
    getDataFromRef,
    getRenderedNodeFromRef
  };
}
