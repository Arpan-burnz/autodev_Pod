# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is a high-fidelity, multi-agent AI development environment that simulates a complete software engineering lifecycle from a single project concept.

## 🚀 System Capabilities

The system utilizes five specialized AI agents, powered by **Google Gemini** and orchestrated via **Genkit**, to deliver production-ready engineering artifacts.

### 01. AI Product Manager (PM)
Translates project concepts into technical rigor.
- **Outputs**: Functional/Non-functional requirements, User Stories (As-a-I-want-so-that), and deep Feature Specifications.

### 02. AI System Architect
Builds the structural blueprint of the application.
- **Outputs**: System Architecture Narratives (Microservices, Monolithic, Serverless), Database Schemas (DDL), and API Endpoint Designs.

### 03. AI Developer
Writes production-grade, modular source code.
- **Outputs**: Multi-file TypeScript/Next.js codebases formatted in professional "Vertical Stack" form for maximum readability.

### 04. AI Quality Assurance (QA)
Performs autonomous audits and security reviews.
- **Outputs**: Identification of bugs and vulnerabilities, Code Review Summaries, and multi-tier Test Plans (Unit, E2E, Security).

### 05. AI DevOps
Designs the delivery and infrastructure strategy.
- **Outputs**: CI/CD Pipeline outlines, Deployment Instructions, and optimal cloud infrastructure suggestions.

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI Core**: Google Generative AI (Gemini 2.5 Flash) via Genkit
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google, GitHub, Email, Anonymous)
- **UI/UX**: React 19, Tailwind CSS, ShadCN UI, Lucide Icons
- **Theme**: "Terminal Engineering" (Inter & Space Grotesk typography)

## 📡 Pipeline Execution

1. **Idea Input**: Provide a high-level project concept.
2. **Autonomous Trigger**: Start the pipeline to engage agents sequentially.
3. **Review & Iterate**: Inspect artifacts in the real-time terminal and tabbed viewer.
4. **Export**: Download the verified Executive Engineering Report.
