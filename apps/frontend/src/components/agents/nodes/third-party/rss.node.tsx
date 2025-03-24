"use client";

import {
  NodeComponent,
  nodesHighOrderComponent,
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ReactNode } from "react";
import { Label } from "@frontend/components/ui/label";
import { Input } from "@frontend/components/ui/input";
import {string} from "yup";

class RssNodeComponent extends NodeComponent {
  state = {
    data: {
      url: "",
    },
  };

  componentDidMount() {
    // Initialize with existing data or default
    if (this.props.node.data && this.props.node.data.url) {
      this.setState({
        data: {
          url: this.props.node.data.url,
        },
      });
    }
  }

  handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = {
      ...this.state.data,
      url: event.target.value,
    };

    this.setState({ data: newData });
  };

  async validate(): Promise<string[] | true> {
    try {
      new URL(this.state.data.url);
      return true;
    }
    catch (error) {
      return ['Invalid url'];
    }
  }

  renderNode = () => {
    return this.state.data.url;
  };

  render(): ReactNode {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rss-url">RSS Feed URL</Label>
          <Input
            id="rss-url"
            type="url"
            placeholder="https://example.com/feed.xml"
            value={this.state.data.url}
            onChange={this.handleUrlChange}
          />
        </div>
      </div>
    );
  }
}

export default nodesHighOrderComponent({
  title: "RSS Feed",
  outputs: ["prompt"],
  identifier: "rss-feed",
  component: RssNodeComponent,
  type: NodeType.THIRD_PARTY,
});
