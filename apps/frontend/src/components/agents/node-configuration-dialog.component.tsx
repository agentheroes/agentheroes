"use client";

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { NodeButton } from "@frontend/components/agents/node-button.component";
import {
  TreeState,
  useAppDispatch,
  validationErrors,
} from "@frontend/components/agents/store";
import { nodeList } from "@frontend/components/agents/nodes/node.list";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@frontend/components/ui/tabs";
import {
  NodesHighOrderComponent,
  createNodeWithRef,
  NodeComponentHandle,
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { clsx } from "clsx";
import { ValidationComponent } from "@frontend/components/agents/validation.component";
import { makeId } from "@packages/backend/encryption/make.id";
import {useFetch} from "@frontend/hooks/use-fetch";
import {useNodeWrapper} from "@frontend/components/agents/node.wrapper.context";

interface NodeConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any, renderedText: string) => void;
  selectedNodeType: NodeType;
  parentNode: TreeState;
  initialData?: Record<string, any>;
  isEditing?: boolean;
}

// Helper component to render dynamic components
const NodeComponentRenderer: FC<{
  nodeConfig: NodesHighOrderComponent;
  parentNode: TreeState;
  selectedNodeType: NodeType;
  data: any;
  updateData: (data: any) => string;
  nodeRef: React.RefObject<NodeComponentHandle>;
}> = ({
  nodeConfig,
  parentNode,
  selectedNodeType,
  data,
  updateData,
  nodeRef,
}) => {
  // Create the forwarded ref component
  const ForwardedComponent = withMyHook(createNodeWithRef(nodeConfig.component as any));

  return (
    <ForwardedComponent
      ref={nodeRef}
      node={{ ...parentNode, type: selectedNodeType, data }}
      updateData={updateData}
    />
  );
};

export const NodeConfigurationDialog: FC<NodeConfigurationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedNodeType,
  parentNode,
  initialData = {},
  isEditing = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("");
  const dispatch = useAppDispatch();
  const [configurationData, setConfigurationData] = useState<
    Record<string, any>
  >({});
  const [loading, setLoading] = useState(false);
  const [id] = useState(makeId(10));

  // Create a ref to access node component methods
  const nodeRef = useRef<NodeComponentHandle>(null);

  // Get all nodes of the selected type
  const availableNodes: NodesHighOrderComponent[] = useMemo(() => {
    return nodeList.filter((node) => node.type === selectedNodeType);
  }, [selectedNodeType]);

  // Initialize with initial data or set first tab
  useEffect(() => {
    if (isEditing && initialData && initialData.nodeIdentifier) {
      setSelectedTab(initialData.nodeIdentifier);
      setConfigurationData(initialData);
    } else if (availableNodes.length > 0) {
      const firstNodeIdentifier = availableNodes[0].identifier;
      setSelectedTab(firstNodeIdentifier);

      // Initialize configuration data with the selected node identifier
      setConfigurationData((prevData: Record<string, any>) => ({
        ...prevData,
        nodeIdentifier: firstNodeIdentifier,
      }));
    }
  }, [availableNodes, initialData, isEditing]);

  // Handle tab change
  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);

    // Update the nodeIdentifier in the configuration data
    setConfigurationData((prevData: Record<string, any>) => ({
      ...prevData,
      nodeIdentifier: tabValue,
    }));
  };

  // Handle data updates from the component
  const handleDataUpdate = (data: any) => {
    setConfigurationData((prevData: Record<string, any>) => ({
      ...prevData,
      ...data,
    }));

    return "";
  };

  const handleConfirm = async () => {
    // Get the data and rendered text from the ref
    if (nodeRef.current) {
      const data = nodeRef.current.data();
      const renderedText = nodeRef.current.renderNode();
      const validation = await nodeRef.current.validate();

      dispatch(
        validationErrors.actions.setValue({
          id,
          value: validation === true ? [] : validation,
        }),
      );

      if (validation !== true) {
        return;
      }

      // Send both data and rendered text to the parent component
      onConfirm(
        {
          ...configurationData, // Keep existing configuration data
          ...data, // Add ref data (which may have newer state)
        },
        renderedText,
      );
    } else {
      // Fallback if ref is not available
      onConfirm(configurationData, "");
    }
  };

  const dialogTitle = isEditing
    ? `Edit ${selectedNodeType} Node`
    : `Configure ${selectedNodeType} Node`;
  const confirmButtonText = isEditing ? "Save Changes" : "Add Node";

  if (!isOpen || availableNodes.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#0D0D0D] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#1F1F1F]">
        <div className="bg-[#121212] p-5 border-b border-[#1F1F1F]">
          <h3 className="text-lg font-semibold text-white">{dialogTitle}</h3>
        </div>

        <div className="p-6">
          {availableNodes.length > 1 ? (
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
              <TabsList className="w-full mb-4 bg-[#121212] border border-[#2A2A2A] rounded-lg">
                {availableNodes.map((node) => (
                  <TabsTrigger
                    key={node.identifier}
                    value={node.identifier}
                    className="flex-1 data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-[#FD7302]"
                  >
                    {node.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableNodes.map((node) => (
                <TabsContent key={node.identifier} value={node.identifier} className="border border-[#1F1F1F] rounded-xl p-4 bg-[#121212]">
                  {node.component && (
                    <>
                      <ValidationComponent id={id} />
                      <NodeComponentRenderer
                        nodeConfig={node}
                        parentNode={parentNode}
                        selectedNodeType={selectedNodeType}
                        data={configurationData}
                        updateData={handleDataUpdate}
                        nodeRef={
                          selectedTab === node.identifier ? nodeRef : null
                        }
                      />
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="p-4 border border-[#1F1F1F] rounded-xl bg-[#121212]">
              {availableNodes.length > 0 && availableNodes[0].component && (
                <>
                  <ValidationComponent id={id} />
                  <NodeComponentRenderer
                    nodeConfig={availableNodes[0]}
                    parentNode={parentNode}
                    selectedNodeType={selectedNodeType}
                    data={configurationData}
                    updateData={handleDataUpdate}
                    nodeRef={nodeRef}
                  />
                </>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <NodeButton onClick={onClose} variant="outline">
              Cancel
            </NodeButton>
            <NodeButton
              onClick={handleConfirm}
              variant="default"
              className={clsx(loading && "opacity-50", "relative")}
            >
              <div className={clsx(loading && "invisible")}>
                {confirmButtonText}
              </div>
              {loading && (
                <div className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </NodeButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to wrap the component with the useNodeWrapper hook
function withMyHook(Component: any) {
  return function WrappedComponent(props: any) {
    const outputs = useNodeWrapper();
    const fetch = useFetch();
    return <Component {...props} values={outputs} fetch={fetch} />;
  };
}