import { Handle, Position } from "reactflow";

export const BaseNode = ({
  title,
  children,
  inputs = [],
  outputs = [],
  width = 260,
  height = 120,
  status,
  accent = "#38bdf8",
}) => {
  return (
    <div
      className={`workflow-node status-${status || "idle"}`}
      style={{ width, minHeight: height, "--node-accent": accent }}
    >
      <div className="node-header">
        <span className="node-accent" />
        <span>{title}</span>
        {status && <span className="node-status">{status}</span>}
      </div>

      {inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: `${((index + 1) * 100) / (inputs.length + 1)}%`,
          }}
        />
      ))}

      {outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: `${((index + 1) * 100) / (outputs.length + 1)}%`,
          }}
        />
      ))}

      <div style={{ padding: "10px" }}>
        {children}
      </div>
    </div>
  );
};
