'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ICellRendererParams,
  FirstDataRenderedEvent,
  CellValueChangedEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { Button } from '@/components/ui/button';
import { Trash, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Scenario } from '@/lib/types/scenario';
import { createScenario, updateScenario } from '@/lib/supabase/scenarios';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

ModuleRegistry.registerModules([AllCommunityModule]);

// Interface for row data - value is still string in the grid
interface RowData {
  id: string;
  key: string;
  value: string;
}

// Function to parse string values to their correct types for storage
const parseValueToCorrectType = (value: string): any => {
  // Handle empty strings
  if (value === "") {
    return "";
  }
  
  // Handle numbers - check if it's a valid number and doesn't start with 0 (unless it's 0.x)
  if (/^-?\d+(\.\d+)?$/.test(value) && 
      (value === "0" || !value.startsWith("0") || value.startsWith("0."))) {
    return Number(value);
  }
  
  // Handle booleans
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  
  // Date strings and other strings remain as strings
  return value;
};

// Function to ensure values are displayed as strings in the grid
const ensureString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.warn('Failed to stringify object', e);
      return '';
    }
  }
  
  // Force string conversion for everything else
  return String(value);
};

interface ScenarioEditorProps {
  scenario?: Scenario;
}

const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  scenario: initialScenario,
}) => {
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState<string | undefined>(
    initialScenario?.id
  );
  const [name, setName] = useState(initialScenario?.name || '');
  const [description, setDescription] = useState(
    initialScenario?.description || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initialize rowData with stringified values
  const [rowData, setRowData] = useState<RowData[]>(() => {
    if (!initialScenario?.scenario_data) {
      return [{ id: uuidv4(), key: '', value: '' }];
    }
    
    return Object.entries(initialScenario.scenario_data).map(([key, value]) => ({
      id: uuidv4(),
      key,
      value: ensureString(value)
    }));
  });
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRun = useRef(true);
  
  const handleAddRow = useCallback(() => {
    setRowData((prev) => [...prev, { id: uuidv4(), key: '', value: '' }]);
  }, []);

  const handleDeleteRow = useCallback((idToDelete: string) => {
    setRowData((prev) => prev.filter((row) => row.id !== idToDelete));
  }, []);

  // Strictly enforce string values when cell changes
  const onCellValueChanged = useCallback((event: CellValueChangedEvent<RowData>) => {
    if (!event.data) return;
    
    // Always ensure the value is a string in the grid
    if (event.colDef.field === 'value') {
      event.data.value = ensureString(event.data.value);
    }
    
    setRowData((prev) => 
      prev.map((row) => (row.id === event.data.id ? event.data : row))
    );
  }, []);
  
  // Save function that converts values to their correct types
  const handleSave = useCallback(async () => {
    if (!name) {
      console.log('Name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // Create a clean object with properly typed values
    const scenarioData = rowData.reduce((acc, row) => {
      if (row.key) {
        // Parse the string value to the correct type before saving
        acc[row.key] = parseValueToCorrectType(row.value);
      }
      return acc;
    }, {} as Record<string, any>);

    const payload = {
      name,
      description,
      scenario_data: scenarioData,
    };

    try {
      if (scenarioId) {
        console.log('Updating scenario with payload:', payload);
        await updateScenario(scenarioId, payload);
      } else {
        console.log('Creating scenario with payload:', payload);
        const newScenario = await createScenario(payload);
        setScenarioId(newScenario.id);
        router.replace(`/protected-routes/test-scenarios/${newScenario.id}/edit`);
      }
    } catch (error) {
      console.error('Failed to save scenario:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [name, description, rowData, scenarioId, router]);
  
  // Debounced save with longer timeout
  const debouncedSave = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      handleSave();
    }, 1000); // 1 second debounce
  }, [handleSave]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    
    debouncedSave();
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [name, description, rowData, debouncedSave]);
  
  // Column definitions with string handling for display
  const colDefs = useMemo<ColDef<RowData>[]>(() => {
    const ActionCellRenderer = (props: ICellRendererParams<RowData>) => {
      const handleDelete = () => {
        if (props.data) {
          handleDeleteRow(props.data.id);
        }
      };
      return (
        <div className="flex items-center justify-center h-full">
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash className="h-4 w-4 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    };

    return [
      { 
        headerName: 'Key', 
        field: 'key', 
        editable: true, 
        flex: 1,
        sort: 'asc',
        sortIndex: 0,
      },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        flex: 1,
        // Always display as string in the grid
        valueFormatter: (params) => {
          return params.value !== undefined ? params.value : '';
        },
        // Always use string for editing in the grid
        valueSetter: (params) => {
          if (params.colDef.field) {
            params.data[params.colDef.field] = ensureString(params.newValue);
          }
          return true;
        },
        cellEditor: 'agTextCellEditor',
      },
      {
        headerName: 'Action',
        cellRenderer: ActionCellRenderer,
        width: 100,
        editable: false,
        suppressMovable: true,
        resizable: false,
      },
    ];
  }, [handleDeleteRow]);

  const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent<RowData>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const getRowId = useCallback((params: { data: RowData }) => params.data.id, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Scenario Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High-Risk Applicant"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of the test scenario."
          />
        </div>
      </div>

      <div>
        <div className="mb-4 flex gap-2">
          <Button onClick={handleAddRow}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Row
          </Button>
          <Button onClick={handleSave} variant="secondary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Now'}
          </Button>
        </div>
        {saveError && <p className="text-sm text-red-500 mb-2">Could not save changes: {saveError}</p>}
        <div
          className="ag-theme-balham"
          style={{
            height: 'calc(100vh - 400px)',
            width: '100%',
            backgroundColor: 'var(--card-background)',
          }}
        >
          <AgGridReact<RowData>
            rowData={rowData}
            columnDefs={colDefs}
            onFirstDataRendered={onFirstDataRendered}
            onCellValueChanged={onCellValueChanged}
            getRowId={getRowId}
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioEditor;