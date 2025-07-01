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
  ICellRendererParams,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { RuleGridRow, Lender } from '@/lib/types/rules';
import { Button } from '@/components/ui/button';

ModuleRegistry.registerModules([AllCommunityModule]);

interface RulesManagerGridProps {
  rowData: RuleGridRow[];
  lenders: Lender[];
  onCellValueChanged: (event: CellValueChangedEvent) => void;
  onGridReady?: (params: GridReadyEvent) => void;
  onModelUpdated?: (params: ModelUpdatedEvent) => void;
  isExternalFilterPresent?: () => boolean;
  doesExternalFilterPass?: (node: IRowNode<RuleGridRow>) => boolean;
  onOpenMetadata?: (rule: RuleGridRow) => void;
}

// Info icon cell renderer component
const InfoIconRenderer: React.FC<ICellRendererParams<RuleGridRow>> = ({ data, context }) => {
  if (!data) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (context?.onOpenMetadata) {
      context.onOpenMetadata(data);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="w-8 h-8 p-0"
        title="Edit metadata"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </Button>
    </div>
  );
};

const RulesManagerGrid: React.FC<RulesManagerGridProps> = ({
  rowData,
  lenders,
  onCellValueChanged,
  onGridReady,
  onModelUpdated,
  isExternalFilterPresent,
  doesExternalFilterPass,
  onOpenMetadata,
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
      {
        headerName: '',
        field: 'info',
        pinned: 'left',
        lockPosition: true,
        width: 50,
        sortable: false,
        cellRenderer: InfoIconRenderer,
        cellClass: 'info-cell',
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
        context={{ onOpenMetadata }}
        // Debug events
        onCellEditingStarted={(e) => console.log('Cell editing started:', e.colDef.field)}
        onCellEditingStopped={(e) => console.log('Cell editing stopped:', e.colDef.field)}
      />
    </div>
  );
};

export default RulesManagerGrid;