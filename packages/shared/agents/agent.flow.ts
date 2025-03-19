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
  dependsOn: NodeType[];
}

export const steps: AgentNode[] = [
  {
    type: NodeType.TRIGGER,
    name: "Trigger",
    dependsOn: [],
  },
  {
    type: NodeType.THIRD_PARTY,
    name: "Third Party",
    dependsOn: [NodeType.TRIGGER],
  },
  {
    type: NodeType.GENERATE_IMAGE,
    name: "Generate Image",
    dependsOn: [NodeType.TRIGGER, NodeType.THIRD_PARTY],
  },
  {
    type: NodeType.GENERATE_VIDEO,
    name: "Generate Video",
    dependsOn: [
      NodeType.TRIGGER,
      NodeType.THIRD_PARTY,
      NodeType.GENERATE_IMAGE,
    ],
  },
  {
    type: NodeType.PUBLISH,
    name: "Publish",
    dependsOn: [NodeType.GENERATE_IMAGE, NodeType.GENERATE_VIDEO],
  },
];
