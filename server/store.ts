import {
  Lead,
  Company,
  DecisionMaker,
  QualificationResult,
  OutreachMessage,
  ApprovalRecord,
  EmailEvent,
  AgentRun,
  WorkflowRun,
  ScoringWeights,
  AnalyticsSummary,
} from '../src/types.ts';

// In-memory persistent database simulating PostgreSQL tables
class InMemoryDatabase {
  public companies: Map<string, Company> = new Map();
  public contacts: Map<string, DecisionMaker> = new Map();
  public leads: Map<string, Lead> = new Map();
  public outreachMessages: Map<string, OutreachMessage> = new Map();
  public approvalRecords: Map<string, ApprovalRecord> = new Map();
  public emailEvents: Map<string, EmailEvent> = new Map();
  public agentRuns: AgentRun[] = [];
  public workflowRuns: Map<string, WorkflowRun> = new Map();

  public scoringWeights: ScoringWeights = {
    company_relevance: 25,
    product_fit: 25,
    company_profile: 15,
    buying_signal: 20,
    decision_maker_match: 15,
  };

  constructor() {
    this.seedRealisticData();
  }

  public recordAgentRun(run: Omit<AgentRun, 'id' | 'timestamp'>): AgentRun {
    const agentRun: AgentRun = {
      ...run,
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.agentRuns.unshift(agentRun);
    // Keep last 300 logs
    if (this.agentRuns.length > 300) {
      this.agentRuns.pop();
    }
    return agentRun;
  }

  public getAnalytics(): AnalyticsSummary {
    const leadsList = Array.from(this.leads.values());
    const totalCompanies = this.companies.size;
    const qualified = leadsList.filter((l) => l.qualification.fit).length;
    const pending = leadsList.filter((l) => l.status === 'PENDING_APPROVAL').length;
    const approved = leadsList.filter((l) => l.status === 'APPROVED').length;
    const rejected = leadsList.filter((l) => l.status === 'REJECTED').length;
    const sent = leadsList.filter((l) => l.status === 'SENT').length;
    const failed = leadsList.filter((l) => l.status === 'FAILED').length;

    const scores = leadsList.map((l) => l.qualification.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      total_companies_researched: totalCompanies,
      qualified_leads: qualified,
      pending_approvals: pending,
      approved_count: approved,
      rejected_count: rejected,
      emails_sent: sent,
      failed_workflows: failed,
      average_lead_score: avgScore,
    };
  }

  // Realistic Pakistani and Regional Software Companies for immediate portfolio demo
  private seedRealisticData() {
    const initialCompanies = [
      {
        id: 'comp_sys_ltd',
        name: 'Systems Limited',
        website: 'https://www.systemsltd.com',
        domain: 'systemsltd.com',
        country: 'Pakistan',
        city: 'Lahore',
        industry: 'IT Services & Software Consulting',
        company_size: '5,000+ employees (Enterprise)',
        description: 'Global IT and digital solutions provider founded in Pakistan, delivering digital transformation, cloud integration, enterprise ERP, and contact center modernization.',
        products: ['Digital Transformation', 'Enterprise CRM & Cloud Services', 'Customer Experience Services', 'BPO Support Solutions'],
        tech_stack: ['Microsoft Azure', 'Dynamics 365', 'Salesforce', 'React', 'Python', 'AI / ML'],
        recent_developments: 'Expanded enterprise customer experience and omnichannel conversational AI services across MENA and US regions.',
        customer_segments: ['Banking & Financial Services', 'Telecommunications', 'Retail & Consumer Goods', 'Healthcare'],
        sources: [
          'https://www.systemsltd.com/about-us',
          'https://www.systemsltd.com/services/cloud-and-digital-consulting',
          'https://pk.linkedin.com/company/systems-limited',
        ],
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        contact: {
          id: 'cont_asif_peer',
          company_id: 'comp_sys_ltd',
          name: 'Asif Peer',
          role: 'CEO & Managing Director',
          email: 'asif.peer@systemsltd.com',
          linkedin_url: 'https://www.linkedin.com/in/asifpeer',
          source: 'https://www.systemsltd.com/leadership-team',
          confidence: 'high' as const,
          verified: true,
        },
        score: 88,
        evidence: [
          {
            claim: 'Systems Limited manages large-scale customer care operations and BPO hubs across Pakistan and UAE.',
            source: 'https://www.systemsltd.com/services/bpo',
            confidence: 'high' as const,
          },
          {
            claim: 'Actively investing in GenAI integrations for enterprise client support desks to reduce average handle times.',
            source: 'https://www.systemsltd.com/insights/generative-ai-initiatives',
            confidence: 'high' as const,
          },
        ],
        reasons: [
          'Exceptional product fit: handles massive ticket volumes for telecommunication and retail enterprise clients.',
          'High buying signal: public announcements around adopting conversational AI tools for support agents.',
          'Decision-maker verified with high confidence.',
        ],
        subject: 'Conversational AI support layer for Systems Limited enterprise desks',
        body: `Hi Asif,

I noticed Systems Limited's recent expansion in enterprise customer experience solutions across the Middle East and North America, specifically your focus on modernizing high-volume support operations.

Our AI customer support engine integrates directly into existing CRM infrastructure (Dynamics 365 and Salesforce) to resolve recurring tier-1 tickets autonomously while providing real-time drafting context to senior agents. Given your current client scale in banking and retail, this typically reduces average handling time by 38% without disrupting escalation flows.

Would you be open to a 10-minute briefing next Tuesday to see how this fits into your customer experience practice?

Best regards,
Sales Automation Team`,
        personalization_points: [
          'Referenced Systems Limited Middle East & North America expansion',
          'Mentioned their compatibility with Dynamics 365 and Salesforce CRM workflows',
          'Directly addressed customer support handling time in banking and retail',
        ],
        status: 'PENDING_APPROVAL' as const,
      },
      {
        id: 'comp_10pearls',
        name: '10Pearls',
        website: 'https://10pearls.com',
        domain: '10pearls.com',
        country: 'Pakistan',
        city: 'Karachi & Islamabad',
        industry: 'Digital Product Development & AI Labs',
        company_size: '1,500+ employees',
        description: 'End-to-end digital technology partner designing and building custom AI-driven software, mobile apps, and customer-facing digital platforms.',
        products: ['Custom Software Development', 'AI / GenAI Acceleration', 'Product Design & UX', 'Quality Engineering'],
        tech_stack: ['Python', 'Node.js', 'AWS', 'TensorFlow', 'PostgreSQL', 'React Native'],
        recent_developments: 'Launched an internal GenAI Center of Excellence targeting enterprise customer engagement automation.',
        customer_segments: ['Healthcare Providers', 'Fintech', 'Logistics', 'Enterprise SaaS'],
        sources: [
          'https://10pearls.com/about/',
          'https://10pearls.com/services/ai-solutions/',
          'https://10pearls.com/case-studies/',
        ],
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        contact: {
          id: 'cont_imran_aftab',
          company_id: 'comp_10pearls',
          name: 'Imran Aftab',
          role: 'Co-Founder & CEO',
          email: 'imran.aftab@10pearls.com',
          linkedin_url: 'https://www.linkedin.com/in/imranaftab',
          source: 'https://10pearls.com/leadership/',
          confidence: 'high' as const,
          verified: true,
        },
        score: 84,
        evidence: [
          {
            claim: '10Pearls established dedicated GenAI labs to build conversational interfaces for client apps.',
            source: 'https://10pearls.com/services/ai-solutions/',
            confidence: 'high' as const,
          },
          {
            claim: 'High proportion of US enterprise clients demanding 24/7 automated support SLAs.',
            source: 'https://10pearls.com/about/',
            confidence: 'medium' as const,
          },
        ],
        reasons: [
          'Strong alignment with digital innovation and rapid AI product delivery.',
          'Partnership opportunity as an embedded support co-pilot inside their customer client platforms.',
        ],
        subject: 'Customizable support AI infrastructure for 10Pearls digital platforms',
        body: `Hi Imran,

I have been following 10Pearls' work developing AI-accelerated digital products for high-growth healthcare and fintech clients.

We have built a developer-first customer support chatbot engine that engineering teams can white-label or embed into custom web and mobile applications with strict compliance and verified citations. It was designed to address the exact latency and hallucination concerns common in mission-critical client deployments.

Could we schedule a quick 12-minute technical run-through with you or your Head of Product this week?

Kind regards,
AI Solutions Specialist`,
        personalization_points: [
          'Cited 10Pearls AI Acceleration program for healthcare & fintech',
          'Highlighted white-labeling and strict citation governance for engineering teams',
        ],
        status: 'PENDING_APPROVAL' as const,
      },
      {
        id: 'comp_netsol',
        name: 'NetSol Technologies',
        website: 'https://www.netsoltech.com',
        domain: 'netsoltech.com',
        country: 'Pakistan',
        city: 'Lahore',
        industry: 'FinTech & Asset Finance Software',
        company_size: '1,200+ employees (Public: NASDAQ: NTWK)',
        description: 'Global pioneer in IT and enterprise software solutions for the asset finance and leasing industry worldwide, powering Fortune 500 automotive finance houses.',
        products: ['NFS Ascent', 'NFS Digital', 'Otoz Mobility Platform', 'Leasing Origination Engine'],
        tech_stack: ['Java', '.NET Core', 'Microservices', 'Oracle', 'Kafka', 'Angular'],
        recent_developments: 'Accelerating cloud migration and self-service mobile portals for global automotive finance institutions.',
        customer_segments: ['Global Automotive OEMs', 'Commercial Banks', 'Equipment Finance'],
        sources: [
          'https://www.netsoltech.com/about',
          'https://www.netsoltech.com/products/nfs-ascent',
        ],
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        contact: {
          id: 'cont_salim_ghauri',
          company_id: 'comp_netsol',
          name: 'Salim Ghauri',
          role: 'Founder & CEO',
          email: 'salim.ghauri@netsoltech.com',
          linkedin_url: 'https://www.linkedin.com/in/salim-ghauri',
          source: 'https://www.netsoltech.com/investor-relations/board-of-directors',
          confidence: 'high' as const,
          verified: true,
        },
        score: 79,
        evidence: [
          {
            claim: 'NFS Ascent platform serves thousands of equipment and vehicle financing end-users needing instant loan status queries.',
            source: 'https://www.netsoltech.com/products/nfs-ascent',
            confidence: 'high' as const,
          },
        ],
        reasons: [
          'Automotive financing customers require immediate 24/7 automated inquiry handling for loan approvals and payments.',
          'High security compliance requirements match our verifiable audit log architecture.',
        ],
        subject: 'Automating loan inquiry resolution for NetSol asset finance portals',
        body: `Hi Salim,

NetSol's leadership with NFS Ascent across global automotive financiers is exemplary, particularly as self-service and mobile loan servicing become table stakes.

Borrowers frequently reach out for payment schedules, settlement quotes, and verification statuses. Our AI support platform resolves these repetitive account inquiries directly against core ledger APIs while strictly enforcing role-based verification and compliance audits.

Would you be open to an introductory conversation to evaluate how this could integrate with NFS Digital?

Best,
Enterprise Solutions Lead`,
        personalization_points: [
          'Recognized NFS Ascent and NFS Digital asset finance ecosystem',
          'Addressed specific finance inquiries like payment schedules and loan statuses',
        ],
        status: 'PENDING_APPROVAL' as const,
      },
      {
        id: 'comp_arbisoft',
        name: 'Arbisoft',
        website: 'https://arbisoft.com',
        domain: 'arbisoft.com',
        country: 'Pakistan',
        city: 'Lahore',
        industry: 'Custom Software & EdTech Engineering',
        company_size: '900+ engineers',
        description: 'Engineering-driven software services firm that co-creates flagship technology platforms for edX, Kayak, and fast-growing SaaS startups.',
        products: ['Web & Mobile Platforms', 'Data Scraping & Analytics', 'EdTech Solutions', 'DevOps & Cloud'],
        tech_stack: ['Python / Django', 'React', 'Kubernetes', 'FastAPI', 'PostgreSQL'],
        recent_developments: 'Partnering on open-source educational platforms and generative course assistance engines.',
        customer_segments: ['Global EdTech', 'Travel & Hospitality', 'Enterprise Data Providers'],
        sources: ['https://arbisoft.com/about-us/', 'https://arbisoft.com/work/'],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        contact: {
          id: 'cont_yasser_bashir',
          company_id: 'comp_arbisoft',
          name: 'Yasser Bashir',
          role: 'CEO & Founder',
          email: 'yasser.bashir@arbisoft.com',
          linkedin_url: 'https://www.linkedin.com/in/yasser-bashir',
          source: 'https://arbisoft.com/leadership/',
          confidence: 'high' as const,
          verified: true,
        },
        score: 76,
        evidence: [
          {
            claim: 'Arbisoft supports major EdTech and travel clients where end-user query spikes occur during registration and bookings.',
            source: 'https://arbisoft.com/work/',
            confidence: 'high' as const,
          },
        ],
        reasons: [
          'Strong engineering culture that values verifiable tooling and high-precision APIs.',
          'Good candidate for a partner trial on high-load client web applications.',
        ],
        subject: 'Automating high-volume learner & customer inquiries on Arbisoft client platforms',
        body: `Hi Yasser,

Arbisoft's engineering partnership with edX and global travel platforms highlights your focus on reliable software architectures under high user volume.

During peak registration and booking periods, end-user support queues quickly become a bottleneck. We built an AI customer support layer designed with strict guardrails, zero hallucinations, and webhook integration that plugs cleanly into Django and FastAPI backends.

Could I share a brief 2-minute architectural overview with your engineering leads?

Warm regards,
Enterprise Partnerships`,
        personalization_points: [
          'Referenced edX and travel platform engineering scale',
          'Mentioned technical stack compatibility (FastAPI, Django, webhooks)',
        ],
        status: 'PENDING_APPROVAL' as const,
      },
      {
        id: 'comp_contour',
        name: 'Contour Software',
        website: 'https://contour-software.com',
        domain: 'contour-software.com',
        country: 'Pakistan',
        city: 'Karachi, Lahore, Islamabad',
        industry: 'Enterprise Software & Constellation Software Hub',
        company_size: '3,000+ employees',
        description: 'Offshore division of Constellation Software Inc. (TSE: CSU), operating dedicated R&D, customer support, and professional service centers for 100+ vertical market software businesses.',
        products: ['Vertical Market Software Development', 'Customer Support Services', 'Quality Assurance', 'IT Operations'],
        tech_stack: ['C# / .NET', 'SQL Server', 'Angular', 'Cloud Infrastructure'],
        recent_developments: 'Expanding dedicated customer tier-1/tier-2 support hubs across all Pakistan offices.',
        customer_segments: ['Healthcare Software', 'Municipal Governments', 'Utility & Energy Providers'],
        sources: ['https://contour-software.com/about/', 'https://contour-software.com/divisions/'],
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        contact: {
          id: 'cont_bilal_mahmood',
          company_id: 'comp_contour',
          name: 'Bilal Mahmood',
          role: 'Managing Director',
          email: 'bilal.mahmood@contour-software.com',
          linkedin_url: 'https://www.linkedin.com/in/bilalmahmood',
          source: 'https://contour-software.com/leadership/',
          confidence: 'high' as const,
          verified: true,
        },
        score: 91,
        evidence: [
          {
            claim: 'Contour Software runs dedicated support teams for dozens of Constellation Software portfolio companies.',
            source: 'https://contour-software.com/about/',
            confidence: 'high' as const,
          },
          {
            claim: 'Support teams handle multi-tenant software queries across specialized niche industries.',
            source: 'https://contour-software.com/divisions/',
            confidence: 'high' as const,
          },
        ],
        reasons: [
          'Exceptional need: operates dedicated multi-client support centers for over 100 vertical software products.',
          'High ROI: saving even 20% of agent repetitive triage across Contour support teams delivers immediate efficiency.',
        ],
        subject: 'AI triage and tier-1 ticket automation for Contour Software support divisions',
        body: `Hi Bilal,

Given Contour Software's role supporting dozens of Constellation Software vertical market companies, your teams handle an impressive breadth of specialized software inquiries daily.

Our customer support AI agent acts as a first-line triage layer that categorizes tickets, pulls relevant documentation from product wikis, and resolves routine password/config queries before they reach your support analysts.

Would you be open to exploring how this could assist Contour's support operations with a brief demo?

Best regards,
Automation Architect`,
        personalization_points: [
          'Highlighted Constellation Software vertical market portfolio scale',
          'Addressed multi-tenant software tier-1 triage and product wiki lookup',
        ],
        status: 'PENDING_APPROVAL' as const,
      },
    ];

    const runId = 'seed_run_pk_software_2026';
    const params = {
      country: 'Pakistan',
      industry: 'Software',
      max_companies: 5,
      target_company_size: 'SME to Enterprise',
      product_description: 'AI-powered customer support chatbot',
      target_roles: ['CEO', 'CTO', 'Head of Product', 'Head of Engineering', 'Managing Director'],
      natural_query: 'Find software companies in Pakistan that could be prospects for our AI customer support solution.',
    };

    const workflowRun: WorkflowRun = {
      id: runId,
      query: params.natural_query,
      parameters: params,
      status: 'COMPLETED',
      total_discovered: initialCompanies.length,
      total_qualified: initialCompanies.length,
      pending_approval: initialCompanies.length,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      step: 'Outreach generated. Waiting for mandatory human approval.',
    };
    this.workflowRuns.set(runId, workflowRun);

    for (const item of initialCompanies) {
      const company: Company = {
        id: item.id,
        name: item.name,
        website: item.website,
        domain: item.domain,
        country: item.country,
        city: item.city,
        industry: item.industry,
        company_size: item.company_size,
        description: item.description,
        products: item.products,
        tech_stack: item.tech_stack,
        recent_developments: item.recent_developments,
        customer_segments: item.customer_segments,
        sources: item.sources,
        created_at: item.created_at,
      };
      this.companies.set(company.id, company);

      const contact: DecisionMaker = item.contact;
      this.contacts.set(contact.id, contact);

      const leadId = `lead_${item.id.replace('comp_', '')}`;
      const qualification: QualificationResult = {
        fit: true,
        score: item.score,
        reasons: item.reasons,
        evidence: item.evidence,
        industry_fit: true,
        product_fit: true,
        size_fit: true,
        geo_fit: true,
        ai_use_case: `Automate repetitive customer queries and tier-1 ticket triage for ${company.name} operations.`,
        buying_signals: ['Active expansion of support hubs', 'Public GenAI adoption initiatives', 'High inquiry volume'],
      };

      const outreach: OutreachMessage = {
        id: `outreach_${leadId}`,
        lead_id: leadId,
        subject: item.subject,
        body: item.body,
        original_body: item.body,
        personalization_points: item.personalization_points,
        sources: item.sources,
        confidence: 'high',
        created_at: item.created_at,
      };
      this.outreachMessages.set(outreach.id, outreach);

      const approval: ApprovalRecord = {
        id: `appr_${leadId}`,
        lead_id: leadId,
        status: 'PENDING',
        was_edited: false,
      };
      this.approvalRecords.set(approval.id, approval);

      const lead: Lead = {
        id: leadId,
        company,
        contact,
        qualification,
        outreach,
        approval,
        status: item.status,
        crm_record_id: `CRM-PK-${Math.floor(1000 + Math.random() * 9000)}`,
        crm_status: 'new',
        run_id: runId,
        created_at: item.created_at,
        updated_at: item.created_at,
      };
      this.leads.set(lead.id, lead);

      // Log initial agent actions
      this.recordAgentRun({
        workflow_id: runId,
        lead_id: leadId,
        agent_name: 'ResearchAgent',
        tool_name: 'extract_company_data',
        input: { url: company.website, company: company.name },
        output: { status: 'success', domain: company.domain, verified_sources: company.sources.length },
        status: 'SUCCESS',
        duration_ms: 620,
      });

      this.recordAgentRun({
        workflow_id: runId,
        lead_id: leadId,
        agent_name: 'QualificationAgent',
        tool_name: 'evaluate_fit',
        input: { company: company.name, product: params.product_description },
        output: { fit: true, score: qualification.score, evidence_count: qualification.evidence.length },
        status: 'SUCCESS',
        duration_ms: 410,
      });

      this.recordAgentRun({
        workflow_id: runId,
        lead_id: leadId,
        agent_name: 'DecisionMakerAgent',
        tool_name: 'search_decision_makers',
        input: { company: company.name, target_roles: params.target_roles },
        output: { name: contact.name, role: contact.role, confidence: contact.confidence },
        status: 'SUCCESS',
        duration_ms: 380,
      });

      this.recordAgentRun({
        workflow_id: runId,
        lead_id: leadId,
        agent_name: 'CRMAgent',
        tool_name: 'search_crm',
        input: { domain: company.domain, name: company.name },
        output: { exists: false, record_id: null, status: 'new' },
        status: 'SUCCESS',
        duration_ms: 120,
      });

      this.recordAgentRun({
        workflow_id: runId,
        lead_id: leadId,
        agent_name: 'PersonalizedOutreachAgent',
        tool_name: 'generate_outreach',
        input: { decision_maker: contact.name, company: company.name },
        output: { subject: outreach.subject, personalization_points: outreach.personalization_points.length },
        status: 'SUCCESS',
        duration_ms: 950,
      });
    }
  }
}

export const db = new InMemoryDatabase();
