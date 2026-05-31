import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const CalculatorNode = ({ id, data }) => {

  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [operation, setOperation] = useState(
    data?.operation || "+"
  );

  return (
    <BaseNode
      title="Calculator"
      status={data?.executionStatus}
      accent="#f59e0b"
      inputs={[
        { id: `${id}-a` },
        { id: `${id}-b` },
      ]}
      outputs={[
        { id: `${id}-result` },
      ]}
    >
      <label>
        Operation:

        <select
          value={operation}
          onChange={(e) => {

            setOperation(
              e.target.value
            );

            updateNodeField(
              id,
              "operation",
              e.target.value
            );

          }}
        >
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
          <option value="%">%</option>
          <option value="^">^</option>
        </select>

      </label>
      <input
        placeholder="12,2"
        value={data?.values || ""}
        onChange={(e) => updateNodeField(id, "values", e.target.value)}
      />
      {data?.result !== undefined && <div className="inline-result">{String(data.result)}</div>}
    </BaseNode>
  );
};
