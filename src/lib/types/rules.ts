export type RuleType = 'Rule' | 'Constant';

export interface Rule {
  id: string;
  key: string;
  type: RuleType;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface LenderValue {
  id: string;
  rule_id: string;
  lender: string;
  value: string | number | boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Lender {
  id: string;
  name: string;
  parent_name: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface RuleCategory {
  id: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RuleGridRow extends Rule {
  [lender: string]: string | number | boolean | null | RuleType;
} 