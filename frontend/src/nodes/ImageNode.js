import { BaseNode } from "./BaseNode";
import { useStore } from "../store";

export const ImageNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  return (
    <BaseNode
      title="Image"
      status={data?.executionStatus}
      accent="#f472b6"
      inputs={[
        { id: `${id}-image` },
      ]}
      outputs={[
        { id: `${id}-processed` },
      ]}
    >
      <select
        value={data?.mode || "generate"}
        onChange={(e) => updateNodeField(id, "mode", e.target.value)}
      >
        <option value="generate">Prompt to Image</option>
        <option value="analyze">Image Analysis</option>
      </select>
      <textarea
        rows={3}
        placeholder="Prompt or reference image notes"
        value={data?.prompt || ""}
        onChange={(e) => updateNodeField(id, "prompt", e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => updateNodeField(id, "imageName", e.target.files?.[0]?.name || "")}
      />
      {String(data?.result || "").startsWith("data:image") && (
        <img className="node-image-preview" src={data.result} alt="Generated" />
      )}
    </BaseNode>
  );
};
