'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  ModelUpdatedEvent,
  GridApi,
  IRowNode,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { RowData } from '@/lib/utils/resultsTransformer';
import { createQueryPredicate } from '@/lib/utils/filterParser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom styles to enable text selection in AG Grid
const customStyles = `
  .ag-theme-balham .ag-cell {
    user-select: text !important;
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
  }
  .ag-theme-balham .ag-cell[col-id="key"] {
    cursor: text !important;
  }
`;

interface ResultsGridProps {
  colDefs: ColDef[];
  rowData: RowData[];
}

const cellClassRules = {
  'cell-true': 'x === true || x === 1',
  'cell-false': 'x === false || x === 0',
  'cell-error': 'typeof x === "string" && x.startsWith("ERROR:")',
};

const ResultsGrid: React.FC<ResultsGridProps> = ({ colDefs, rowData }) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [filterText, setFilterText] = useState('');
  const [activePredicate, setActivePredicate] = useState<
    ((key: string) => boolean) | null
  >(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);
  const [normalizeBooleans, setNormalizeBooleans] = useState(false);

const defaultColDef = useMemo(() => {
  return {
    minWidth: 400,      // Set minimum width for all columns
    resizable: true,   // Keep columns resizable
  };
}, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    setDisplayedRowCount(params.api.getDisplayedRowCount());
  }, []);

  const onModelUpdated = useCallback((params: ModelUpdatedEvent) => {
    if (params.api) {
      setDisplayedRowCount(params.api.getDisplayedRowCount());
    }
  }, []);

  const handleApplyFilter = useCallback(() => {
    // Get the original string-based predicate
    const stringPredicate = createQueryPredicate(filterText);
    
    // Create a row-level predicate
    const rowPredicate = (key: string): boolean => {
      // First check if the key matches
      if (stringPredicate(key)) {
        return true;
      }
      
      // If no match on key, get the full row data
      const row = rowData.find(r => r.key === key);
      if (!row) return false;
      
      // Then check all other columns
      for (const colKey in row) {
        // Skip the key column since we already checked it
        if (colKey === 'key') continue;
        
        const value = row[colKey];
        // Convert to string for comparison (similar to evaluateTerm in your parser)
        const valueStr = value !== null && value !== undefined ? String(value) : '';
        
        // Use the same predicate on this column value
        if (stringPredicate(valueStr)) {
          return true;
        }
      }
      
      return false;
    };
    
    setActivePredicate(() => rowPredicate);
  }, [filterText, rowData]);

  const handleResetFilter = useCallback(() => {
    setFilterText('');
    setActivePredicate(null);
  }, []);

  // Effect to apply the filter when the predicate changes
  useEffect(() => {
    gridApi?.onFilterChanged();
  }, [activePredicate, gridApi]);

  const isExternalFilterPresent = useCallback((): boolean => {
    return activePredicate != null;
  }, [activePredicate]);

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<RowData>): boolean => {
      if (node.data && activePredicate) {
        // We only need to pass the key to our predicate now,
        // as it will handle finding and checking the row data
        return activePredicate(node.data.key);
      }
      return true;
    },
    [activePredicate],
  );

  const updatedColDefs = useMemo(() => {
    return colDefs.map(colDef => {
      if (colDef.field !== 'key') {
        return {
          ...colDef,
          cellClassRules,
          valueFormatter: (params: { value: any; data?: any }) => {
            // Debug logging for the specific key and column
            if (params.data?.key === 'Applicant[1].CanLend.MinMonthsSinceLastRegisteredCCJ' && 
                colDef.headerName === 'Root') {
              console.log(`🔍 VALUE FORMATTER DEBUG for Root/${params.data.key}:`, {
                originalValue: params.value,
                valueType: typeof params.value,
                willFormat: typeof params.value === 'boolean'
              });
            }
            
            if (typeof params.value === 'boolean') {
              return params.value ? 'TRUE' : 'FALSE';
            }
            return params.value;
          },
        };
      }
      return colDef;
    });
  }, [colDefs]);

  const normalizedRowData = useMemo(() => {
    if (!normalizeBooleans) {
      return rowData;
    }
    
    const normalized = rowData.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        const value = newRow[key];
        if (value === 1 || value === '1' || value === true) {
          newRow[key] = true;
        } else if (value === 0 || value === '0' || value === false) {
          newRow[key] = false;
        }
      });
      return newRow;
    });
    
    // Debug the specific key the user mentioned
    const testKey = 'Applicant[1].CanLend.MinMonthsSinceLastRegisteredCCJ';
    const originalRow = rowData.find(row => row.key === testKey);
    const normalizedRow = normalized.find(row => row.key === testKey);
    
    if (originalRow) {
      console.log(`🔍 BOOLEAN NORMALIZATION DEBUG:`);
      console.log(`🔍 Original Root value for ${testKey}:`, originalRow.Root);
      console.log(`🔍 Normalized Root value for ${testKey}:`, normalizedRow?.Root);
    }
    
    return normalized;
  }, [rowData, normalizeBooleans]);

  return (
    <div className="space-y-4">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="flex justify-between items-center p-4 border rounded-md">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter keys... (e.g., 'CanLend' AND 'Residency')"
            className="w-[48rem]"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
          />
          <Button onClick={handleApplyFilter}>Apply Filter</Button>
          <Button variant="outline" onClick={handleResetFilter}>
            Reset Filter
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="normalize-booleans"
            checked={normalizeBooleans}
            onCheckedChange={setNormalizeBooleans}
          />
          <Label htmlFor="normalize-booleans">Normalise Booleans</Label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {displayedRowCount} of {rowData.length} rows
      </p>

      <div
        className="ag-theme-balham"
        style={{
          height: 'calc(100vh - 350px)',
          width: '100%',
          '--ag-cell-text-selection': 'text',
        } as React.CSSProperties}
      >
        <AgGridReact<RowData>
          columnDefs={updatedColDefs}
          rowData={normalizedRowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onModelUpdated={onModelUpdated}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
        />
      </div>
    </div>
  );
};

export default ResultsGrid;
