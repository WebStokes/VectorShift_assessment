import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const AIInputNode = ({ id, data }) => {

  const updateNodeField = useStore((state) => state.updateNodeField);
  const [prompt, setPrompt] = useState(data?.prompt || "");

  return (
    <BaseNode
      title="AI Input"
      status={data?.executionStatus}
      accent="#818cf8"
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

        <label>
          Prompt:
        </label>

        <textarea
          value={prompt}
          onChange={(e) =>
            {
              setPrompt(e.target.value);
              updateNodeField(id, "prompt", e.target.value);
            }
          }
          rows={5}
          placeholder="Enter your AI request..."
          style={{
            resize: "none",
            width: "100%",
          }}
        />
        {data?.result && (
          <pre className="mini-json">{JSON.stringify(data.result, null, 2)}</pre>
        )}

      </div>
    </BaseNode>
  );
};
