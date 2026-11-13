import { DynamicAppSpec, DynamicAppGenerationResult, GeneratedSourceFile } from '@/types/dynamic-app';

export function createClientFallbackAppSpec(requirement: string): DynamicAppSpec {
  const lower = (requirement || '').toLowerCase();
  const id = `app_${Date.now()}`;

  if (lower.includes('clinic') || lower.includes('health') || lower.includes('patient') || lower.includes('medical') || lower.includes('doctor')) {
    return {
      id,
      name: 'MediCare Clinical Records',
      tagline: 'Patient intake, appointment queue, and clinical record management',
      description: 'Streamlines clinic operations with patient registration, queue status tracking, and department assignments.',
      brand: { name: 'MediCare Portal', accentColor: 'blue', iconName: 'Stethoscope' },
      navigation: {
        items: [
          { id: 'dashboard', label: 'Overview', icon: 'LayoutDashboard' },
          { id: 'records', label: 'Patient Queue', icon: 'Users', badge: 'Active' },
          { id: 'new_patient', label: 'New Patient Intake', icon: 'UserPlus' },
        ],
        defaultScreenId: 'dashboard',
      },
      entities: [
        {
          name: 'patient',
          pluralName: 'patients',
          primaryKey: 'id',
          fields: [
            { name: 'name', label: 'Patient Full Name', type: 'text', placeholder: 'Dr. Jane Smith', validation: { required: true, minLength: 2, message: 'Patient name must be at least 2 characters.' } },
            { name: 'email', label: 'Contact Email', type: 'email', placeholder: 'patient@example.com', validation: { required: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Enter a valid email address.' } },
            { name: 'department', label: 'Department', type: 'select', options: ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology'], validation: { required: true } },
            { name: 'priority', label: 'Triage Priority', type: 'badge', options: ['Routine', 'Urgent', 'Emergency'], validation: { required: true } },
            { name: 'status', label: 'Current Status', type: 'badge', options: ['Waiting', 'In Consultation', 'Completed', 'Discharged'], validation: { required: true } },
            { name: 'intakeDate', label: 'Intake Date', type: 'date', validation: { required: true } },
            { name: 'notes', label: 'Symptoms / Clinical Notes', type: 'textarea', placeholder: 'Describe reported symptoms or allergies...' },
          ],
          initialData: [
            { id: 'P-101', name: 'Eleanor Vance', email: 'eleanor.v@example.com', department: 'Cardiology', priority: 'Urgent', status: 'In Consultation', intakeDate: '2026-11-13', notes: 'Routine ECG review with reported mild palpitations.' },
            { id: 'P-102', name: 'Marcus Sterling', email: 'm.sterling@example.org', department: 'General Medicine', priority: 'Routine', status: 'Waiting', intakeDate: '2026-11-13', notes: 'Annual wellness checkup and fasting blood panel.' },
            { id: 'P-103', name: 'Sophia Chen', email: 'sophia.chen@medmail.com', department: 'Pediatrics', priority: 'Emergency', status: 'Waiting', intakeDate: '2026-11-13', notes: 'Acute fever with dehydration; prioritized for immediate vitals.' },
            { id: 'P-104', name: 'Liam Gallagher', email: 'liam.g@workplace.co', department: 'Orthopedics', priority: 'Routine', status: 'Completed', intakeDate: '2026-11-12', notes: 'Post-cast physical therapy evaluation; mobility improved.' },
          ],
        },
      ],
      screens: [
        {
          id: 'dashboard',
          title: 'Clinical Operations Dashboard',
          subtitle: 'Live triage indicators, patient queue metrics, and immediate actions',
          type: 'dashboard',
          entityName: 'patient',
          dashboardConfig: {
            kpis: [
              { title: 'Total Patients', field: 'id', aggregation: 'count', icon: 'Users', change: '+12% today' },
              { title: 'Awaiting Care', field: 'status', filterStatus: 'Waiting', aggregation: 'count', icon: 'Clock', change: 'Current queue' },
              { title: 'Emergency Triage', field: 'priority', filterStatus: 'Emergency', aggregation: 'count', icon: 'AlertTriangle', change: 'Immediate attention' },
              { title: 'Consultations Done', field: 'status', filterStatus: 'Completed', aggregation: 'count', icon: 'CheckCircle2', change: 'Today' },
            ],
            quickActions: [
              { label: 'Register New Patient', targetScreenId: 'new_patient', icon: 'UserPlus' },
              { label: 'View Queue List', targetScreenId: 'records', icon: 'List' },
            ],
            recentListEntity: 'patient',
          },
        },
        {
          id: 'records',
          title: 'Patient Queue & Intake Directory',
          subtitle: 'Search, filter, edit, and update triage statuses',
          type: 'table',
          entityName: 'patient',
          tableConfig: {
            columns: [
              { field: 'id', header: 'ID', format: 'text' },
              { field: 'name', header: 'Patient Name', format: 'text' },
              { field: 'department', header: 'Department', format: 'text' },
              { field: 'priority', header: 'Triage Priority', format: 'badge', badgeColorMap: { Emergency: 'destructive', Urgent: 'warning', Routine: 'secondary' } },
              { field: 'status', header: 'Status', format: 'badge', badgeColorMap: { Waiting: 'warning', 'In Consultation': 'primary', Completed: 'success' } },
              { field: 'intakeDate', header: 'Date', format: 'date' },
            ],
            searchableFields: ['name', 'id', 'department', 'email'],
            filterField: 'department',
            filterOptions: ['All', 'General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics'],
            allowCreate: true,
            createScreenId: 'new_patient',
            allowEdit: true,
            allowDelete: true,
          },
        },
        {
          id: 'new_patient',
          title: 'Patient Intake Registration',
          subtitle: 'Record patient personal information, assigned department, and initial triage',
          type: 'form',
          entityName: 'patient',
          formConfig: {
            targetEntity: 'patient',
            fields: ['name', 'email', 'department', 'priority', 'status', 'intakeDate', 'notes'],
            submitButtonText: 'Register Patient',
            successRedirectScreenId: 'records',
          },
        },
      ],
    };
  }

  if (lower.includes('ticket') || lower.includes('support') || lower.includes('desk') || lower.includes('issue') || lower.includes('service') || lower.includes('helpdesk')) {
    return {
      id,
      name: 'ResolveDesk Service Portal',
      tagline: 'Customer support ticketing, incident routing, and SLA tracking',
      description: 'Centralized helpdesk system to submit, categorize, prioritize, and resolve customer support issues.',
      brand: { name: 'ResolveDesk', accentColor: 'indigo', iconName: 'LifeBuoy' },
      navigation: {
        items: [
          { id: 'dashboard', label: 'Service Metrics', icon: 'LayoutDashboard' },
          { id: 'tickets', label: 'Support Tickets', icon: 'Ticket', badge: 'Live' },
          { id: 'new_ticket', label: 'Open New Ticket', icon: 'PlusCircle' },
        ],
        defaultScreenId: 'dashboard',
      },
      entities: [
        {
          name: 'ticket',
          pluralName: 'tickets',
          primaryKey: 'id',
          fields: [
            { name: 'title', label: 'Issue Summary', type: 'text', placeholder: 'Brief summary of the issue', validation: { required: true, minLength: 5, message: 'Summary must be at least 5 characters.' } },
            { name: 'customerEmail', label: 'Customer Email', type: 'email', placeholder: 'customer@company.com', validation: { required: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Valid email is required.' } },
            { name: 'category', label: 'Category', type: 'select', options: ['Account Access', 'Billing & Invoicing', 'Technical Bug', 'Feature Request', 'Security'], validation: { required: true } },
            { name: 'priority', label: 'Priority Level', type: 'badge', options: ['Low', 'Medium', 'High', 'Critical'], validation: { required: true } },
            { name: 'status', label: 'Ticket Status', type: 'badge', options: ['Open', 'In Progress', 'Pending Customer', 'Resolved'], validation: { required: true } },
            { name: 'assignedTo', label: 'Assigned Agent', type: 'text', placeholder: 'Agent name', validation: { required: true } },
            { name: 'createdAt', label: 'Reported Date', type: 'date', validation: { required: true } },
            { name: 'description', label: 'Detailed Description', type: 'textarea', placeholder: 'Steps to reproduce or customer message...' },
          ],
          initialData: [
            { id: 'TCK-201', title: 'SSO Login Failure with Azure AD', customerEmail: 'devops@enterprise.net', category: 'Account Access', priority: 'Critical', status: 'In Progress', assignedTo: 'Sarah Jenkins', createdAt: '2026-11-13', description: 'Enterprise SAML token validation timeout during peak login hour.' },
            { id: 'TCK-202', title: 'Invoice mismatch on Q4 annual subscription', customerEmail: 'accounts@fintech.io', category: 'Billing & Invoicing', priority: 'Medium', status: 'Open', assignedTo: 'David Kim', createdAt: '2026-11-12', description: 'VAT was calculated twice on annual recurring bill.' },
            { id: 'TCK-203', title: 'Webhook callback latency spikes above 2000ms', customerEmail: 'engineering@saas.com', category: 'Technical Bug', priority: 'High', status: 'In Progress', assignedTo: 'Alex Torres', createdAt: '2026-11-13', description: 'Webhooks failing with 504 gateway timeout on event sync.' },
            { id: 'TCK-204', title: 'Request CSV export for audit compliance logs', customerEmail: 'security@cloudcorp.org', category: 'Feature Request', priority: 'Low', status: 'Resolved', assignedTo: 'Emma Watson', createdAt: '2026-11-10', description: 'Customer requested 90-day activity logs formatted for SOC2 compliance.' },
          ],
        },
      ],
      screens: [
        {
          id: 'dashboard',
          title: 'Support Operations Overview',
          subtitle: 'Live ticket volumes, incident resolution rates, and SLA indicators',
          type: 'dashboard',
          entityName: 'ticket',
          dashboardConfig: {
            kpis: [
              { title: 'Total Tickets', field: 'id', aggregation: 'count', icon: 'Ticket', change: '+8 this week' },
              { title: 'Open Backlog', field: 'status', filterStatus: 'Open', aggregation: 'count', icon: 'AlertCircle', change: 'Needs assignment' },
              { title: 'Critical Issues', field: 'priority', filterStatus: 'Critical', aggregation: 'count', icon: 'Flame', change: 'P0 priority' },
              { title: 'Resolved', field: 'status', filterStatus: 'Resolved', aggregation: 'count', icon: 'CheckCircle2', change: '94% SLA met' },
            ],
            quickActions: [
              { label: 'Create New Ticket', targetScreenId: 'new_ticket', icon: 'PlusCircle' },
              { label: 'Browse All Tickets', targetScreenId: 'tickets', icon: 'List' },
            ],
            recentListEntity: 'ticket',
          },
        },
        {
          id: 'tickets',
          title: 'Service Tickets Master Table',
          subtitle: 'Browse, filter by category or status, edit details, and resolve tickets',
          type: 'table',
          entityName: 'ticket',
          tableConfig: {
            columns: [
              { field: 'id', header: 'Ticket ID', format: 'text' },
              { field: 'title', header: 'Subject', format: 'text' },
              { field: 'category', header: 'Category', format: 'text' },
              { field: 'priority', header: 'Priority', format: 'badge', badgeColorMap: { Critical: 'destructive', High: 'warning', Medium: 'secondary', Low: 'muted' } },
              { field: 'status', header: 'Status', format: 'badge', badgeColorMap: { Open: 'warning', 'In Progress': 'primary', Resolved: 'success' } },
              { field: 'assignedTo', header: 'Owner', format: 'text' },
              { field: 'createdAt', header: 'Date', format: 'date' },
            ],
            searchableFields: ['title', 'id', 'customerEmail', 'assignedTo'],
            filterField: 'category',
            filterOptions: ['All', 'Account Access', 'Billing & Invoicing', 'Technical Bug', 'Feature Request', 'Security'],
            allowCreate: true,
            createScreenId: 'new_ticket',
            allowEdit: true,
            allowDelete: true,
          },
        },
        {
          id: 'new_ticket',
          title: 'Log New Customer Support Ticket',
          subtitle: 'Record customer inquiry details, severity rating, and assign to engineering queue',
          type: 'form',
          entityName: 'ticket',
          formConfig: {
            targetEntity: 'ticket',
            fields: ['title', 'customerEmail', 'category', 'priority', 'status', 'assignedTo', 'createdAt', 'description'],
            submitButtonText: 'Submit Ticket',
            successRedirectScreenId: 'tickets',
          },
        },
      ],
    };
  }

  // Default Asset / Record Manager
  return {
    id,
    name: 'OpsFlow Asset & Item Manager',
    tagline: 'Enterprise record tracking, lifecycle management, and team collaboration',
    description: 'A robust business application providing real-time data cataloging, status management, and audit records.',
    brand: { name: 'OpsFlow Central', accentColor: 'emerald', iconName: 'Box' },
    navigation: {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'inventory', label: 'Item Catalog', icon: 'Box', badge: 'Live' },
        { id: 'new_item', label: 'Add New Record', icon: 'PlusCircle' },
      ],
      defaultScreenId: 'dashboard',
    },
    entities: [
      {
        name: 'item',
        pluralName: 'items',
        primaryKey: 'id',
        fields: [
          { name: 'name', label: 'Item / Asset Name', type: 'text', placeholder: 'e.g. Dell PowerEdge Server', validation: { required: true, minLength: 3, message: 'Name must be at least 3 characters.' } },
          { name: 'sku', label: 'SKU / Asset Code', type: 'text', placeholder: 'AST-9921', validation: { required: true, message: 'SKU or code is required.' } },
          { name: 'category', label: 'Category', type: 'select', options: ['Hardware', 'Software License', 'Office Equipment', 'Infrastructure', 'Mobile Device'], validation: { required: true } },
          { name: 'quantity', label: 'Stock Quantity', type: 'number', placeholder: '10', validation: { required: true, min: 0, message: 'Quantity cannot be negative.' } },
          { name: 'unitCost', label: 'Unit Cost ($)', type: 'number', placeholder: '450.00', validation: { required: true, min: 0, message: 'Unit cost must be positive.' } },
          { name: 'status', label: 'Operational Status', type: 'badge', options: ['Available', 'In Use', 'Maintenance', 'Decommissioned'], validation: { required: true } },
          { name: 'lastInspected', label: 'Last Inspected', type: 'date', validation: { required: true } },
          { name: 'notes', label: 'Specification Notes', type: 'textarea', placeholder: 'Serial numbers, vendor details, warranty...' },
        ],
        initialData: [
          { id: 'AST-101', name: 'Dell Precision 7760 Workstation', sku: 'HW-DELL-7760', category: 'Hardware', quantity: 14, unitCost: 2850, status: 'In Use', lastInspected: '2026-10-25', notes: 'Core engineering CAD systems with 64GB RAM.' },
          { id: 'AST-102', name: 'Cisco Catalyst 9300 Switch', sku: 'NET-CSCO-9300', category: 'Infrastructure', quantity: 6, unitCost: 4200, status: 'Available', lastInspected: '2026-11-01', notes: 'Main server room distribution rack switches.' },
          { id: 'AST-103', name: 'IntelliJ Ultimate Organization License', sku: 'LIC-JB-ULT', category: 'Software License', quantity: 50, unitCost: 499, status: 'Available', lastInspected: '2026-11-10', notes: 'Annual developer seats renewed.' },
          { id: 'AST-104', name: 'Sony Alpha 7 IV Media Kit', sku: 'AV-SNY-A7IV', category: 'Office Equipment', quantity: 2, unitCost: 2498, status: 'Maintenance', lastInspected: '2026-11-05', notes: 'Lens calibration scheduled with authorized dealer.' },
        ],
      },
    ],
    screens: [
      {
        id: 'dashboard',
        title: 'Operations & Asset Overview',
        subtitle: 'Key inventory totals, asset allocation ratios, and operational health',
        type: 'dashboard',
        entityName: 'item',
        dashboardConfig: {
          kpis: [
            { title: 'Total Catalog Assets', field: 'id', aggregation: 'count', icon: 'Box', change: '+4 newly added' },
            { title: 'Units In Active Use', field: 'status', filterStatus: 'In Use', aggregation: 'count', icon: 'Activity', change: '85% utilization' },
            { title: 'In Maintenance', field: 'status', filterStatus: 'Maintenance', aggregation: 'count', icon: 'AlertTriangle', change: 'Action required' },
            { title: 'Total Inventory Value', field: 'unitCost', aggregation: 'sum', icon: 'DollarSign', valuePrefix: '$', change: 'Fiscal Q4' },
          ],
          quickActions: [
            { label: 'Register New Asset', targetScreenId: 'new_item', icon: 'PlusCircle' },
            { label: 'View Asset Directory', targetScreenId: 'inventory', icon: 'List' },
          ],
          recentListEntity: 'item',
        },
      },
      {
        id: 'inventory',
        title: 'Master Inventory Directory',
        subtitle: 'Filter by category, search records, modify values, and track status',
        type: 'table',
        entityName: 'item',
        tableConfig: {
          columns: [
            { field: 'sku', header: 'Asset Code', format: 'text' },
            { field: 'name', header: 'Item Name', format: 'text' },
            { field: 'category', header: 'Category', format: 'text' },
            { field: 'quantity', header: 'Quantity', format: 'number' },
            { field: 'unitCost', header: 'Unit Cost', format: 'currency' },
            { field: 'status', header: 'Status', format: 'badge', badgeColorMap: { Available: 'success', 'In Use': 'primary', Maintenance: 'warning', Decommissioned: 'destructive' } },
            { field: 'lastInspected', header: 'Inspected', format: 'date' },
          ],
          searchableFields: ['name', 'sku', 'category'],
          filterField: 'category',
          filterOptions: ['All', 'Hardware', 'Software License', 'Office Equipment', 'Infrastructure', 'Mobile Device'],
          allowCreate: true,
          createScreenId: 'new_item',
          allowEdit: true,
          allowDelete: true,
        },
      },
      {
        id: 'new_item',
        title: 'Asset Registration Form',
        subtitle: 'Record new equipment details, cost attributes, and initial deployment status',
        type: 'form',
        entityName: 'item',
        formConfig: {
          targetEntity: 'item',
          fields: ['name', 'sku', 'category', 'quantity', 'unitCost', 'status', 'lastInspected', 'notes'],
          submitButtonText: 'Add to Inventory',
          successRedirectScreenId: 'inventory',
        },
      },
    ],
  };
}

export function generateClientCodeStack(appSpec: DynamicAppSpec): GeneratedSourceFile[] {
  const entity = appSpec.entities[0];
  const capitalizedEntity = entity.name.charAt(0).toUpperCase() + entity.name.slice(1);

  return [
    {
      fileName: `src/types/${entity.name}.ts`,
      content: `export interface ${capitalizedEntity} {\n  ${entity.fields.map(f => `${f.name}: ${f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : 'string'};`).join('\n  ')}\n}\n\nexport type ${capitalizedEntity}Input = Omit<${capitalizedEntity}, '${entity.primaryKey}'>;\n`,
    },
    {
      fileName: `src/lib/${entity.name}-storage.ts`,
      content: `import { ${capitalizedEntity} } from '@/types/${entity.name}';\n\nconst STORAGE_KEY = 'autodev_${appSpec.id}_${entity.name}';\n\nexport function getStored${capitalizedEntity}List(): ${capitalizedEntity}[] {\n  if (typeof window === 'undefined') return [];\n  const raw = localStorage.getItem(STORAGE_KEY);\n  if (!raw) return ${JSON.stringify(entity.initialData, null, 2)};\n  try { return JSON.parse(raw); } catch { return []; }\n}\n\nexport function save${capitalizedEntity}List(items: ${capitalizedEntity}[]): void {\n  if (typeof window === 'undefined') return;\n  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));\n}\n`,
    },
    {
      fileName: `src/components/${appSpec.id}/AppLandingView.tsx`,
      content: `'use client';\n\nimport React, { useState, useEffect } from 'react';\nimport { getStored${capitalizedEntity}List } from '@/lib/${entity.name}-storage';\nimport { ${capitalizedEntity} } from '@/types/${entity.name}';\n\nexport default function ${appSpec.name.replace(/[^a-zA-Z0-9]/g, '')}App() {\n  const [items, setItems] = useState<${capitalizedEntity}[]>([]);\n  useEffect(() => { setItems(getStored${capitalizedEntity}List()); }, []);\n  return <div><h1>${appSpec.name}</h1></div>;\n}\n`,
    },
  ];
}

