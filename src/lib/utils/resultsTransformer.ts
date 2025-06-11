import { ColDef } from 'ag-grid-community';
import { RulesApiResponse } from '@/lib/services/rulesApi';

export interface RowData {
  key: string;
  [lender: string]: any;
}

export const transformResultsForGrid = (
  apiResponse: RulesApiResponse,
): { colDefs: ColDef[]; rowData: RowData[] } => {
  if (!apiResponse || Object.keys(apiResponse).length === 0) {
    return { colDefs: [], rowData: [] };
  }

  const lenders = Object.keys(apiResponse);
  
  // Create column definitions
  const colDefs: ColDef[] = [
    {
      headerName: 'Key',
      field: 'key',
      pinned: 'left',
      filter: true,
      minWidth: 400,
    },
    ...lenders.map((lender) => ({
      headerName: lender,
      field: lender,
    })),
  ];

  // Aggregate all unique keys from all lenders
  const allKeys = new Set<string>();
  lenders.forEach((lender) => {
    Object.keys(apiResponse[lender]).forEach((key) => {
      allKeys.add(key);
    });
  });

  // Create row data
  const rowData: RowData[] = Array.from(allKeys).map((key) => {
    const row: RowData = { key };
    lenders.forEach((lender) => {
      row[lender] = apiResponse[lender][key];
    });
    return row;
  });

  return { colDefs, rowData };
}; 