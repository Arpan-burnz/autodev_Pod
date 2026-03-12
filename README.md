# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## 🚀 The AutoDev Pod Team

The system utilizes five specialized AI agents, powered by **Google Gemini** and orchestrated via **Genkit**, to deliver production-ready engineering artifacts.

### 01. AI Product Manager (PM)
Transforms ambiguity into technical rigor.
- **Role**: Technical Product Management & Business Analysis.
- **Mission**: To bridge the gap between user vision and engineering execution.
- **Outputs**: Comprehensive Functional/Non-functional requirements, structured User Stories, and deep Feature Specifications including UX considerations and accessibility standards.

### 02. AI System Architect
Designs the structural blueprint and technical foundation.
- **Role**: Enterprise Systems Architecture & Data Modeling.
- **Mission**: To ensure scalability, security, and maintainability through proven structural patterns.
- **Outputs**: System Architecture Narratives, detailed Database Schemas (SQL/NoSQL), and rigorous REST/GraphQL API contracts.

### 03. AI Developer
Writes production-grade, modular source code.
- **Role**: Senior Principal Software Engineer.
- **Mission**: To implement technical designs into executable, high-quality code assets.
- **Outputs**: Modular TypeScript/Next.js codebases formatted in a clean, vertical "stack" form for maximum readability.

### 04. AI Quality Assurance (QA)
Performs autonomous audits and security reviews.
- **Role**: Software Quality & Security Engineering.
- **Mission**: To identify vulnerabilities and ensure the codebase meets rigorous performance standards.
- **Outputs**: Identification of logic bugs and security vulnerabilities, Code Review Summaries, and multi-tier Test Plans.

### 05. AI DevOps Engineer
Formulates modern infrastructure and delivery strategies.
- **Role**: Infrastructure & Cloud Operations.
- **Mission**: To automate the path from code to production.
- **Outputs**: CI/CD Pipeline outlines, automated Deployment Instructions, and optimal cloud infrastructure suggestions.

## 💻 Frontend Architecture

The frontend is a high-fidelity engineering dashboard designed for professional DevOps workflows.

- **Framework**: Next.js 15 (App Router) & React 19.
- **Styling**: Tailwind CSS with a custom "Terminal Engineering" theme (Space Grotesk & Inter typography).
- **Real-time Engine**: Firebase Firestore & Auth for instantaneous data persistence and multi-device sync.
- **UI Components**: ShadCN UI for high-performance, accessible dashboard modules.
- **State Machine**: Custom React hooks for managing the autonomous agent pipeline and log streaming.

## ⚙️ Backend Architecture

The backend is a serverless, event-driven orchestration layer.

- **AI Orchestration**: Google Genkit (v1.x) with Gemini 2.5 Flash.
- **AI Models**: Google Generative AI (Gemini) for high-speed technical reasoning.
- **Data Layer**: Firebase Firestore (NoSQL) with hierarchical user-owned document paths.
- **Authentication**: Firebase Auth (Google, GitHub, and Anonymous providers).
- **Security**: Granular Firestore Security Rules enforcing path-based ownership and data validation.
- **Execution**: Next.js Server Actions for seamless client-to-agent communication with robust retry logic and error handling.



**Note:** The `.gitignore` file included will protect your `.env` file from being uploaded. You will need to manually add your `GEMINI_API_KEY` and Firebase config to your deployment environment (e.g., Vercel Environment Variables or Firebase App Hosting).

## 📡 Pipeline Execution

1. **Idea Input**: Provide a high-level project concept.
2. **Autonomous Trigger**: Start the pipeline to engage agents sequentially.
3. **Review & Iterate**: Inspect artifacts in the real-time terminal and tabbed viewer.
4. **Export**: Download the verified Executive Engineering Report in Markdown format.
