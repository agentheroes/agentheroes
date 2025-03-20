"use client";

import { FC, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, treeSlice, workflowSlice } from "../store";
import { NodeButton } from "../node-button.component";

// Import option components
import { MCPService } from "./third-party-options/mcp-service.component";
import { APIService } from "./third-party-options/api-service.component";
import { CustomScript } from "./third-party-options/custom-script.component";

interface ThirdPartyConfigProps {
  nodeId: string;
  nodePath?: string;
  initialData?: any;
  onClose: () => void;
}

type ServiceType = "mcp" | "api" | "custom";

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
  
  // Merge initialData (for backward compatibility) with node inputs
  const mergedInitialData = {
    ...(initialData || {}),
    ...(node?.inputs || {})
  };
  
  const [serviceType, setServiceType] = useState<ServiceType>(
    mergedInitialData.serviceType || "mcp"
  );
  
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

  const handleServiceTypeChange = (type: ServiceType) => {
    setServiceType(type);
    
    // Update the serviceType in the data
    const updatedData = {
      ...serviceData,
      serviceType: type
    };
    
    setServiceData(updatedData);
  };

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
    
    // Update node outputs
    dispatch(treeSlice.actions.updateNodeOutputs({
      id: nodeId,
      outputs: {
        serviceType,
        ...serviceData,
        // If this is an API service, include the response (mock for now)
        ...(serviceType === "api" && { 
          apiResponse: "Example API response data",
          prompt: serviceData.prompt || upstreamPrompt || ""
        })
      }
    }));
    
    onClose();
  };

  // Render the appropriate service component based on the service type
  const renderServiceOptions = () => {
    // Pass upstream prompt data to the component if available
    const dataWithUpstream = upstreamPrompt ? {
      ...serviceData,
      upstreamPrompt
    } : serviceData;
    
    switch (serviceType) {
      case "mcp":
        return <MCPService initialData={dataWithUpstream} onDataChange={handleServiceDataChange} />;
      case "api":
        return <APIService 
          initialData={dataWithUpstream} 
          onDataChange={handleServiceDataChange} 
          upstreamPrompt={upstreamPrompt}
        />;
      case "custom":
        return <CustomScript 
          initialData={dataWithUpstream} 
          onDataChange={handleServiceDataChange}
          upstreamPrompt={upstreamPrompt}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Configure Third Party</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleServiceTypeChange("mcp")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "mcp"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            MCP
          </button>
          <button
            type="button"
            onClick={() => handleServiceTypeChange("api")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "api"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            API
          </button>
          <button
            type="button"
            onClick={() => handleServiceTypeChange("custom")}
            className={`px-4 py-2 text-sm border rounded-md ${
              serviceType === "custom"
                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      
      {/* Render service-specific options */}
      <div className="mt-4">
        {renderServiceOptions()}
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