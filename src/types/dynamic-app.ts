export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'select' 
  | 'date' 
  | 'textarea' 
  | 'boolean' 
  | 'badge';

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
  validation?: FieldValidation;
}

export interface EntitySpec {
  name: string;
  pluralName: string;
  primaryKey: string;
  fields: FieldSpec[];
  initialData: Array<Record<string, any>>;
}

export interface TableColumnSpec {
  field: string;
  header: string;
  format?: 'text' | 'number' | 'date' | 'currency' | 'badge';
  badgeColorMap?: Record<string, string>;
}

export interface TableConfig {
  columns: TableColumnSpec[];
  searchableFields?: string[];
  filterField?: string;
  filterOptions?: string[];
  allowCreate?: boolean;
  createScreenId?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export interface KpiCardSpec {
  title: string;
  field?: string;
  aggregation?: 'count' | 'sum' | 'average';
  filterStatus?: string;
  icon?: string;
  change?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export interface DashboardConfig {
  kpis: KpiCardSpec[];
  quickActions?: Array<{
    label: string;
    targetScreenId: string;
    icon?: string;
  }>;
  recentListEntity?: string;
}

export interface FormConfig {
  targetEntity: string;
  fields: string[];
  submitButtonText?: string;
  successRedirectScreenId?: string;
  title?: string;
  subtitle?: string;
}

export type ScreenType = 'dashboard' | 'table' | 'form' | 'detail' | 'kanban';

export interface ScreenSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: ScreenType;
  entityName?: string;
  dashboardConfig?: DashboardConfig;
  tableConfig?: TableConfig;
  formConfig?: FormConfig;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface DynamicAppSpec {
  id: string;
  name: string;
  tagline: string;
  description: string;
  brand: {
    name: string;
    accentColor: string;
    iconName?: string;
  };
  navigation: {
    items: NavigationItem[];
    defaultScreenId: string;
  };
  entities: EntitySpec[];
  screens: ScreenSpec[];
}

export interface GeneratedSourceFile {
  fileName: string;
  content: string;
}

export interface DynamicAppGenerationResult {
  appSpec: DynamicAppSpec;
  codeFiles: GeneratedSourceFile[];
  summary: string;
}

