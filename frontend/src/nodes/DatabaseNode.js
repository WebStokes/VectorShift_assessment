import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const DatabaseNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [table, setTable] = useState(data?.table || "users");

  return (
    <BaseNode
      title="Database"
      status={data?.executionStatus}
      accent="#84cc16"
      inputs={[
        { id: `${id}-query` },
      ]}
      outputs={[
        { id: `${id}-result` },
      ]}
    >
      <input
        value={table}
        onChange={(e) => {
          setTable(e.target.value);
          updateNodeField(id, "table", e.target.value);
        }}
      />
      <textarea
        rows={3}
        value={data?.query || `SELECT * FROM ${table}`}
        onChange={(e) => updateNodeField(id, "query", e.target.value)}
      />
    </BaseNode>
  );
};
