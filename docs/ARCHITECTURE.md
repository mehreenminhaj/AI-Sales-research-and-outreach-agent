# AI Sales Research & Outreach Agent — System Architecture

## Overview

The **AI Sales Research & Outreach Agent** is an autonomous multi-agent pipeline designed to discover, qualify, and draft verified outreach for B2B prospects. It enforces a **mandatory Human-in-the-Loop (HITL) gate** before any email can be dispatched through Gmail.

```
                    ┌─────────────────────────┐
                    │   User Natural Query    │
                    │   or Scheduled Cron     │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Orchestrator Agent    │
                    │ (Formulates Intent/Plan)│
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌───────────────────┐                       ┌───────────────────┐
│  Research Agent   │                       │ Qualification Agt │
│ (Web Discovery &  │                       │(Fit Score 0-100 & │
│ Fact Extraction)  │                       │Grounded Evidence) │
└─────────┬─────────┘                       └─────────┬─────────┘
          │                                           │
          └─────────────────────┬─────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ Decision-Maker Agent    │
                    │(Compliant Public Lookup)│
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     CRM Agent           │
                    │(Deduplication & Record) │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ Personalized Outreach   │
                    │  (Non-hallucinatory)    │
                    └───────────┬─────────────┘
                                │
                                ▼
             ========================================
             🚨 MANDATORY HUMAN APPROVAL BARRIER 🚨
                    State: PENDING_APPROVAL
             ========================================
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
        [Human Rejects]                     [Human Approves / Edits]
              │                                   │
              ▼                                   ▼
        Status: REJECTED                    Status: APPROVED
        (Will never send)                         │
                                                  ▼
                                      ┌───────────────────────┐
                                      │      Gmail Agent      │
                                      │ (Strict Status Check) │
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                                            Status: SENT
```

---

## Agent Responsibilities

### 1. Orchestrator Agent
- Converts free-form requests into structured parameters (`country`, `industry`, `max_companies`, `target_company_size`, `product_description`, `target_roles`).
- Coordinates child agent lifecycles, collects telemetry, logs durations, and handles retries.
- Halts execution when outreach drafts are generated, moving the lead to `PENDING_APPROVAL`.

### 2. Research Agent
- Tool: `search_web()` & `extract_company_data()`
- Extracts verified company domain, products, size, target segments, and technology stack.
- Records source citations for every extracted claim.

### 3. Company Qualification Agent
- Evaluates ICP fit using configurable weighted criteria:
  - Company Relevance (25%)
  - Product Fit (25%)
  - Company Profile (15%)
  - Buying Signals (20%)
  - Decision-Maker Match (15%)
- Grounds all qualification assertions in verified evidence items. Never allows ungrounded claims.

### 4. Decision-Maker Research Agent
- Tool: `search_decision_makers()`
- Identifies senior leadership (CEO, CTO, Head of Product, Head of Engineering).
- Uses only publicly permitted company directories and leadership pages. Never scrapes in violation of terms.
- Stores confidence rating (`high`, `medium`, `low`) and source citations.

### 5. CRM Agent
- Tools: `search_company()`, `search_contact()`, `create_lead()`, `update_lead()`, `add_activity()`.
- Implements 3-tier deduplication check:
  1. Match by domain
  2. Match by company name
  3. Match by contact email

### 6. Personalized Outreach Agent
- Generates concise, human, non-generic cold outreach.
- References verified company-specific facts.
- Explicitly documents reasoning for personalization points and source citations.

### 7. Gmail Agent & Approval Gate
- Tool: `send_email()`
- **Enforces strict runtime status validation**: If `lead.status !== 'APPROVED'`, it throws an authorization error and refuses to call the mail transport.
