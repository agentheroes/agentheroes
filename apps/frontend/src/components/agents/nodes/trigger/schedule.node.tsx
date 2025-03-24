"use client";

import {NodeComponent, nodesHighOrderComponent} from "@frontend/components/agents/nodes/nodes.high.order.component";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { ReactNode } from "react";
import { Label } from "@frontend/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@frontend/components/ui/select";

interface ScheduleInterval {
  value: string;
  label: string;
}

const intervals: ScheduleInterval[] = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "4", label: "4 hours" },
  { value: "16", label: "16 hours" },
  { value: "24", label: "24 hours" },
  { value: "48", label: "48 hours" },
];

class ScheduleNodeComponent extends NodeComponent {
  state = {
    data: {
      interval: "24"
    }
  };

  componentDidMount() {
    // Initialize with existing data or default
    if (this.props.node.data && this.props.node.data.interval) {
      this.setState({
        data: {
          interval: this.props.node.data.interval
        }
      });
    }
  }

  handleIntervalChange = (value: string) => {
    const newData = {
      ...this.state.data,
      interval: value
    };
    
    this.setState({ data: newData });
  };

  renderNode = () => {
    return `Run every ${this.state.data.interval}`;
  }

  render(): ReactNode {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="interval-select">Run every</Label>
          <Select 
            value={this.state.data.interval} 
            onValueChange={this.handleIntervalChange}
          >
            <SelectTrigger id="interval-select">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {intervals.map(interval => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
}

export default nodesHighOrderComponent({
  title: "Schedule",
  outputs: [],
  identifier: "schedule",
  component: ScheduleNodeComponent,
  type: NodeType.TRIGGER,
});
