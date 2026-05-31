import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const EmailNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [recipient, setRecipient] = useState(data?.recipient || "");

  return (
    <BaseNode
      title="Email"
      status={data?.executionStatus}
      accent="#fb7185"
      inputs={[
        { id: `${id}-content` },
      ]}
      outputs={[
        { id: `${id}-status` },
      ]}
    >
      <input
        placeholder="Recipient"
        value={recipient}
        onChange={(e) => {
          setRecipient(e.target.value);
          updateNodeField(id, "recipient", e.target.value);
        }}
      />
      <input
        placeholder="Subject"
        value={data?.subject || ""}
        onChange={(e) => updateNodeField(id, "subject", e.target.value)}
      />
      <select
        value={data?.tone || "professional"}
        onChange={(e) => updateNodeField(id, "tone", e.target.value)}
      >
        <option value="professional">Professional</option>
        <option value="friendly">Friendly</option>
        <option value="formal">Formal</option>
      </select>
      <select
        value={data?.template || "Business Proposal"}
        onChange={(e) => updateNodeField(id, "template", e.target.value)}
      >
        <option>Leave Application</option>
        <option>Resignation</option>
        <option>Business Proposal</option>
        <option>Meeting Request</option>
      </select>
    </BaseNode>
  );
};
