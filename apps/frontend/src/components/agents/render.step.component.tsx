"use client";

import { FC, useState, useMemo, useCallback, useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import store, {
  TreeState,
  treeSlice,
  useAppDispatch,
} from "@frontend/components/agents/store";
import { makeId } from "@packages/backend/encryption/make.id";
import { NodeType, steps } from "@packages/shared/agents/agent.flow";
import { ArcherContainer, ArcherElement } from "react-archer";
import { createSelector } from "@reduxjs/toolkit";
import { NodeCard } from "@frontend/components/agents/node-card.component";
import { NodeButton } from "@frontend/components/agents/node-button.component";
import { NodeSelectionDialog } from "@frontend/components/agents/node-selection-dialog.component";
import { NodeConfigurationDialog } from "@frontend/components/agents/node-configuration-dialog.component";
import { nodeList } from "@frontend/components/agents/nodes/node.list";
import { DeleteNodeConfirmationDialog } from "@frontend/components/agents/delete-node-confirmation-dialog.component";
import { NodeWrapperContextProvider } from "@frontend/components/agents/node.wrapper.context";
import { DottedBackground } from "@frontend/components/ui/dotted-background";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Button } from "@frontend/components/ui/button";
import { clsx } from "clsx";
import { useFetch } from "@frontend/hooks/use-fetch";
import { useParams, useRouter } from "next/navigation";
import { toast, useToast } from "@frontend/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TextModelSelector } from "@frontend/components/agents/text-model-selector";

// Selectors
const selectTree = (state: { tree: TreeState[] }) => state.tree;

const selectRootNodes = createSelector([selectTree], (tree) =>
  tree.filter((item) => !item.parent),
);

const makeSelectChildNodes = () => {
  return createSelector(
    [selectTree, (_: any, parentId: string) => parentId],
    (tree, parentId) => tree.filter((item) => item.parent === parentId),
  );
};

