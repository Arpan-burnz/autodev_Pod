# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## 🚀 The AutoDev Pod Team

The system utilizes five specialized AI agents, powered by **Google Gemini** and orchestrated via **Genkit**, to deliver production-ready engineering artifacts.

### 01. AI Product Manager (PM)
Transforms ambiguity into technical rigor.
- **Role**: Technical Product Management & Business Analysis.
- **Mission**: To bridge the gap between user vision and engineering execution.
- **Outputs**: Comprehensive Functional/Non-functional requirements, structured User Stories, and deep Feature Specifications.

### 02. AI System Architect
Designs the structural blueprint and technical foundation.
- **Role**: Enterprise Systems Architecture & Data Modeling.
- **Mission**: To ensure scalability, security, and maintainability through proven structural patterns.
- **Outputs**: System Architecture Narratives, detailed Database Schemas, and REST/GraphQL API contracts.

### 03. AI Developer
Writes production-grade, modular source code.
- **Role**: Senior Principal Software Engineer.
- **Mission**: To implement technical designs into executable, high-quality code assets formatted in a clean, vertical "stack" form.
- **Outputs**: Modular TypeScript/Next.js codebases.

### 04. AI Quality Assurance (QA)
Performs autonomous audits and security reviews.
- **Role**: Software Quality & Security Engineering.
- **Mission**: To identify vulnerabilities and ensure code meets rigorous performance standards.
- **Outputs**: Logic bug identification, Security Vulnerabilities, and multi-tier Test Plans.

### 05. AI DevOps Engineer
Formulates modern infrastructure and delivery strategies.
- **Role**: Infrastructure & Cloud Operations.
- **Mission**: To automate the path from code to production.
- **Outputs**: CI/CD Pipeline outlines and automated Deployment Instructions.

## ⚙️ Architecture: Chaining vs. RAG

Currently, AutoDev Pod utilizes **Prompt Chaining** and **Context Injection**. Data flows sequentially through the agents to maintain state.

### Is RAG Implemented?
No. RAG (Retrieval-Augmented Generation) is not part of the core MVP. The system relies on the model's parametric knowledge and the specific context passed through the pipeline.

### Scope of RAG (Future Integration)
- **Code Retrieval**: Searching internal libraries for reusable components.
- **Doc Retrieval**: Querying up-to-date documentation for specialized libraries.
- **Standards Retrieval**: Auditing code against specific, non-public corporate standards.

## 💻 Technical Stack & Languages

- **Primary Language**: **TypeScript** (Used for 100% of application logic, components, and AI flows).
- **Frontend Framework**: **Next.js 15** (App Router) & **React 19**.
- **AI Orchestration**: **Google Genkit** & **Gemini 2.5 Flash**.
- **Styling**: **Tailwind CSS** & **ShadCN UI**.
- **Persistence & Auth**: **Firebase Firestore** & **Firebase Auth**.
- **Security Logic**: **CEL** (Common Expression Language) for Firestore Rules.
- **Configuration**: **JSON**, **YAML**, and **Shell (.env)**.

## 📦 How to Upload to GitHub

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AutoDev Pod Core"
   ```
2. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

**Note:** Ensure your `GEMINI_API_KEY` and Firebase config are set as Environment Variables in your deployment platform.
