export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: 'primary' | 'info' | 'warning' | 'success';
  subtitle: string;
}

export interface DepartmentUsage {
  department: string;
  queriesCount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface DailyActivity {
  day: string;
  date: string;
  queries: number;
  tokensK: number;
}

export interface TopDocument {
  id: string;
  title: string;
  category: string;
  citationsCount: number;
  confidenceAvg: number;
  size: string;
  lastCited: string;
}

export interface TelemetryLog {
  id: string;
  prompt: string;
  category: string;
  model: string;
  latencyMs: number;
  tokens: number;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  feedback: 'up' | 'down' | null;
}
