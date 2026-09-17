# AI Sales Research & Outreach Agent

An enterprise-grade, autonomous **Multi-Agent Sales Intelligence and Outreach System** powered by Google Gemini, full-stack orchestration, CRM deduplication, and a **mandatory Human-in-the-Loop (HITL) approval barrier**.

---

## Key Highlights

- **Multi-Agent Workflow Orchestration**:
  - **Orchestrator Agent**: Formulates execution plans, handles retries, and tracks pipeline states.
  - **Research Agent**: Discovers prospects via web crawling, domain resolution, and verified fact extraction.
  - **Qualification Agent**: Scores prospects (0–100) using configurable weights across company relevance, product fit, company profile, buying signals, and decision-maker match. Every claim is strictly grounded in evidence citations.
  - **Decision-Maker Agent**: Finds verified executive contacts (CEO, CTO, Head of Product) using publicly permitted corporate leadership records.
  - **CRM Agent**: Prevents duplicate leads through a 3-tier check (domain, company name, contact email).
  - **Outreach Agent**: Generates concise, human, non-hallucinatory cold emails tailored to verified company achievements.
- **Mandatory Human-in-the-Loop (HITL) Gate**:
  - The workflow automatically pauses at `PENDING_APPROVAL`.
  - The `send_email` tool strictly refuses execution and returns an error unless the lead is explicitly in the `APPROVED` state.
  - Sales leaders can review evidence, edit the subject and body, or reject the lead.
- **n8n Workflow Automation**:
  - Pre-built n8n workflow JSON (`/n8n/sales_research_workflow.json`) for automated weekly triggers, Slack alerts, and Google Sheets synchronization.
- **Google Sheets & CSV Synchronization**:
  - One-click export of researched prospects, decision-makers, lead scores, and delivery timestamps.
- **Comprehensive Observability & Trace Logging**:
  - Complete audit trail of every tool call, input payload, output schema, duration, and error state.

---

## Quick Start

### 1. Run in Development Mode
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the live dashboard.

### 2. Environment Configuration
See `.env.example` for available configuration keys:
```bash
GEMINI_API_KEY=your_gemini_api_key
DEMO_MODE=true
CRM_PROVIDER=local_postgresql_service
GMAIL_SENDER_EMAIL=outreach@yourcompany.com
```
*Note: In demo mode (`DEMO_MODE=true`), the system operates seamlessly with realistic Pakistani software industry records even if API keys are not supplied.*

### 3. Production Docker Setup
```bash
docker-compose up --build
```
Launches the full application alongside PostgreSQL and an n8n workflow engine.

---

## Architecture Flow

```
User Query / n8n Trigger
        │
        ▼
Orchestrator Agent
        │
        ├──► Research Agent (Company Discovery & Extraction)
        ├──► Qualification Agent (Lead Scoring & Evidence Citations)
        ├──► Decision-Maker Agent (Compliant Leadership Lookup)
        ├──► CRM Agent (Deduplication & Registration)
        └──► Personalized Outreach Agent (Draft Email Generation)
        │
        ▼
🚨 MANDATORY HUMAN REVIEW 🚨 (State: PENDING_APPROVAL)
        │
        ├──► [Human Rejection] ──► Status: REJECTED
        │
        └──► [Human Approval]  ──► Status: APPROVED
                                         │
                                         ▼
                                    Gmail Agent (Dispatches Email)
                                         │
                                         ▼
                                   Status: SENT
```
