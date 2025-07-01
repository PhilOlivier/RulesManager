import { createClient } from '@/lib/supabase/client';
import {
  Rule,
  LenderValue,
  RuleGridRow,
  Lender,
  RuleCategory,
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

export const addLender = async (lenderName: string): Promise<Lender> => {
  // Get the highest display_order to append the new lender at the end
  const { data: existingLenders } = await supabase
    .from('lenders')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  const nextDisplayOrder = existingLenders && existingLenders.length > 0 
    ? existingLenders[0].display_order + 1 
    : 1;

  // Determine parent name for hierarchical lenders
  let parentName = null;
  if (lenderName.includes('.')) {
    const parts = lenderName.split('.');
    parentName = parts.slice(0, -1).join('.');
  }

  const { data, error } = await supabase
    .from('lenders')
    .insert([{
      name: lenderName,
      parent_name: parentName,
      display_order: nextDisplayOrder,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding lender:', error);
    throw new Error('Could not add lender');
  }

  return data;
};

export const removeLender = async (lenderName: string): Promise<void> => {
  // First, check if any child lenders exist
  const { data: childLenders, error: childError } = await supabase
    .from('lenders')
    .select('name')
    .eq('parent_name', lenderName);

  if (childError) {
    console.error('Error checking for child lenders:', childError);
    throw new Error('Could not check for child lenders');
  }

  if (childLenders && childLenders.length > 0) {
    throw new Error(`Cannot remove lender "${lenderName}". It has child lenders: ${childLenders.map(l => l.name).join(', ')}`);
  }

  // Remove all lender values for this lender
  const { error: valuesError } = await supabase
    .from('lender_values')
    .delete()
    .eq('lender', lenderName);

  if (valuesError) {
    console.error('Error removing lender values:', valuesError);
    throw new Error('Could not remove lender values');
  }

  // Remove the lender from the lenders table
  const { error } = await supabase
    .from('lenders')
    .delete()
    .eq('name', lenderName);

  if (error) {
    console.error('Error removing lender:', error);
    throw new Error('Could not remove lender');
  }
};

export const getRuleCategories = async (): Promise<RuleCategory[]> => {
  const { data, error } = await supabase
    .from('rule_categories')
    .select('*')
    .order('category');

  if (error) {
    console.error('Error fetching rule categories:', error);
    throw new Error('Could not fetch rule categories');
  }

  return data || [];
};

 