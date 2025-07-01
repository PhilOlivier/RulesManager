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
  IHeaderParams,
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
  onRemoveLender?: (lenderName: string) => void;
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

// Custom header renderer for lender columns with remove icon
const LenderHeaderRenderer: React.FC<IHeaderParams> = ({ displayName, context, column }) => {
  if (!displayName || !context?.onRemoveLender) return displayName;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const colId = column.getColId();
    if (colId && context.onRemoveLender) {
      context.onRemoveLender(colId);
    }
  };

  return (
    <div className="flex items-center justify-between w-full group">
      <span className="truncate flex-1" title={displayName}>
        {displayName}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveClick}
        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-red-100 hover:text-red-600"
        title={`Remove ${displayName} column`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
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
  onRemoveLender,
}) => {
  // Add custom tooltip styles and row styling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ag-tooltip {
        background-color: white !important;
        border: 1px solid black !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        opacity: 1 !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
        color: black !important;
        max-width: 300px !important;
        word-wrap: break-word !important;
        z-index: 1000 !important;
      }
      
      .ag-tooltip::before {
        display: none !important;
      }
      
      /* Zebra striping - alternating row colors */
      .ag-theme-alpine .ag-row-odd {
        background-color: #f8f9fa !important;
      }
      
      .ag-theme-alpine .ag-row-even {
        background-color: white !important;
      }
      
      /* Row hover highlighting */
      .ag-theme-alpine .ag-row:hover {
        background-color: #e3f2fd !important;
      }
      
      /* Ensure hover works on both odd and even rows */
      .ag-theme-alpine .ag-row-odd:hover,
      .ag-theme-alpine .ag-row-even:hover {
        background-color: #e3f2fd !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
        // Add tooltip to show full key content
        tooltipField: 'key',
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
      // Hidden columns for sorting purposes
      {
        field: 'type',
        headerName: 'Type',
        hide: true,
        sortable: true,
      },
      {
        field: 'category',
        headerName: 'Category',
        hide: true,
        sortable: true,
      },
    ];

    const dynamicCols: ColDef[] = lenders.map(lender => ({
      field: lender.name,
      headerName: lender.name,
      sortable: true,
      editable: true,
      headerComponent: LenderHeaderRenderer,
      valueGetter: params => params.data && params.data[lender.name],
      // Add valueSetter to properly handle cell edits
      valueSetter: params => {
        if (!params.data) return false;
        params.data[lender.name] = params.newValue;
        return true;
      },
      // Add tooltip functionality to show full cell content
      tooltipValueGetter: params => {
        if (!params.data) return '';
        const value = params.data[lender.name];
        // Only show tooltip if there's actually content
        return value != null ? String(value) : '';
      },
    }));

    return [...staticCols, ...dynamicCols];
  }, [lenders]);

  console.log('Grid initialized with onCellValueChanged handler:', !!onCellValueChanged);

  // Define the default sort model
  const defaultSortModel = useMemo(() => [
    { colId: 'type', sort: 'asc' as const, sortIndex: 0 },
    { colId: 'category', sort: 'asc' as const, sortIndex: 1 },
    { colId: 'key', sort: 'asc' as const, sortIndex: 2 },
  ], []);

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
        context={{ onOpenMetadata, onRemoveLender }}
        // Set default sort model
        initialState={{
          sort: {
            sortModel: defaultSortModel,
          },
        }}
        // Debug events
        onCellEditingStarted={(e) => console.log('Cell editing started:', e.colDef.field)}
        onCellEditingStopped={(e) => console.log('Cell editing stopped:', e.colDef.field)}
      />
    </div>
  );
};

export default RulesManagerGrid;