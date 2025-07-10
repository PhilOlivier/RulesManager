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

interface JournalGridProps {
  rowData: any[];
  columnDefs: ColDef[];
}

const cellClassRules = {
  'cell-true': 'x === true || x === 1',
  'cell-false': 'x === false || x === 0',
  'cell-error': 'typeof x === "string" && x.startsWith("ERROR:")',
};

export const JournalGrid: React.FC<JournalGridProps> = ({ rowData, columnDefs }) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [filterText, setFilterText] = useState('');
  const [activePredicate, setActivePredicate] = useState<
    ((key: string) => boolean) | null
  >(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);
  const [normalizeBooleans, setNormalizeBooleans] = useState(false);

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
      
      // If no match on key, find the row with this key
      const row = rowData.find(r => r.key === key);
      if (!row) return false;
      
      // Then check all other columns
      for (const colKey in row) {
        // Skip the key column since we already checked it
        if (colKey === 'key') continue;
        
        const value = row[colKey];
        // Convert to string for comparison
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

  useEffect(() => {
    gridApi?.onFilterChanged();
  }, [activePredicate, gridApi]);

  const isExternalFilterPresent = useCallback((): boolean => {
    return activePredicate != null;
  }, [activePredicate]);

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<any>): boolean => {
      if (node.data && activePredicate) {
        return activePredicate(node.data.key);
      }
      return true;
    },
    [activePredicate]
  );

  const updatedColDefs = useMemo(() => {
    return columnDefs.map(colDef => {
      if (colDef.field !== 'key') {
        return {
          ...colDef,
          cellClassRules,
          valueFormatter: (params: { value: any }) => {
            if (params.value === undefined || params.value === null) {
              return ''; // Display empty string for null or undefined
            }
            return String(params.value); // Convert all other types to string
          },
        };
      }
      return colDef;
    });
  }, [columnDefs]);

  const normalizedRowData = useMemo(() => {
    if (!normalizeBooleans) {
      return rowData;
    }
    return rowData.map(row => {
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
  }, [rowData, normalizeBooleans]);
  
  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
  };

  return (
    <div className="space-y-4">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="flex justify-between items-center p-4 border rounded-md">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter keys... (e.g., 'VarA' AND 'SomeOtherKey')"
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
        }}
      >
        <AgGridReact
          columnDefs={updatedColDefs}
          rowData={normalizedRowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onModelUpdated={onModelUpdated}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          suppressFieldDotNotation={true}
        />
      </div>
    </div>
  );
};
