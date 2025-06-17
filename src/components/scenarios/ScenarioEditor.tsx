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

// Strictly typed interface - value is ALWAYS string
interface RowData {
  id: string;
  key: string;
  value: string;
}

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
  
  // Helper function to ensure value is always a string
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
    
    // Always ensure the value is a string, no matter what
    if (event.colDef.field === 'value') {
      event.data.value = ensureString(event.data.value);
    }
    
    setRowData((prev) => 
      prev.map((row) => (row.id === event.data.id ? event.data : row))
    );
  }, []);
  
  // Simple save function - everything is stored as strings
  const handleSave = useCallback(() => {
    if (!name) {
      console.log('Name is required');
      return;
    }

    // Create a clean object with string values
    const scenarioData = rowData.reduce((acc, row) => {
      if (row.key) {
        // Always use the string value directly
        acc[row.key] = row.value;
      }
      return acc;
    }, {} as Record<string, string>);

    if (scenarioId) {
      const payload = {
        name,
        description,
        scenario_data: scenarioData,
      };
      console.log('Saving with payload:', payload);
      updateScenario(scenarioId, payload);
    } else {
      const payload = {
        name,
        description,
        scenario_data: scenarioData,
      };
      createScenario(payload)
        .then((newScenario) => {
          setScenarioId(newScenario.id);
          router.replace(`/protected-routes/test-scenarios/${newScenario.id}/edit`);
        })
        .catch(error => {
          console.error("Failed to create scenario:", error);
          alert(`Failed to create scenario: ${error.message}`);
        });
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
  
  // Simplified column definitions with strict string handling
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
      },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        flex: 1,
        // ALWAYS force string type for display
        valueFormatter: (params) => {
          return params.value !== undefined ? params.value : '';
        },
        // ALWAYS force string type when setting value
        valueSetter: (params) => {
          params.data[params.colDef.field] = ensureString(params.newValue);
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
          <Button onClick={handleSave} variant="secondary">
            Save Now
          </Button>
        </div>
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