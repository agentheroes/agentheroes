export enum NodeType {
  TRIGGER = "trigger",
  THIRD_PARTY = "thirdParty",
  GENERATE_IMAGE = "generateImage",
  GENERATE_VIDEO = "generateVideo",
  PUBLISH = "publish",
}

export interface AgentNode {
  type: NodeType;
  name: string;
  multiple: boolean;
  dependsOn: NodeType[];
}

export const steps: AgentNode[] = [
  {
    type: NodeType.TRIGGER,
    name: "Trigger",
    multiple: false,
    dependsOn: [],
  },
  {
    type: NodeType.THIRD_PARTY,
    name: "Third Party",
    multiple: true,
    dependsOn: [NodeType.TRIGGER],
  },
  {
    type: NodeType.GENERATE_IMAGE,
    name: "Generate Image",
    multiple: true,
    dependsOn: [NodeType.TRIGGER, NodeType.THIRD_PARTY],
  },
  {
    type: NodeType.GENERATE_VIDEO,
    name: "Generate Video",
    multiple: true,
    dependsOn: [
      NodeType.TRIGGER,
      NodeType.THIRD_PARTY,
      NodeType.GENERATE_IMAGE,
    ],
  },
  {
    type: NodeType.PUBLISH,
    name: "Publish",
    multiple: true,
    dependsOn: [NodeType.GENERATE_IMAGE, NodeType.GENERATE_VIDEO],
  },
];
