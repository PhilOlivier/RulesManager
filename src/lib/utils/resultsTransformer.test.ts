import { transformResultsForGrid } from './resultsTransformer';
import { RulesApiResponse } from '@/lib/services/rulesApi';

describe('transformResultsForGrid', () => {
  it('should return empty arrays for null, undefined, or non-object input', () => {
    const result = transformResultsForGrid(null as any);
    expect(result.colDefs).toEqual([]);
    expect(result.rowData).toEqual([]);
  });

  it('should handle an empty API response', () => {
    const { colDefs, rowData } = transformResultsForGrid({});
    expect(colDefs.length).toBe(1); // Key column only
    expect(rowData.length).toBe(0);
  });

  it('should handle a simple flat structure', () => {
    const apiResponse: RulesApiResponse = {
      Root: { 'can.Lend': true, 'interest.Rate': 1.5 },
      'Root.Resi': { 'can.Lend': false, 'interest.Rate': 2.0 },
    };

    const { colDefs, rowData } = transformResultsForGrid(apiResponse);

    expect(colDefs.map(c => c.headerName)).toEqual(['Key', 'Root', 'Root.Resi']);
    expect(rowData).toHaveLength(2);
    expect(rowData).toContainEqual({ 
      key: 'can.Lend', 
      Root: true, 
      'Root.Resi': false 
    });
    expect(rowData).toContainEqual({ 
      key: 'interest.Rate', 
      Root: 1.5, 
      'Root.Resi': 2.0 
    });
  });

  it('should handle lenders with different sets of keys', () => {
    const apiResponse: RulesApiResponse = {
      Root: { 'can.Lend': true, 'reason': 'Approved' },
      'Root.Resi': { 'can.Lend': false, 'max.LTV': 85 },
    };

    const { colDefs, rowData } = transformResultsForGrid(apiResponse);

    expect(colDefs.map(c => c.headerName)).toEqual(['Key', 'Root', 'Root.Resi']);
    expect(rowData).toHaveLength(3);
    expect(rowData).toContainEqual({ 
      key: 'can.Lend', 
      Root: true, 
      'Root.Resi': false 
    });
    expect(rowData).toContainEqual({ 
      key: 'max.LTV', 
      Root: undefined, 
      'Root.Resi': 85 
    });
    expect(rowData).toContainEqual({ 
      key: 'reason', 
      Root: 'Approved', 
      'Root.Resi': undefined 
    });
  });

  it('should filter out AssumedValues and QDEXBankCode keys', () => {
    const apiResponse: RulesApiResponse = {
      Root: { 
        'can.Lend': true, 
        AssumedValues: ['a', 'b'],
        QDEXBankCode: 'Root'
      },
    };
    const { rowData } = transformResultsForGrid(apiResponse);
    expect(rowData).toHaveLength(1);
    expect(rowData[0].key).toBe('can.Lend');
  });

  it('should handle a single lender', () => {
    const apiResponse: RulesApiResponse = {
      Root: { 'can.Lend': true, 'max.Amount': 50000 },
    };

    const { colDefs, rowData } = transformResultsForGrid(apiResponse);
    expect(colDefs.map(c => c.headerName)).toEqual(['Key', 'Root']);
    expect(rowData).toHaveLength(2);
    expect(rowData).toContainEqual({ key: 'can.Lend', Root: true });
    expect(rowData).toContainEqual({ key: 'max.Amount', Root: 50000 });
  });
}); 