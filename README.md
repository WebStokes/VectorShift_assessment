# VectorShift AI Workflow Builder

## Overview

This project is an enhanced AI Workflow Builder inspired by VectorShift's no-code AI automation platform.

Users can visually create workflows by connecting nodes together and execute intelligent pipelines powered by Large Language Models (LLMs), APIs, calculators, databases, and other workflow components.

The project extends the original assessment requirements by introducing:

* Multi-LLM Routing
* Gemini Integration
* Groq Integration
* Prompt Engineering Layer
* Task Classification
* Workflow Execution Engine
* Execution History Tracking
* Production-Style UI

---

# Features

## Workflow Builder

* Drag-and-drop node creation
* Visual node connections
* React Flow based canvas
* DAG (Directed Acyclic Graph) validation
* Dynamic workflow execution

---

## AI Features

### LLM Node

Execute prompts using:

* Google Gemini
* Groq (Llama 3)

### LLM Router Node

Supports:

* Auto Selection
* Gemini
* Groq
* Compare Mode

Compare Mode executes multiple models and selects the best response automatically.

---

## Prompt Builder

The system automatically classifies requests and generates optimized prompts.

Examples:

### Coding

Input:

Write a Spring Boot REST API

Generated Prompt:

You are a senior software architect...

---

### Email

Input:

Write a professional leave application

Generated Prompt:

You are an expert business communication specialist...

---

## Execution History

All workflow executions are logged and stored.

Stored Information:

* Timestamp
* Task Type
* Selected Model
* Prompt
* Response

---

# Available Nodes

## Input Node

Accepts user input.

Supported Types:

* Text

---

## LLM Node

Direct interaction with a selected AI model.

Supported Models:

* Gemini
* Groq

---

## LLM Router Node

Automatically routes requests to the best model.

Modes:

* Auto
* Gemini
* Groq
* Compare

---

## Calculator Node

Supported Operations:

* Addition
* Subtraction
* Multiplication
* Division

Example:

12,2 → * → 24

---

## API Node

Supports:

* GET
* POST
* PUT
* DELETE

Used for external integrations.

---

## Email Node

Generates:

* Professional Emails
* Business Emails
* Custom Templates

---

## Database Node

Simulates database query workflows.

---

## Image Node

Supports image-related workflow execution.

---

## Output Node

Displays:

* Text
* Structured Data
* Workflow Results

---

# Example Workflows

## AI Workflow

Input
→ LLM Router
→ Output

Prompt:

Write a Spring Boot REST API

---

## Calculator Workflow

Input
→ Calculator
→ Output

Input:

12,2

Operation:

*

Output:

24

---

## Multi-LLM Comparison Workflow

Input
→ LLM Router (Compare)
→ Output

Execution:

* Gemini Response
* Groq Response
* Automatic Evaluation
* Best Response Selection

---

## API Workflow

Input
→ API
→ Output

Example:

GitHub User Lookup

---

# Architecture

Frontend

React
↓
React Flow
↓
Zustand

Backend

FastAPI
↓
Workflow Parser
↓
Graph Executor
↓
Prompt Builder
↓
Task Classifier
↓
LLM Router
↓
Gemini / Groq
↓
Output

---

# Tech Stack

## Frontend

* React
* React Flow
* Zustand
* JavaScript

## Backend

* FastAPI
* Python

## AI

* Google Gemini
* Groq
* Prompt Engineering

---

# Installation

## Clone Repository

git clone <repository-url>

---

## Frontend

cd frontend

npm install

npm start

Frontend runs on:

http://localhost:3000

---

## Backend

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

Backend runs on:

http://127.0.0.1:8000

Swagger Documentation:

http://127.0.0.1:8000/docs

---

# Environment Variables

Create:

backend/.env

GEMINI_API_KEY=your_key

GROQ_API_KEY=your_key

---

# Testing

Validated Components:

* Input Node
* Output Node
* LLM Node
* LLM Router Node
* Calculator Node
* API Node
* Email Node
* Database Node
* Image Node
* DAG Validation
* Workflow Execution Engine

---

# Future Improvements

* Workflow Persistence
* User Authentication
* Workflow Sharing
* Vector Database Integration
* RAG Pipelines
* Agentic Workflows
* OpenAI / Claude Support
* Docker Deployment
* Cloud Deployment

---

# Author

Sobit Samanta

VectorShift Technical Assessment Submission
