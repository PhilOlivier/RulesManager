'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import RulesManagerGrid from '@/components/rules/RulesManagerGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getRules,
  getLenderValues,
  transformDataForGrid,
  getLenders,
  upsertLenderValue,
  deleteLenderValue,
} from '@/lib/services/rulesManager';
import { RuleGridRow, Lender } from '@/lib/types/rules';
import { CellValueChangedEvent, GridApi, GridReadyEvent, ModelUpdatedEvent, IRowNode } from 'ag-grid-community';
import { createQueryPredicate } from '@/lib/utils/filterParser';

const RulesManager = () => {
  const [rowData, setRowData] = useState<RuleGridRow[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [activePredicate, setActivePredicate] = useState<
    ((key: string) => boolean) | null
  >(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
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
    (node: IRowNode<RuleGridRow>): boolean => {
      if (node.data && activePredicate) {
        return activePredicate(node.data.key);
      }
      return true;
    },
    [activePredicate],
  );

  const handleCellValueChange = useCallback(
    (event: CellValueChangedEvent) => {
      console.log('Cell value change detected', {
        data: event.data,
        column: event.column.getColId(),
        newValue: event.newValue,
        oldValue: event.oldValue
      });
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        const { data, colDef, newValue, oldValue } = event;
        const ruleId = data.id;
        const field = colDef.field!;

        console.log('--- Cell Value Change Event ---');
        console.log('Event:', event);
        console.log(`Rule ID: ${ruleId}, Field: ${field}`);
        console.log(`Old Value: ${oldValue}, New Value: ${newValue}`);

        // If newValue is undefined (e.g., user hits enter without changing), do nothing.
        if (newValue === undefined) {
          console.log('New value is undefined, exiting.');
          return;
        }

        let parsedValue: string | number | boolean | null = newValue;

        // Parse the value from the grid.
        if (typeof newValue === 'string') {
          const trimmedValue = newValue.trim();
          if (trimmedValue.toLowerCase() === 'true') {
            parsedValue = true;
          } else if (trimmedValue.toLowerCase() === 'false') {
            parsedValue = false;
          } else if (trimmedValue === '') {
            parsedValue = null;
          } else if (trimmedValue !== '' && !isNaN(Number(trimmedValue))) {
            parsedValue = Number(trimmedValue);
          } else {
            parsedValue = trimmedValue;
          }
        }
        
        console.log('Parsed Value:', parsedValue);

        try {
          if (parsedValue === null) {
            console.log(`Attempting to delete value for Rule ID: ${ruleId}, Lender: ${field}`);
            const deleteResult = await deleteLenderValue(String(ruleId), field);
            console.log('Delete operation successful:', deleteResult);
          } else {
            const payload = {
              rule_id: ruleId,
              lender: field,
              value: parsedValue,
            };
            console.log('Attempting to upsert value:', payload);
            const upsertResult = await upsertLenderValue(payload);
            console.log('Upsert operation successful:', upsertResult);
          }
          // The ONLY source of truth is our React state.
          // After a successful DB save, we update our local state
          // and let React re-render the grid.
          console.log('Updating React state...');
          setRowData(prevData => {
            console.log('setRowData callback executing.');
            return prevData.map(row =>
              row.id === ruleId ? { ...row, [field]: parsedValue } : row,
            );
          });
          console.log('React state update queued.');
        } catch (err) {
          console.error('Failed to save value:', err);
          // On error, revert the change in the UI by re-setting the rowData for that cell
          console.log('Reverting cell value due to error.');
          setRowData(prevData =>
            prevData.map(row =>
              row.id === ruleId ? { ...row, [field]: oldValue } : row,
            ),
          );
          // TODO: show a toast notification to the user
        }
      }, 400);
    },
    [setRowData],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rules, lenderValues, lendersData] = await Promise.all([
          getRules(),
          getLenderValues(),
          getLenders(),
        ]);
        const gridData = transformDataForGrid(rules, lenderValues);
        setRowData(gridData);
        setLenders(lendersData);
      } catch (err) {
        setError('Failed to fetch rules data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading rules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">Rules Manager</h1>
      
      {/* Filter Controls */}
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
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {displayedRowCount} of {rowData.length} rows
      </p>

      <div className="flex-grow">
        <RulesManagerGrid
          rowData={rowData}
          lenders={lenders}
          onCellValueChanged={handleCellValueChange}
          onGridReady={onGridReady}
          onModelUpdated={onModelUpdated}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
        />
      </div>
    </div>
  );
};

export default RulesManager;