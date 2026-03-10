# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## 🚀 The AutoDev Pod Team

The system utilizes five specialized AI agents, powered by **Google Gemini** and orchestrated via **Genkit**, to deliver production-ready engineering artifacts.

### 01. AI Product Manager (PM)
Distills vague ideas into structured technical rigor.
- **Role**: Technical Product Management.
- **Outputs**: Functional/Non-functional requirements, User Stories (As-a-I-want-so-that), and deep Feature Specifications including UX considerations.

### 02. AI System Architect
Designs the structural blueprint and technical foundation.
- **Role**: Enterprise Systems Architecture.
- **Outputs**: System Architecture Narratives (Microservices, Monolithic, Serverless), Database Schemas (SQL/NoSQL), and detailed REST/GraphQL API contracts.

### 03. AI Developer
Writes production-grade, modular source code.
- **Role**: Senior Principal Software Engineer.
- **Outputs**: High-quality TypeScript/Next.js codebases formatted in a clean, vertical "stack" form for maximum readability and maintainability.

### 04. AI Quality Assurance (QA)
Performs autonomous audits and security reviews.
- **Role**: Software Quality Engineering.
- **Outputs**: Identification of bugs and vulnerabilities, Code Review Summaries, and multi-tier Test Plans (Unit, Integration, Security).

### 05. AI DevOps Engineer
Formulates modern infrastructure and delivery strategies.
- **Role**: Infrastructure & Cloud Operations.
- **Outputs**: CI/CD Pipeline outlines, Deployment Instructions, and optimal cloud infrastructure suggestions for platforms like Vercel, AWS, or GCP.

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
