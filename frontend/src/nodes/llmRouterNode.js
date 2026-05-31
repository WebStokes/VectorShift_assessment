import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const LLMRouterNode = ({ id, data }) => {

  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [mode, setMode] = useState(
    data?.mode || "auto"
  );

  return (
    <BaseNode
      title="LLM Router"
      status={data?.executionStatus}
      accent="#60a5fa"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <label>
        Mode:
      </label>

      <select
        value={mode}
        onChange={(e) => {

          setMode(
            e.target.value
          );

          updateNodeField(
            id,
            "mode",
            e.target.value
          );

        }}
      >
        <option value="auto">
          Auto
        </option>

        <option value="gemini">
          Gemini
        </option>

        <option value="groq">
          Groq
        </option>

        <option value="compare">
          Compare
        </option>
      </select>
      {data?.executionOutput?.model && (
        <div className="inline-result">
          Winner: {data.executionOutput.model}
          {data.executionOutput.response_time_ms ? ` · ${data.executionOutput.response_time_ms}ms` : ""}
        </div>
      )}

    </BaseNode>
  );
};
