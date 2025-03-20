"use client";

import { FC, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, treeSlice } from "../store";
import { NodeButton } from "../node-button.component";

// Import option components
import { RSSFeed } from "./third-party-options/rss-feed.component";

interface ThirdPartyConfigProps {
  nodeId: string;
  nodePath?: string;
  initialData?: any;
  onClose: () => void;
}

type ServiceType = "rss";

export const ThirdPartyConfig: FC<ThirdPartyConfigProps> = ({
  nodeId,
  nodePath,
  initialData,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  
  // Get node data from Redux store
  const node = useAppSelector((state) => 
    state.tree.find(n => n.id === nodeId)
  );
  
  // Get workflow path data if available
  const pathData = nodePath 
    ? useAppSelector((state) => state.workflow.pathData[nodePath] || {})
    : {};
  
  // Debug logs
  console.log("ThirdPartyConfig pathData:", pathData);
  console.log("ThirdPartyConfig nodePath:", nodePath);
  
  // Merge initialData (for backward compatibility) with node inputs
  const mergedInitialData = {
    ...(initialData || {}),
    ...(node?.inputs || {})
  };
  
  const [serviceType] = useState<ServiceType>("rss");
  
  const [serviceData, setServiceData] = useState<any>(mergedInitialData || {});
  
  // Check for prompt from upstream nodes
  const upstreamPrompt = pathData.prompt as string;
  
  // Update the inputs in the store when our configuration changes
  useEffect(() => {
    // Save to node inputs
    dispatch(treeSlice.actions.updateNodeInputs({ 
      id: nodeId, 
      inputs: { 
        serviceType,
        ...serviceData
      } 
    }));
  }, [serviceData, serviceType, dispatch, nodeId]);

  const handleServiceDataChange = (data: any) => {
    const updatedData = {
      ...serviceData,
      ...data
    };
    
    setServiceData(updatedData);
  };

  const handleSave = () => {
    // For backward compatibility, still update node.data
    dispatch(treeSlice.actions.updateNodeData({ 
      id: nodeId, 
      data: { 
        serviceType,
        ...serviceData
      } 
    }));
    
    // Create the output data
    let outputData = {
      serviceType,
      ...serviceData
    };
    
    // RSS-specific data
    outputData = {
      ...outputData,
      // Mock RSS data that would come from the feed
      rssData: {
        title: "Example RSS Item",
        description: "This is a mock RSS item description",
        link: "https://example.com/item",
        pubDate: new Date().toISOString()
      },
      // Transform the template into a prompt for downstream nodes
      prompt: serviceData.promptTemplate?.replace(
        /\{title\}/g, "Example RSS Item"
      ).replace(
        /\{description\}/g, "This is a mock RSS item description"
      ).replace(
        /\{link\}/g, "https://example.com/item"
      ).replace(
        /\{pubDate\}/g, new Date().toLocaleString()
      ) || "Latest from Example RSS Item: This is a mock RSS item description"
    };
    
    // Update node outputs
    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs: outputData
    }));
    
    onClose();
  };

  // Pass upstream prompt data to the component if available
  const dataWithUpstream = upstreamPrompt ? {
    ...serviceData,
    upstreamPrompt
  } : serviceData;

  // Create nodePathData object to pass to child components
  const nodePathData = {
    triggerType: pathData.triggerType,
    ...pathData
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure RSS Feed</h3>
      
      {/* Render RSS Feed component */}
      <div className="mt-4">
        <RSSFeed
          initialData={dataWithUpstream}
          onDataChange={handleServiceDataChange}
          upstreamPrompt={upstreamPrompt}
          nodePathData={nodePathData}
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <NodeButton onClick={onClose} variant="ghost">
          Cancel
        </NodeButton>
        <NodeButton onClick={handleSave} variant="primary">
          Save Configuration
        </NodeButton>
      </div>
    </div>
  );
}; 