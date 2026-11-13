# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## 🚀 Suggested Project Scenarios

Copy and paste these into the **Project_Definition** terminal to see the agents in action:

### 1. "Pulse-Check" (Remote Team Sentiment Platform)
> "Develop a secure, anonymous employee sentiment analysis platform for remote-first teams. It should feature a daily 1-minute 'vibe check' via Slack/Teams, a manager dashboard showing aggregated trends without exposing individual identities, and AI-driven burnout alerts."

### 2. "Green-Loop" (Eco-Subscription Marketplace)
> "Create an e-commerce platform for eco-friendly product subscription boxes. Users should be able to customize their monthly delivery based on sustainability goals. The architecture must handle recurring billing and carbon-footprint tracking."

### 3. "Code-Sentry" (Automated Security Auditor)
> "Build a developer tool that connects to GitHub repositories and performs real-time security audits on every Pull Request. It should identify leaked secrets and OWASP Top 10 vulnerabilities."

## ⚙️ Architecture & Technology Stack

### Frontend (User Interface)
- **Framework**: Built with **Next.js 15** (App Router) and **React 19**.
- **Design System**: A high-fidelity monochrome terminal aesthetic utilizing **Tailwind CSS** and **ShadCN UI**.
- **State Management**: Real-time synchronization with **Firebase Firestore**.
- **Artifact Rendering**: A custom-built, responsive workspace that handles multi-file source code and technical blueprints in a strictly vertical "stack" form.

### Backend (AI Orchestration)
- **Engine**: Powered by **Google Genkit** and **Gemini 2.5 Flash**.
- **Logic**: Implemented via **Prompt Chaining**. Data flows sequentially from one specialized agent to the next, maintaining state within a single Firestore document.
- **Security**: Strict **User-Ownership** policies enforced by **Firestore Security Rules**.

## 📂 RAG vs. Chaining (Current Scope)
Currently, AutoDev Pod utilizes **Prompt Chaining**. It relies on the model's parametric knowledge and context injected from previous steps.

### RAG Roadmap & Similarity Parameters
In the future RAG roadmap, the system will implement vector retrieval with the following parameters:
- **Metric**: **Cosine Similarity** (calculating semantic orientation) to find related code patterns.
- **Embeddings**: High-density vector representations via Google text-embedding models.
- **Top-K Retrieval**: Extracting the top 5-10 most relevant code "chunks" to inject into context.

## 💻 Technical Languages
- **TypeScript**: Core logic, components, and AI flows.
- **CEL (Common Expression Language)**: Firestore Security Rules.
- **Tailwind CSS**: High-end technical styling.
- **Markdown**: Report generation and documentation.

## 📝 CV / Portfolio Highlight
"Developed an autonomous multi-agent AI platform utilizing **Next.js 15**, **Google Genkit**, and **Firebase**. Orchestrated five specialized AI agents to automate the full software engineering lifecycle—generating functional requirements, system architectures, production-ready code, and DevOps deployment strategies."

## 📡 Pipeline Execution

1. **Idea Input**: Provide a high-level project concept.
2. **Autonomous Trigger**: Start the pipeline to engage agents sequentially.
3. **Review & Iterate**: Inspect artifacts in the real-time terminal and tabbed viewer.
4. **Export**: Download the verified Executive Engineering Report in Markdown format.
