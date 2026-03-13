
# AutoDev Pod | Autonomous Engineering Node

AutoDev Pod is an autonomous, multi-agent AI system designed to simulate an entire software development department. It transforms a single high-level project idea into a complete engineering package—including requirements, architecture, production-ready code, quality audits, and deployment plans.

## 🚀 Suggested Project Scenarios

Copy and paste these into the **Project_Definition** terminal to see the agents in action:

### 1. "Pulse-Check" (Remote Team Sentiment Platform)
> "Develop a secure, anonymous employee sentiment analysis platform for remote-first teams. It should feature a daily 1-minute 'vibe check' via Slack/Teams, a manager dashboard showing aggregated trends without exposing individual identities, and AI-driven burnout alerts. The system needs to support multi-tenancy and high data encryption."

### 2. "Green-Loop" (Eco-Subscription Marketplace)
> "Create an e-commerce platform for eco-friendly product subscription boxes. Users should be able to customize their monthly delivery based on sustainability goals (e.g., zero plastic, vegan-only). The architecture must handle recurring billing, inventory sync with local sustainable suppliers, and a carbon-footprint tracker for every shipment."

### 3. "Code-Sentry" (Automated Security Auditor)
> "Build a developer tool that connects to GitHub repositories and performs real-time security audits on every Pull Request. It should identify 'leaked secrets', 'deprecated dependencies', and 'OWASP Top 10 vulnerabilities'. Provide a clean dashboard for security officers to track compliance across multiple microservices."

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

## 📂 RAG vs. Chaining (Current Scope)
Currently, AutoDev Pod utilizes **Prompt Chaining**. It relies on the model's parametric knowledge and context injected from previous steps.

### 📂 RAG Scope & Similarity Parameters
In the future RAG roadmap, the system will implement vector retrieval with the following **Similarity Parameters**:
- **Metric**: **Cosine Similarity** (calculating the dot product of normalized vectors) to find semantically related code patterns.
- **Embeddings**: High-density vector representations of code and documentation using the **Google text-embedding** models.
- **Top-K Retrieval**: Extracting the top 5-10 most relevant code "chunks" to inject into the Developer Agent's context.
- **Thresholding**: A minimum similarity score (e.g., 0.85) to ensure only highly relevant data is used for code generation.

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
