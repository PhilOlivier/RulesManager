import { supabase } from '../supabaseClient';
import { Scenario } from '../types/scenario';

export const getAllScenarios = async (
  searchTerm?: string
): Promise<Scenario[]> => {
  let query = supabase.from('test_scenarios').select('*');

  if (searchTerm) {
    // Use 'or' to search in multiple columns.
    // The syntax is `column.ilike.%value%,another_column.ilike.%value%`
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching scenarios:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  const { data, error } = await supabase
    .from('test_scenarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching scenario with id ${id}:`, error);
    // Return null if the scenario is not found, otherwise throw
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
};

export const createScenario = async (
  scenarioData: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>
): Promise<Scenario> => {
  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from('test_scenarios')
    .insert([{ ...scenarioData, created_at: timestamp, updated_at: timestamp }])
    .select()
    .single();

  if (error) {
    console.error('Error creating scenario:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateScenario = async (
  id: string,
  scenarioData: Partial<Omit<Scenario, 'id' | 'created_at' | 'updated_at'>>
): Promise<Scenario> => {
  const { data, error } = await supabase
    .from('test_scenarios')
    .update({ ...scenarioData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating scenario with id ${id}:`, error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteScenario = async (id: string): Promise<void> => {
  const { error } = await supabase.from('test_scenarios').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting scenario with id ${id}:`, error);
    throw new Error(error.message);
  }
};

export const duplicateScenario = async (id: string): Promise<Scenario> => {
  const originalScenario = await getScenarioById(id);

  if (!originalScenario) {
    throw new Error(`Scenario with id ${id} not found.`);
  }

  const {
    id: originalId,
    created_at,
    updated_at,
    ...newScenarioData
  } = originalScenario;

  newScenarioData.name = `${originalScenario.name} (Copy)`;

  return await createScenario(newScenarioData);
}; 