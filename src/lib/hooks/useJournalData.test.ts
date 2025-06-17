import { renderHook, waitFor } from '@testing-library/react';
import { useJournalData } from './useJournalData';
import { getJournalByJobId, JournalEntry } from '@/lib/api/journal';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';

// Mock the modules
jest.mock('@/lib/api/journal');
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/EnvironmentContext');

const mockGetJournalByJobId = getJournalByJobId as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseEnvironment = useEnvironment as jest.Mock;

const mockJournalData: JournalEntry[] = [
  { id: '1', comment: 'Resolved', QDEXBankCode: 'Root', dictionary: { VarA: '10', VarB: '20' } },
  { id: '2', comment: 'Resolved', QDEXBankCode: 'LenderA', dictionary: { VarA: '11' } },
  { id: '3', comment: 'Unresolved', QDEXBankCode: 'Root', dictionary: { VarA: 'formulaA', VarB: 'formulaB' } },
  { id: '4', comment: 'Unresolved', QDEXBankCode: 'LenderA', dictionary: { VarA: 'formulaA_Lender' } },
  { id: '5', comment: 'Resolved', QDEXBankCode: 'Root', dictionary: { VarC: '30' } },
];

describe('useJournalData', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUseAuth.mockReturnValue({
      session: { access_token: 'test-token' },
    });
    mockUseEnvironment.mockReturnValue({
      environment: 'MVP',
    });
    mockGetJournalByJobId.mockResolvedValue(mockJournalData);
  });

  it('should correctly filter and pivot data for the "results" view', async () => {
    const { result } = renderHook(() => useJournalData({ jobUuid: 'test-uuid', viewType: 'results' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify row data
    expect(result.current.rowData).toHaveLength(3); // VarA, VarB, VarC
    expect(result.current.rowData).toContainEqual({ key: 'VarA', Root: '10', LenderA: '11' });
    expect(result.current.rowData).toContainEqual({ key: 'VarB', Root: '20', LenderA: '' });
    expect(result.current.rowData).toContainEqual({ key: 'VarC', Root: '30', LenderA: '' });

    // Verify column definitions
    expect(result.current.columnDefs).toHaveLength(3); // key, Root, LenderA
    expect(result.current.columnDefs.map(c => c.field)).toEqual(['key', 'Root', 'LenderA']);
  });

  it('should correctly filter and pivot data for the "rules" view', async () => {
    const { result } = renderHook(() => useJournalData({ jobUuid: 'test-uuid', viewType: 'rules' }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify row data
    expect(result.current.rowData).toHaveLength(2); // VarA, VarB
    expect(result.current.rowData).toContainEqual({ key: 'VarA', Root: 'formulaA', LenderA: 'formulaA_Lender' });
    expect(result.current.rowData).toContainEqual({ key: 'VarB', Root: 'formulaB', LenderA: '' });
    
    // Verify column definitions
    expect(result.current.columnDefs.map(c => c.field)).toEqual(['key', 'Root', 'LenderA']);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch';
    mockGetJournalByJobId.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useJournalData({ jobUuid: 'test-uuid', viewType: 'results' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.rowData).toEqual([]);
    expect(result.current.columnDefs).toEqual([]);
  });

  it('should not fetch data if jobUuid is null', async () => {
    const { result } = renderHook(() => useJournalData({ jobUuid: null, viewType: 'results' }));

    // No need for waitFor, as loading should be false from the start
    expect(result.current.loading).toBe(false);
    expect(mockGetJournalByJobId).not.toHaveBeenCalled();
  });
}); 