// Unified Node component that can render both root and child nodes
const NodeComponent: FC<{
  node: TreeState;
  isRoot?: boolean;
}> = ({ node, isRoot = false }) => {
  const dispatch = useAppDispatch();
  const selectChildNodes = makeSelectChildNodes();
  const childNodes = useSelector((state) => selectChildNodes(state, node.id));
  const [isNodeSelectionDialogOpen, setIsNodeSelectionDialogOpen] =
    useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(
    null,
  );
  const [isEditingExistingNode, setIsEditingExistingNode] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const getNodeOutputs = useMemo(() => {
    return node.data?.nodeIdentifier
      ? nodeList.find((n) => n.identifier === node.data.nodeIdentifier).outputs
      : ([] as string[]);
  }, [node?.data?.nodeIdentifier]);

  const openNodeSelectionDialog = () => {
    setIsNodeSelectionDialogOpen(true);
  };

  const closeNodeSelectionDialog = () => {
    setIsNodeSelectionDialogOpen(false);
  };

  const handleNodeSelection = (nodeType: NodeType) => {
    setSelectedNodeType(nodeType);
    setIsEditingExistingNode(false);
    closeNodeSelectionDialog();
    setIsConfigDialogOpen(true);
  };

  const closeConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setSelectedNodeType(null);
    setIsEditingExistingNode(false);
  };

  const handleConfigureExistingNode = () => {
    setSelectedNodeType(node.type);
    setIsEditingExistingNode(true);
    setIsConfigDialogOpen(true);
  };

  const handleConfigConfirm = (data: any, renderedText: string) => {
    if (selectedNodeType) {
      if (isEditingExistingNode) {
        // Update existing node
        dispatch(
          treeSlice.actions.updateNode({
            id: node.id,
            data: data,
            renderedText: renderedText,
          }),
        );
      } else {
        // Immediately add the node to Redux without staging
        dispatch(
          treeSlice.actions.addValue({
            id: makeId(10),
            parent: node.id,
            type: selectedNodeType,
            data: data,
            renderedText: renderedText,
            isValid: true,
          }),
        );
      }
      closeConfigDialog();
    }
  };

  // Handle node deletion
  const handleDeleteNode = () => {
    setIsDeleteConfirmationOpen(true);
  };

  // Handle confirmation of deletion
  const handleConfirmDelete = () => {
    dispatch(treeSlice.actions.removeNode(node.id));
    setIsDeleteConfirmationOpen(false);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const shouldShowAddButton =
    !isRoot || (isRoot && node.type === NodeType.TRIGGER);

  // Get node name for the confirmation dialog
  const getNodeName = () => {
    const nodeTypeLabel =
      steps.find((s) => s.type === node.type)?.name || "Node";
    const nodeConfig = node.data?.nodeIdentifier
      ? nodeList.find((n) => n.identifier === node.data.nodeIdentifier)
      : null;

    return nodeConfig
      ? `${nodeTypeLabel} - ${nodeConfig.title}`
      : nodeTypeLabel;
  };

  return (
    <div className="flex flex-col items-center gap-[100px]">
      <ArcherElement
        id={node.id}
        relations={childNodes.map((p) => ({
          targetId: p.id,
          targetAnchor: "top",
          sourceAnchor: "bottom",
          style: { strokeWidth: 2, strokeDasharray: "5,5" },
        }))}
      >
        <div className="flex justify-center">
          <NodeCard
            node={node}
            isRoot={isRoot}
            onConfigureNode={handleConfigureExistingNode}
            onDeleteNode={!isRoot ? handleDeleteNode : undefined}
          >
            {shouldShowAddButton && (
              <NodeButton onClick={openNodeSelectionDialog} variant={"default"}>
                Add Node
              </NodeButton>
            )}
          </NodeCard>
        </div>
      </ArcherElement>

      <NodeWrapperContextProvider
        depth={isRoot ? 0 : 1}
        values={getNodeOutputs}
      >
        {childNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-row space-x-24">
              {childNodes.map((childNode) => (
                <div key={childNode.id} className="flex flex-col items-center">
                  <NodeComponent node={childNode} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node Selection Dialog */}
        <NodeSelectionDialog
          isOpen={isNodeSelectionDialogOpen}
          onClose={closeNodeSelectionDialog}
          onSelectNode={handleNodeSelection}
          currentNodeType={node.type}
        />

        {/* Node Configuration Dialog */}
        {selectedNodeType && (
          <NodeConfigurationDialog
            isOpen={isConfigDialogOpen}
            onClose={closeConfigDialog}
            onConfirm={handleConfigConfirm}
            selectedNodeType={selectedNodeType}
            parentNode={node}
            initialData={isEditingExistingNode ? node.data : {}}
            isEditing={isEditingExistingNode}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteNodeConfirmationDialog
          isOpen={isDeleteConfirmationOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={handleConfirmDelete}
          nodeName={getNodeName()}
          hasChildren={childNodes.length > 0}
        />
      </NodeWrapperContextProvider>
    </div>
  );
};

// Root component that renders the entire tree
export const RenderTree: FC = () => {
  const rootNodes = useSelector(selectRootNodes);

  if (rootNodes.length === 0) return <div>No nodes found</div>;

  // We'll just take the first root node
  const rootNode = rootNodes[0];

  return <NodeComponent node={rootNode} isRoot={true} />;
};

// Main component that starts the rendering
export const RenderStepComponent: FC = () => {
  const params = useParams();
  const fetch = useFetch();

  const [showAgent, setShowAgent] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");

  const loadFlow = useCallback(async () => {
    const data = await (await fetch(`/agents/${params.id}`)).json();
    setName(data.name);
    setModel(data.model);

    store.dispatch(
      treeSlice.actions.setState(
        data.agentSteps.map(
          (p: any) =>
            ({
              isValid: true,
              data: JSON.parse(p.data),
              parent: p.parentId,
              type: p.type,
              renderedText: p.renderedText,
              id: p.id,
            }) as TreeState,
        ),
      ),
    );

    setShowAgent(true);
  }, [params]);

  useEffect(() => {
    if (!params.id) {
      store.dispatch(treeSlice.actions.resetState());
      setShowAgent(true);
      return;
    }

    loadFlow();
  }, [params]);

  if (!showAgent) {
    return null;
  }

  return (
    <Provider store={store}>
      <RenderStepComponentInner
        model={model}
        name={name}
        id={params.id as string}
      />
    </Provider>
  );
};
export const RenderStepComponentInner: FC<{
  name: string;
  model: string;
  id?: string;
}> = (props) => {
  const rootNodes = useSelector(selectTree);
  const fetch = useFetch();
  const [name, setName] = useState(props.name);
  const [textModel, setTextModel] = useState(props.model);
  const router = useRouter();

  // Fetch agent details if editing an existing agent
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (props.id) {
        try {
          const response = await fetch(`/agents/${props.id}`);
          if (response.ok) {
            const agentData = await response.json();
            if (agentData.textModel && !props.model) {
              setTextModel(agentData.textModel);
            }
          }
        } catch (error) {
          console.error("Error fetching agent details:", error);
        }
      }
    };

    fetchAgentDetails();
  }, [props.id, fetch]);

  const save = useCallback(async () => {
    const body = await (
      await fetch("/agents" + (props.id ? `/${props.id}` : ""), {
        method: props.id ? "PUT" : "POST",
        body: JSON.stringify({
          name,
          textModel,
          nodes: rootNodes,
        }),
      })
    ).json();

    toast({
      title: "Saved",
      description: "Agent saved successfully",
    });

    if (!props.id) {
      router.push(`/agents/${body.id}`);
    }
  }, [fetch, rootNodes, name, textModel]);

  const isValid =
    name.length > 1 &&
    rootNodes.length > 1 &&
    rootNodes.every((p) => p.isValid);
  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex w-full relative mb-6">
          <div>
            <Link
              href="/agents"
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agents
            </Link>
          </div>
          <h2 className="text-2xl font-bold flex-1 absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]">
            {props.id ? "Edit Agent" : "Create Agent"}
          </h2>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="flex flex-col max-w-7xl mx-auto flex-1">
          <div className="w-full bg-[#171717] p-[10px] rounded-tl-[20px] rounded-tr-[20px] flex">
            <div className="flex-1" />
            <div className="grid grid-cols-2 gap-4 w-[500px]">
              <div className="text-center">
                <Label>Agent Name</Label>
                <Input
                  className="mt-[10px] w-full text-center"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="text-center">
                <Label>Text Model</Label>
                <div className="mt-[10px]">
                  <TextModelSelector
                    selectedModel={textModel}
                    onModelSelect={setTextModel}
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                disabled={!isValid}
                className={clsx("w-[100px]")}
                onClick={save}
              >
                Save
              </Button>
            </div>
          </div>
          <DottedBackground
            dotColor="#2A2A2A"
            bgColor="#171717"
            dotSize={1}
            spacing={20}
          >
            <div className="p-5">
              <ArcherContainer
                strokeColor="#FD7302"
                strokeWidth={2}
                offset={20}
                noCurves={true}
              >
                <InitialTriggerConfigWrapper />
              </ArcherContainer>
            </div>
          </DottedBackground>
          <div className="w-full bg-[#171717] p-[10px] rounded-bl-[20px] rounded-br-[20px] flex" />
        </div>
      </div>
    </div>
  );
};

// Wrapper component that shows initial trigger configuration
const InitialTriggerConfigWrapper: FC = () => {
  const dispatch = useAppDispatch();
  const allNodes = useSelector(selectTree);
  const rootNodes = useSelector(selectRootNodes);
  const [showInitialConfig, setShowInitialConfig] = useState(false);
  const [triggerConfirmed, setTriggerConfirmed] = useState(allNodes.length > 1);

  // We'll just take the first root node - should be the trigger
  const rootNode = rootNodes[0];

  const handleConfigConfirm = (data: any, renderedText: string) => {
    // Immediately update the trigger node with configuration data
    dispatch(
      treeSlice.actions.updateNode({
        id: rootNode.id,
        data: data,
        renderedText: renderedText,
      }),
    );

    // Mark trigger as confirmed and hide configuration
    setTriggerConfirmed(true);
    setShowInitialConfig(false);
  };

  const closeConfigDialog = () => {
    setShowInitialConfig(false);
  };

  return (
    <>
      {/* Only render the tree if the trigger has been confirmed */}
      {triggerConfirmed && <RenderTree />}

      {/* Initial Trigger Configuration Dialog */}
      {showInitialConfig && (
        <NodeConfigurationDialog
          isOpen={showInitialConfig}
          onClose={closeConfigDialog}
          onConfirm={handleConfigConfirm}
          selectedNodeType={NodeType.TRIGGER}
          parentNode={rootNode}
          initialData={{ nodeIdentifier: "api" }}
          isEditing={false}
        />
      )}

      {/* Show an initial prompt if neither the config dialog nor tree is visible */}
      {!showInitialConfig && !triggerConfirmed && (
        <div className="flex items-center justify-center p-10">
          <div className="text-center">
            <h3 className="text-xl font-medium text-white">
              Create Your Agent
            </h3>
            <p className="text-gray-500 mb-6 text-white">
              Start by configuring your trigger node
            </p>
            <NodeButton
              onClick={() => setShowInitialConfig(true)}
              variant="default"
            >
              Configure Trigger
            </NodeButton>
          </div>
        </div>
      )}
    </>
  );
};
