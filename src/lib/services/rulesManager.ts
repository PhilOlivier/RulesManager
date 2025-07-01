import { createClient } from '@/lib/supabase/client';
import {
  Rule,
  LenderValue,
  RuleGridRow,
  Lender,
} from '@/lib/types/rules';

const supabase = createClient();

export const getRules = async (): Promise<Rule[]> => {
  const { data, error } = await supabase.from('rules').select('*');

  if (error) {
    console.error('Error fetching rules:', error);
    throw new Error('Could not fetch rules');
  }

  return data || [];
};

export const getLenderValues = async (): Promise<LenderValue[]> => {
  const { data, error } = await supabase.from('lender_values').select('*');

  if (error) {
    console.error('Error fetching lender values:', error);
    throw new Error('Could not fetch lender values');
  }

  return data || [];
};

export const transformDataForGrid = (
  rules: Rule[],
  lenderValues: LenderValue[],
): RuleGridRow[] => {
  const ruleMap: { [key: string]: RuleGridRow } = {};

  rules.forEach(rule => {
    ruleMap[rule.id] = { ...rule };
  });

  lenderValues.forEach(lenderValue => {
    if (ruleMap[lenderValue.rule_id]) {
      ruleMap[lenderValue.rule_id][lenderValue.lender] = lenderValue.value;
    }
  });

  return Object.values(ruleMap);
};

export const upsertRule = async (rule: Partial<Rule>): Promise<Rule[]> => {
  const { data, error } = await supabase.from('rules').upsert([rule]).select();

  if (error) {
    console.error('Error upserting rule:', error);
    throw new Error('Could not upsert rule');
  }

  return data;
};

export const upsertLenderValue = async (
  value: Partial<LenderValue>,
): Promise<LenderValue[]> => {
  const { data, error } = await supabase
    .from('lender_values')
    .upsert([value], { onConflict: 'rule_id,lender' })
    .select();

  if (error) {
    console.error('Error upserting lender value:', error);
    throw new Error('Could not upsert lender value');
  }

  return data;
};

export const deleteLenderValue = async (
  ruleId: string,
  lender: string,
): Promise<void> => {
  const { error } = await supabase
    .from('lender_values')
    .delete()
    .match({ rule_id: ruleId, lender: lender });

  if (error) {
    console.error('Error deleting lender value:', error);
    throw new Error('Could not delete lender value');
  }
};

export const getLenders = async (): Promise<Lender[]> => {
  const { data, error } = await supabase
    .from('lenders')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching lenders:', error);
    throw new Error('Could not fetch lenders');
  }

  return data || [];
}; 