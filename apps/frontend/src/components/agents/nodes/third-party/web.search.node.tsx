"use client";

import {
  NodeComponent,
  nodesHighOrderComponent,
} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Label } from "@frontend/components/ui/label";
import { Input } from "@frontend/components/ui/input";

export class WebSearchNodeComponent extends NodeComponent {
  state = { data: { query: "" } };

  componentDidMount() {
    this.setState({ data: { query: this.props.node.data?.query ?? "" } });
  }

  async validate(): Promise<string[] | true> {
    const query = this.state.data.query.trim();
    return query && query.length <= 2000
      ? true
      : ["Enter a search query of 1 to 2000 characters"];
  }

  renderNode() {
    return this.state.data.query;
  }

  render() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="web-search-query">Search query</Label>
          <Input
            id="web-search-query"
            placeholder="Recent developments in solar energy"
            maxLength={2000}
            value={this.state.data.query}
            onChange={(event) =>
              this.setState({ data: { query: event.target.value } })
            }
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Search the web with Parallel, with no account or API key. The query is
          sent to Parallel; source excerpts and URLs become the prompt for
          following nodes. Free usage limits apply.
        </p>
      </div>
    );
  }
}

export default nodesHighOrderComponent({
  title: "Web Search",
  outputs: ["prompt"],
  identifier: "web-search",
  component: WebSearchNodeComponent,
  type: NodeType.THIRD_PARTY,
});
