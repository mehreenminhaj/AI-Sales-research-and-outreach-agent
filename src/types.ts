export type WorkflowState =
  | 'DISCOVERED'
  | 'RESEARCHED'
  | 'QUALIFIED'
  | 'CONTACT_FOUND'
  | 'CRM_CHECKED'
  | 'OUTREACH_GENERATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT'
  | 'FAILED';

export type AgentRunLog = AgentRun;


export interface ResearchParameters {
  country: string;
  industry: string;
  max_companies: number;
  target_company_size: string;
  product_description: string;
  target_roles: string[];
  natural_query?: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  domain: string;
  country: string;
  city?: string;
  industry: string;
  company_size: string;
  description: string;
  products: string[];
  tech_stack?: string[];
  recent_developments?: string;
  customer_segments?: string[];
  sources: string[];
  created_at: string;
}

export interface EvidenceItem {
  claim: string;
  source: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface QualificationResult {
  fit: boolean;
  score: number;
  reasons: string[];
  evidence: EvidenceItem[];
  industry_fit: boolean;
  product_fit: boolean;
  size_fit: boolean;
  geo_fit: boolean;
  ai_use_case: string;
  buying_signals: string[];
}

export interface DecisionMaker {
  id: string;
  company_id: string;
  name: string;
  role: string;
  email: string;
  linkedin_url?: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  verified: boolean;
}

export interface ScoringWeights {
  company_relevance: number; // e.g. 25
  product_fit: number;       // e.g. 25
  company_profile: number;   // e.g. 15
  buying_signal: number;     // e.g. 20
  decision_maker_match: number; // e.g. 15
}

export interface OutreachMessage {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  original_body?: string;
  personalization_points: string[];
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at?: string;
}

export interface ApprovalRecord {
  id: string;
  lead_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewer?: string;
  reviewed_at?: string;
  feedback?: string;
  was_edited: boolean;
}

export interface EmailEvent {
  id: string;
  lead_id: string;
  message_id: string;
  recipient: string;
  sender: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'QUEUED';
  sent_at: string;
  error?: string;
}

export interface Lead {
  id: string;
  company: Company;
  contact?: DecisionMaker;
  qualification: QualificationResult;
  outreach?: OutreachMessage;
  approval: ApprovalRecord;
  status: WorkflowState;
  crm_record_id?: string;
  crm_status: 'new' | 'existing' | 'updated';
  run_id: string;
  created_at: string;
  updated_at: string;
  email_event?: EmailEvent;
}

export interface AgentRun {
  id: string;
  workflow_id: string;
  lead_id?: string;
  agent_name: string;
  tool_name: string;
  timestamp: string;
  input: any;
  output: any;
  status: 'SUCCESS' | 'FAILED' | 'RETRY' | 'RUNNING';
  duration_ms: number;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  query: string;
  parameters: ResearchParameters;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  total_discovered: number;
  total_qualified: number;
  pending_approval: number;
  created_at: string;
  completed_at?: string;
  step: string;
}

export interface AnalyticsSummary {
  total_companies_researched: number;
  qualified_leads: number;
  pending_approvals: number;
  approved_count: number;
  rejected_count: number;
  emails_sent: number;
  failed_workflows: number;
  average_lead_score: number;
}
