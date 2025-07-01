'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  CellValueChangedEvent,
  GetRowIdParams,
  GridReadyEvent,
  ModelUpdatedEvent,
  IRowNode,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { RuleGridRow, Lender } from '@/lib/types/rules';

ModuleRegistry.registerModules([AllCommunityModule]);

interface RulesManagerGridProps {
  rowData: RuleGridRow[];
  lenders: Lender[];
  onCellValueChanged: (event: CellValueChangedEvent) => void;
  onGridReady?: (params: GridReadyEvent) => void;
  onModelUpdated?: (params: ModelUpdatedEvent) => void;
  isExternalFilterPresent?: () => boolean;
  doesExternalFilterPass?: (node: IRowNode<RuleGridRow>) => boolean;
}

const RulesManagerGrid: React.FC<RulesManagerGridProps> = ({
  rowData,
  lenders,
  onCellValueChanged,
  onGridReady,
  onModelUpdated,
  isExternalFilterPresent,
  doesExternalFilterPass,
}) => {
  const getRowId = useMemo(() => {
    return (params: GetRowIdParams) => params.data.id;
  }, []);

  const columnDefs: ColDef[] = useMemo(() => {
    const staticCols: ColDef[] = [
      {
        field: 'key',
        headerName: 'Key',
        pinned: 'left',
        lockPosition: true,
        width: 250,
        sortable: true,
      },
    ];

    const dynamicCols: ColDef[] = lenders.map(lender => ({
      field: lender.name,
      headerName: lender.name,
      sortable: true,
      editable: true,
      valueGetter: params => params.data && params.data[lender.name],
      // Add valueSetter to properly handle cell edits
      valueSetter: params => {
        if (!params.data) return false;
        params.data[lender.name] = params.newValue;
        return true;
      },
    }));

    return [...staticCols, ...dynamicCols];
  }, [lenders]);

  console.log('Grid initialized with onCellValueChanged handler:', !!onCellValueChanged);

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: '100%', width: '100%' }}
    >
      <AgGridReact
        getRowId={getRowId}
        columnDefs={columnDefs}
        rowData={rowData}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
        onModelUpdated={onModelUpdated}
        isExternalFilterPresent={isExternalFilterPresent}
        doesExternalFilterPass={doesExternalFilterPass}
        // Debug events
        onCellEditingStarted={(e) => console.log('Cell editing started:', e.colDef.field)}
        onCellEditingStopped={(e) => console.log('Cell editing stopped:', e.colDef.field)}
      />
    </div>
  );
};

export default RulesManagerGrid;