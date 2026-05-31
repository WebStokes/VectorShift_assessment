import { useStore } from "./store";

export const SubmitButton = () => {

    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const executionStatus = useStore((state) => state.executionStatus);
    const setExecutionRunning = useStore((state) => state.setExecutionRunning);
    const applyExecutionResult = useStore((state) => state.applyExecutionResult);
    const addExecutionHistory = useStore((state) => state.addExecutionHistory);

    const handleSubmit = async () => {

        try {
            if (!nodes.length) {
                alert("Add at least one node before running the workflow");
                return;
            }

            setExecutionRunning();

            const response = await fetch(
                "http://127.0.0.1:8000/workflows/execute",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        nodes,
                        edges,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Workflow execution failed");
            }

            applyExecutionResult(result);
            addExecutionHistory({
                execution_id: result.execution_id,
                status: result.status,
                duration_ms: result.duration_ms,
                ranAt: new Date().toISOString(),
            });

        } catch (error) {

            console.error(error);

            alert(
                error.message || "Failed to connect to backend"
            );
        }
    };

    return (
        <div className="run-bar">
            <button
                onClick={handleSubmit}
                className="primary-run-button"
                disabled={executionStatus === "running"}
            >
                {executionStatus === "running" ? "Running..." : "Run Workflow"}
            </button>
        </div>
    );
};
