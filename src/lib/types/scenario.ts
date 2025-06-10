export interface Scenario {
  id: string; // uuid
  name: string;
  description?: string; // text
  scenario_data: Record<string, any>; // jsonb
  expected_outcomes?: Record<string, any>; // jsonb
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  author?: string; // uuid
} 