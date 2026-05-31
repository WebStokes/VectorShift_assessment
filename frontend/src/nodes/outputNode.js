import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const OutputNode = ({ id, data }) => {

  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [currName, setCurrName] = useState(
    data?.outputName ||
    id.replace("customOutput-", "output_")
  );

  const [outputType, setOutputType] = useState(
    data?.outputType || "Text"
  );

  return (
    <BaseNode
      title="Output"
      status={data?.executionStatus}
      accent="#34d399"
      width={320}
      inputs={[
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

            setCurrName(
              e.target.value
            );

            updateNodeField(
              id,
              "outputName",
              e.target.value
            );

          }}
        />
      </label>

      <br />

      <label>
        Type:
        <select
          value={outputType}
          onChange={(e) => {

            setOutputType(
              e.target.value
            );

            updateNodeField(
              id,
              "outputType",
              e.target.value
            );

          }}
        >
          <option value="Text">
            Text
          </option>

          <option value="JSON">JSON</option>
          <option value="Image">Image</option>
          <option value="Table">Table</option>
        </select>
      </label>

      <hr />

      <label>
        Result:
      </label>

      <div className="output-preview">
        {String(data?.result || "").startsWith("data:image") ? (
          <img src={data.result} alt="Generated result" />
        ) : (
          <pre>{typeof data?.result === "object" ? JSON.stringify(data.result, null, 2) : data?.result || ""}</pre>
        )}
      </div>
      {data?.executionError && <div className="node-error">{data.executionError}</div>}

    </BaseNode>
  );
};
