import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const LLMNode = ({ id, data }) => {

  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [model, setModel] = useState(
    data?.model || "gemini"
  );

  const [temperature, setTemperature] =
    useState(
      data?.temperature || 0.7
    );

  return (
    <BaseNode
      title="LLM"
      status={data?.executionStatus}
      accent="#a78bfa"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
      outputs={[
        {
          id: `${id}-response`,
        },
      ]}
    >

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >

        <label>
          Model:
        </label>

        <select
          value={model}
          onChange={(e) => {

            setModel(
              e.target.value
            );

            updateNodeField(
              id,
              "model",
              e.target.value
            );
          }}
        >
          <option value="gemini">
            Gemini
          </option>

          <option value="groq">
            Groq
          </option>
          <option value="openai" disabled>
            OpenAI
          </option>
          <option value="claude" disabled>
            Claude
          </option>
        </select>
        <label>
          System Prompt:
        </label>
        <textarea
          rows={3}
          value={data?.systemPrompt || ""}
          onChange={(e) => updateNodeField(id, "systemPrompt", e.target.value)}
          placeholder="You are a helpful expert..."
        />

        <label>
          Temperature:
        </label>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => {

            setTemperature(
              e.target.value
            );

            updateNodeField(
              id,
              "temperature",
              e.target.value
            );
          }}
        />

        <div>
          {temperature}
        </div>
        <label>
          Max Tokens:
        </label>
        <input
          type="number"
          min="64"
          value={data?.maxTokens || 1024}
          onChange={(e) => updateNodeField(id, "maxTokens", Number(e.target.value))}
        />

      </div>

    </BaseNode>
  );
};
