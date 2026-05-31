// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { CalculatorNode } from "./nodes/CalculatorNode";
import { ApiNode } from "./nodes/ApiNode";
import { EmailNode } from "./nodes/EmailNode";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { ImageNode } from "./nodes/ImageNode";
import { LLMRouterNode } from "./nodes/llmRouterNode";
import { AIInputNode } from "./nodes/AIInputNode";

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  calculator: CalculatorNode,
  api: ApiNode,
  email: EmailNode,
  database: DatabaseNode,
  image: ImageNode,
  llmRouter: LLMRouterNode,
  aiInput: AIInputNode,     
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setSelectedNodeId: state.setSelectedNodeId,
  selectedNodeId: state.selectedNodeId,
  executionOrder: state.executionOrder,
  executionLogs: state.executionLogs,
  savedWorkflows: state.savedWorkflows,
  executionHistory: state.executionHistory,
  loadWorkflow: state.loadWorkflow,
  saveWorkflowLocal: state.saveWorkflowLocal,
  loadLocalWorkflows: state.loadLocalWorkflows,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      setSelectedNodeId,
      selectedNodeId,
      executionOrder,
      executionLogs,
      savedWorkflows,
      executionHistory,
      loadWorkflow,
      saveWorkflowLocal,
      loadLocalWorkflows
    } = useStore(selector, shallow);

    useEffect(() => {
      loadLocalWorkflows();
      const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          saveWorkflowLocal(`workflow-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}`);
        }
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          document.querySelector(".primary-run-button")?.click();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [loadLocalWorkflows, saveWorkflowLocal]);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div className="studio-shell">
        <div className="canvas-panel" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId(null)}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#334155" gap={20} size={1}/>
                <Controls className="modern-controls" />
                <MiniMap
                  pannable
                  zoomable
                  className="modern-minimap"
                  nodeStrokeColor={(node) => node.data?.executionStatus === "failed" ? "#fb7185" : "#38bdf8"}
                  nodeColor={(node) => node.data?.executionStatus === "success" ? "#134e4a" : "#1e293b"}
                />
            </ReactFlow>
        </div>
        <aside className="right-panel">
          <section>
            <h3>Inspector</h3>
            {selectedNodeId ? (
              <pre>{JSON.stringify(nodes.find((node) => node.id === selectedNodeId)?.data, null, 2)}</pre>
            ) : (
              <p>Select a node to inspect settings and execution output.</p>
            )}
          </section>
          <section>
            <h3>Execution View</h3>
            <div className="execution-chain">
              {(executionOrder.length ? executionOrder : nodes.map((node) => node.id)).map((nodeId) => {
                const node = nodes.find((item) => item.id === nodeId);
                return (
                  <div key={nodeId} className={`chain-item ${node?.data?.executionStatus || "pending"}`}>
                    <span>{node?.type}</span>
                    <small>{node?.data?.executionStatus || "pending"}</small>
                  </div>
                );
              })}
            </div>
          </section>
          <section>
            <h3>Logs</h3>
            <div className="logs-panel">
              {executionLogs.map((log, index) => (
                <div key={`${log.node_id}-${index}`}>{log.node_id}: {log.message}</div>
              ))}
            </div>
          </section>
          <section>
            <h3>Save / Load</h3>
            <button onClick={() => saveWorkflowLocal(`workflow-${savedWorkflows.length + 1}`)}>
              Save JSON
            </button>
            <div className="saved-list">
              {savedWorkflows.map((workflow) => (
                <button key={workflow.name} onClick={() => loadWorkflow(workflow)}>
                  {workflow.name}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3>History</h3>
            {executionHistory.map((item) => (
              <div className="history-row" key={item.execution_id}>
                <span>{item.status}</span>
                <small>{item.duration_ms}ms</small>
              </div>
            ))}
          </section>
        </aside>
        </div>
    )
}
