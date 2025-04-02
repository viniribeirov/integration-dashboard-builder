
// Add this to your types/index.ts file or create it if it doesn't exist
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updated_at: string;
  created_at: string;
  user_id: string;
  thumbnail: string | null;
  integrations?: Integration[];
}

export type PlatformType = "facebook" | "google" | "instagram" | "twitter" | "linkedin";
export type IntegrationStatus = "connected" | "disconnected" | "pending";

export interface Integration {
  id: string;
  platform: PlatformType;
  status: IntegrationStatus;
  project_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  account_name: string | null;
  last_sync: string | null;
}

export type WidgetType = "kpi" | "line" | "bar" | "area";

export interface DashboardWidget {
  id: string;
  name: string;
  type: WidgetType;
  platform: PlatformType;
  metrics: string[];
  size: 'small' | 'medium' | 'large';
  position: number;
  custom_formula: string;
  project_id: string;
}

export interface MetricData {
  value: string;
  label: string;
  category: string;
}
