# API Documentation

## Base URL
All requests are served over `http://localhost:3000` (or the container host).

## Endpoints

### 1. Trigger Autonomous Research
- **`POST /api/research`**
- **Request Body**:
```json
{
  "parameters": {
    "country": "Pakistan",
    "industry": "Software",
    "max_companies": 5,
    "target_company_size": "SME to Enterprise",
    "product_description": "AI customer support automation chatbot",
    "target_roles": ["CEO", "CTO", "Head of Engineering"]
  }
}
```
- **Response**: Returns workflow run metadata with step progression. Leads are initialized in `PENDING_APPROVAL` status.

---

### 2. List Leads
- **`GET /api/leads`**
- **Query Params**: `?status=PENDING_APPROVAL` (Optional filter: `APPROVED`, `SENT`, `REJECTED`).
- **Response**: Array of leads with company profiles, qualification scores, evidence items, decision-maker contacts, and generated outreach drafts.

---

### 3. Inspect Lead & Evidence
- **`GET /api/leads/:lead_id`**
- **`GET /api/leads/:lead_id/research`**
- **`GET /api/leads/:lead_id/outreach`**

---

### 4. Human Approval
- **`POST /api/leads/:lead_id/approve`**
- **Request Body**:
```json
{
  "reviewer": "Senior Sales Lead",
  "edited_email": {
    "subject": "Customized Subject Line",
    "body": "Customized body text..."
  }
}
```
- **Response**: Transitions status to `APPROVED`. Records reviewer, timestamp, and edit flag.

---

### 5. Human Rejection
- **`POST /api/leads/:lead_id/reject`**
- **Request Body**:
```json
{
  "reviewer": "Senior Sales Lead",
  "feedback": "Not an ICP fit"
}
```
- **Response**: Transitions status to `REJECTED`. The lead cannot be sent.

---

### 6. Send Email (Enforces Mandatory Human Approval)
- **`POST /api/leads/:lead_id/send`**
- **Request Body**: `{ "reviewer": "Senior Sales Lead" }`
- **Validation**:
  - If `lead.status !== "APPROVED"`, responds with **403 Forbidden**: `"Authorization / Workflow Error: Cannot send email. Lead status must be APPROVED."`
  - If approved, dispatches via Gmail, assigns `message_id`, records delivery timestamp, and transitions state to `SENT`.

---

### 7. CRM & Deduplication Overview
- **`GET /api/crm`**
- Returns all registered companies, contacts, and deduplication records.

---

### 8. Observability & Audit Logs
- **`GET /api/logs?limit=100`**
- Returns deterministic agent run records containing inputs, schema outputs, durations, and tool names.

---

### 9. Google Sheets / CSV Export
- **`POST /api/export/sheets`**
- Returns structured rows and downloadable CSV string of researched prospects.

---

### 10. n8n Automation Webhook
- **`POST /api/webhooks/n8n`**
- Actions: `start_research`, `get_pending_approvals`, `approve_and_send`.
