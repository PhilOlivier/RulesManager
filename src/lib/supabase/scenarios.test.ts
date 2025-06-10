// Import and mock supabaseClient first
import { supabase } from '../supabaseClient';
jest.mock('../supabaseClient');

// Now import the functions to be tested
import {
  getAllScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
} from './scenarios';
import { Scenario } from '../types/scenario';

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

const mockScenario: Scenario = {
  id: '1',
  name: 'Test Scenario',
  description: 'A test scenario',
  scenario_data: { key: 'value' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: 'test-user',
};

describe('Scenario DB Functions', () => {
  beforeEach(() => {
    (mockedSupabase.from as jest.Mock).mockClear();
  });

  it('should fetch all scenarios', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ data: [mockScenario], error: null });
    (mockedSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const scenarios = await getAllScenarios();

    expect(scenarios).toEqual([mockScenario]);
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(mockSelect).toHaveBeenCalledWith('*');
  });

  it('should fetch a single scenario by id', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockScenario, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (mockedSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const scenario = await getScenarioById('1');

    expect(scenario).toEqual(mockScenario);
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should create a new scenario', async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: mockScenario, error: null });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    (mockedSupabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
    
    const newScenarioData = { name: 'New Scenario', scenario_data: {} };
    const scenario = await createScenario(newScenarioData);
    
    expect(scenario).toEqual(mockScenario);
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(mockInsert).toHaveBeenCalledWith([expect.any(Object)]);
  });

  it('should update an existing scenario', async () => {
    const updates = { name: 'Updated Name' };
    const mockSingle = jest.fn().mockResolvedValue({ data: { ...mockScenario, ...updates }, error: null });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    (mockedSupabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

    const scenario = await updateScenario('1', updates);

    expect(scenario.name).toBe('Updated Name');
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining(updates));
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should delete a scenario', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
    (mockedSupabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });
    
    await deleteScenario('1');
    
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should duplicate a scenario', async () => {
    // Mock for getScenarioById
    const getSingle = jest.fn().mockResolvedValue({ data: mockScenario, error: null });
    const getEq = jest.fn().mockReturnValue({ single: getSingle });
    const getSelect = jest.fn().mockReturnValue({ eq: getEq });

    // Mock for createScenario
    const createSingle = jest.fn().mockResolvedValue({ data: { ...mockScenario, name: 'Test Scenario (Copy)' }, error: null });
    const createSelect = jest.fn().mockReturnValue({ single: createSingle });
    const createInsert = jest.fn().mockReturnValue({ select: createSelect });

    (mockedSupabase.from as jest.Mock)
        .mockReturnValueOnce({ select: getSelect }) // for getById
        .mockReturnValueOnce({ insert: createInsert }); // for create
    
    const duplicatedScenario = await duplicateScenario('1');

    expect(duplicatedScenario.name).toBe('Test Scenario (Copy)');
    expect(mockedSupabase.from).toHaveBeenCalledWith('test_scenarios');
    expect(getEq).toHaveBeenCalledWith('id', '1');
    expect(createInsert).toHaveBeenCalledWith([expect.objectContaining({ name: 'Test Scenario (Copy)' })]);
  });
}); 