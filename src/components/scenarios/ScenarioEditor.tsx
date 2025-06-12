'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ICellRendererParams,
  GridReadyEvent,
  GridApi,
  CellValueChangedEvent,
  ModuleRegistry,
  AllCommunityModule,
  FirstDataRenderedEvent,
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

interface RowData {
  id: string; // Client-side unique ID
  key: string;
  value: any;
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
  const [rowData, setRowData] = useState<RowData[]>(
    initialScenario?.scenario_data
      ? Object.entries(initialScenario.scenario_data).map(([key, value]) => ({
          id: uuidv4(),
          key,
          value:
            typeof value === 'object' && value !== null
              ? JSON.stringify(value, null, 2)
              : value,
        }))
      : [{ id: uuidv4(), key: '', value: '' }]
  );
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRun = useRef(true);

  const handleAddRow = useCallback(() => {
    setRowData((prev) => [...prev, { id: uuidv4(), key: '', value: '' }]);
  }, []);

  const handleDeleteRow = useCallback((idToDelete: string) => {
    setRowData((prev) => prev.filter((row) => row.id !== idToDelete));
  }, []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<RowData>) => {
    const { data } = event;
    setRowData((prev) => [...prev.map((row) => (row.id === data.id ? data : row))]);
  }, []);
  
  const handleSave = useCallback(() => {
    const currentName = name;
    if (!currentName) {
      return;
    }

    const scenarioData = rowData.reduce((acc, row) => {
      if (row.key) {
        let parsedValue = row.value;
        if (typeof parsedValue === 'string') {
          try {
            parsedValue = JSON.parse(parsedValue);
          } catch (e) {
            // Not a valid JSON string, so we keep it as a string
          }
        }
        acc[row.key] = parsedValue;
      }
      return acc;
    }, {} as Record<string, any>);

    if (scenarioId) {
      const payload = {
        name: currentName,
        description,
        scenario_data: scenarioData,
      };
      updateScenario(scenarioId, payload);
    } else {
      const payload = {
        name: currentName,
        description,
        scenario_data: scenarioData,
      };
      createScenario(payload).then((newScenario) => {
        setScenarioId(newScenario.id);
        router.replace(`/test-scenarios/${newScenario.id}/edit`);
      }).catch(error => {
        // Make the error visible to the user
        console.error("Failed to create scenario:", error);
        alert(`Failed to create scenario: ${error.message}`);
      });
    }
  }, [name, description, rowData, scenarioId, router]);
  
  const debouncedSave = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSave();
    }, 750);
  }, [handleSave]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    debouncedSave();
  }, [name, description, rowData, debouncedSave]);
  
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
      { headerName: 'Key', field: 'key', editable: true, flex: 1 },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        flex: 1,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
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
        <div className="mb-4">
          <Button onClick={handleAddRow}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Row
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