import { useState, useMemo } from "react";
import { Handle, Position } from "reactflow";
import { BaseNode } from "./BaseNode";

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(
    data?.text || "{{input}}"
  );

  const variables = useMemo(() => {
    const regex = /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g;

    const foundVariables = [];
    let match;

    while ((match = regex.exec(currText)) !== null) {
      foundVariables.push(match[1]);
    }

    return [...new Set(foundVariables)];
  }, [currText]);

  const longestLine = Math.max(
    ...currText
      .split("\n")
      .map(line => line.length)
  );

  const width = Math.max(
    260,
    Math.min(
      700,
      longestLine * 10
    )
  );

  const height = Math.max(
    150,
    currText.split("\n").length * 35
  );

  return (
    <div style={{ position: "relative" }}>
      {variables.map((variable, index) => (
        <Handle
          key={variable}
          type="target"
          position={Position.Left}
          id={`${id}-${variable}`}
          style={{
            top: `${((index + 1) * 100) / (variables.length + 1)}%`,
          }}
        />
      ))}

      <BaseNode
        title="Text"
        width={width}
        height={height}
        outputs={[
          {
            id: `${id}-output`,
          },
        ]}
      >
        <label>
          Text:
        </label>

        <textarea
          value={currText}
          onChange={(e) => setCurrText(e.target.value)}
          style={{
            width: "100%",
            minHeight: "80px",
            resize: "none",
            marginTop: "8px",
          }}
        />
      </BaseNode>
    </div>
  );
};