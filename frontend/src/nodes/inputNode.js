import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const InputNode = ({ id, data }) => {

  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [currName, setCurrName] = useState(
    data?.inputName || id.replace("customInput-", "input_")
  );

  const [inputType, setInputType] = useState(
    data?.inputType || "Text"
  );

  const [prompt, setPrompt] = useState(
    data?.prompt || ""
  );

  return (
    <BaseNode
      title="Input"
      status={data?.executionStatus}
      accent="#22d3ee"
      outputs={[
        {
          id: `${id}-value`,
        },
      ]}
    >
      <label>
        Name:
        <input
          value={currName}
          onChange={(e) => {
            setCurrName(e.target.value);

            updateNodeField(
              id,
              "inputName",
              e.target.value
            );
          }}
        />
      </label>

      <br />

      <label>
        Type:
        <select
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);

            updateNodeField(
              id,
              "inputType",
              e.target.value
            );
          }}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
          <option value="Image">Image</option>
          <option value="URL">URL</option>
        </select>
      </label>

      <br />

      <label>
        Prompt:
      </label>

      <textarea
        value={prompt}
        onChange={(e) => {

          setPrompt(
            e.target.value
          );

          updateNodeField(
            id,
            "prompt",
            e.target.value
          );
        }}
        rows={4}
        placeholder="Enter your request..."
        style={{
          width: "100%",
          resize: "none",
          marginTop: "5px",
        }}
      />
      <input
        type="url"
        placeholder="https://example.com"
        value={data?.url || ""}
        onChange={(e) => updateNodeField(id, "url", e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => updateNodeField(id, "fileName", e.target.files?.[0]?.name || "")}
      />
    </BaseNode>
  );
};
