import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const ApiNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [method, setMethod] = useState(data?.method || "GET");

  return (
    <BaseNode
      title="API"
      status={data?.executionStatus}
      accent="#2dd4bf"
      inputs={[
        { id: `${id}-request` },
      ]}
      outputs={[
        { id: `${id}-response` },
      ]}
    >
      <label>
        Method:
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            updateNodeField(id, "method", e.target.value);
          }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
      <input
        placeholder="https://api.github.com/users/octocat"
        value={data?.url || ""}
        onChange={(e) => updateNodeField(id, "url", e.target.value)}
      />
      <textarea
        rows={3}
        placeholder='Headers JSON: {"Authorization":"Bearer ..."}'
        value={data?.headers || ""}
        onChange={(e) => updateNodeField(id, "headers", e.target.value)}
      />
      <textarea
        rows={3}
        placeholder="Request body"
        value={data?.body || ""}
        onChange={(e) => updateNodeField(id, "body", e.target.value)}
      />
      {data?.result && <div className="inline-result">Response ready</div>}
    </BaseNode>
  );
};
