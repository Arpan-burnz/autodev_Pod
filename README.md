
# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## ⚙️ Architecture: Frontend & Backend

### Frontend (User Interface)
- **Framework**: Built with **Next.js 15** (App Router) and **React 19**.
- **Design System**: A high-fidelity monochrome terminal aesthetic utilizing **Tailwind CSS** and **ShadCN UI**.
- **State Management**: Real-time synchronization with **Firebase Firestore**. The UI listens for agent updates and reflects stage completion instantly.
- **Artifact Rendering**: A custom-built, responsive workspace that handles multi-file source code, technical blueprints, and executive reports in a strictly vertical "stack" form.

### Backend (AI Orchestration)
- **Engine**: Powered by **Google Genkit** and **Gemini 2.5 Flash**.
- **Logic**: Implemented via **Prompt Chaining**. Data flows sequentially from one specialized agent to the next, maintaining state within a single Firestore document.
- **Security**: Strict **User-Ownership** policies enforced by **Firestore Security Rules** (using CEL), ensuring all engineering assets are private to the creator.
- **Infrastructure**: Serverless execution via **Next.js Server Actions**, allowing for high-scaling AI compute without a persistent server.

## 🚀 The AI Engineering Team

1. **AI Product Manager**: Transforms ambiguity into technical rigor. Outputs Functional/Non-functional requirements and User Stories.
2. **AI System Architect**: Designs structural blueprints. Outputs Data Schemas and REST/GraphQL API contracts.
3. **AI Developer**: Senior Principal Software Engineer. Implements technical designs into modular, vertical-stack TypeScript code.
4. **AI Quality Assurance**: Autonomous audit agent. Identifies bugs, vulnerabilities, and drafts multi-tier Test Plans.
5. **AI DevOps Engineer**: Infrastructure strategist. Formulates CI/CD pipelines and automated deployment instructions.

## 📂 RAG vs. Chaining (Current Scope)
Currently, AutoDev Pod utilizes **Prompt Chaining**. It relies on the model's parametric knowledge and context injected from previous steps.

**Future RAG Scope**:
- **Code Retrieval**: Searching local libraries for reusable snippets.
- **Doc Retrieval**: Real-time lookup of up-to-date documentation for libraries like Genkit or Firebase.
- **Standards Retrieval**: Auditing code against proprietary corporate compliance standards.

## 💻 Technical Languages
- **TypeScript**: Core logic, components, and AI flows.
- **CEL (Common Expression Language)**: Robust Firestore Security Rules.
- **Tailwind CSS**: High-end technical styling.
- **JSON/YAML**: Configuration and system definitions.

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

**Note:** Ensure your `GEMINI_API_KEY` is set as an Environment Variable in your deployment platform.
