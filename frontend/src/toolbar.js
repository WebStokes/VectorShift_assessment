// toolbar.js

import { DraggableNode } from './draggableNode';
import { useMemo, useState } from 'react';

const NODE_CATALOG = [
    ["customInput", "Input", "I"],
    ["aiInput", "AI Input", "AI"],
    ["llm", "LLM", "L"],
    ["llmRouter", "Router", "R"],
    ["api", "API", "{}"],
    ["calculator", "Calc", "∑"],
    ["email", "Email", "@"],
    ["database", "DB", "DB"],
    ["image", "Image", "IMG"],
    ["customOutput", "Output", "O"],
    ["text", "Text", "T"],
];

export const PipelineToolbar = () => {
    const [query, setQuery] = useState("");
    const filtered = useMemo(
        () => NODE_CATALOG.filter((node) => node[1].toLowerCase().includes(query.toLowerCase())),
        [query]
    );

    return (
        <div className="toolbar">
            <div className="toolbar-topline">
                <div>
                    <strong>Workflow Studio</strong>
                    <span>Build, route, execute</span>
                </div>
                <input
                    className="node-search"
                    placeholder="Search nodes"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            <div className="toolbar-grid">
                {filtered.map(([type, label, icon]) => (
                    <DraggableNode key={type} type={type} label={label} icon={icon} />
                ))}
            </div>
        </div>
    );
};
