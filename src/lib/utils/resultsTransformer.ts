import { ColDef } from 'ag-grid-community';
import { RulesApiResponse } from '@/lib/services/rulesApi';

export interface RowData {
  key: string;
  [lender: string]: any;
}

const EXCLUDED_KEYS = ['AssumedValues', 'QDEXBankCode'];

export const transformResultsForGrid = (
  apiResponse: RulesApiResponse,
): { colDefs: ColDef[]; rowData: RowData[] } => {
  if (!apiResponse || typeof apiResponse !== 'object' || apiResponse === null) {
    return { colDefs: [], rowData: [] };
  }

  // Collect all unique keys from all lenders
  const allKeys = new Set<string>();
  Object.values(apiResponse).forEach(lenderData => {
    if (typeof lenderData === 'object' && lenderData !== null) {
      Object.keys(lenderData).forEach(key => {
        if (!EXCLUDED_KEYS.includes(key)) {
          allKeys.add(key);
        }
      });
    }
  });

  // Get sorted lender names
  const sortedLenders = Object.keys(apiResponse).sort();

  // Create column definitions
  const colDefs: ColDef[] = [
    {
      headerName: 'Key',
      field: 'key',
      pinned: 'left',
      filter: true,
      minWidth: 400,
    },
    ...sortedLenders.map(lender => ({
      headerName: lender,
      valueGetter: (params: any) => params.data?.[lender],
      // Use colId instead of field for columns with dots
      colId: lender,
    })),
  ];

  // Create row data - one row per unique key
  const rowData: RowData[] = Array.from(allKeys)
    .sort()
    .map(key => {
      const row: RowData = { key };
      
      // For each lender, get the value for this key
      sortedLenders.forEach(lender => {
        const lenderData = apiResponse[lender];
        if (typeof lenderData === 'object' && lenderData !== null) {
          row[lender] = lenderData[key];
        }
      });
      
      return row;
    });

  return { colDefs, rowData };
}; 