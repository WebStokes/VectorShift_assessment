// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodeIDs: {},
    nodes: [],
    edges: [],
    selectedNodeId: null,
    executionStatus: "idle",
    executionOrder: [],
    executionLogs: [],
    executionHistory: [],
    savedWorkflows: [],
    lastExecution: null,
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, [fieldName]: fieldValue },
            };
          }
  
          return node;
        }),
      });
    },
    setSelectedNodeId: (nodeId) => {
      set({ selectedNodeId: nodeId });
    },
    applyExecutionResult: (result) => {
      const statuses = result.node_statuses || {};
      const outputs = result.node_outputs || {};
      set({
        executionStatus: result.status,
        executionOrder: result.order || [],
        executionLogs: result.logs || [],
        lastExecution: result,
        nodes: get().nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            executionStatus: statuses[node.id]?.status || "pending",
            executionError: statuses[node.id]?.error,
            durationMs: statuses[node.id]?.duration_ms,
            result: outputs[node.id]?.result ?? node.data?.result,
            executionOutput: outputs[node.id],
          },
        })),
      });
    },
    setExecutionRunning: () => {
      set({
        executionStatus: "running",
        executionLogs: [],
        nodes: get().nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            executionStatus: "pending",
            executionError: undefined,
          },
        })),
      });
    },
    loadWorkflow: (workflow) => {
      set({
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        selectedNodeId: null,
      });
    },
    saveWorkflowLocal: (name) => {
      const workflow = {
        name,
        nodes: get().nodes,
        edges: get().edges,
        savedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("workflows") || "[]");
      const next = [workflow, ...existing.filter((item) => item.name !== name)].slice(0, 20);
      localStorage.setItem("workflows", JSON.stringify(next));
      set({ savedWorkflows: next });
      return workflow;
    },
    loadLocalWorkflows: () => {
      set({
        savedWorkflows: JSON.parse(localStorage.getItem("workflows") || "[]"),
        executionHistory: JSON.parse(localStorage.getItem("executionHistory") || "[]"),
      });
    },
    addExecutionHistory: (entry) => {
      const next = [entry, ...get().executionHistory].slice(0, 30);
      localStorage.setItem("executionHistory", JSON.stringify(next));
      set({ executionHistory: next });
    },
  }));
