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
    const predicate = createQueryPredicate(filterText);
    setActivePredicate(() => predicate);
  }, [filterText]);

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
        return activePredicate(node.data.key);
      }
      return true;
    },
    [activePredicate],
  );

  const updatedColDefs = useMemo(() => {
    return colDefs.map((colDef) => {
      if (colDef.field !== 'key') {
        return {
          ...colDef,
          cellClassRules,
        };
      }
      return colDef;
    });
  }, [colDefs]);

  const normalizedRowData = useMemo(() => {
    if (!normalizeBooleans) {
      return rowData;
    }
    return rowData.map((row) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((key) => {
        if (newRow[key] === 1) {
          newRow[key] = true;
        } else if (newRow[key] === 0) {
          newRow[key] = false;
        }
      });
      return newRow;
    });
  }, [rowData, normalizeBooleans]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 border rounded-md">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter keys... (e.g., 'CanLend' AND 'Residency')"
            className="w-96"
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
        <AgGridReact<RowData>
          columnDefs={updatedColDefs}
          rowData={normalizedRowData}
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
