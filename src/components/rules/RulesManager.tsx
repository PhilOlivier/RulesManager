'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import RulesManagerGrid from '@/components/rules/RulesManagerGrid';
import MetadataPanel from '@/components/rules/MetadataPanel';
import AddLenderModal from '@/components/rules/AddLenderModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelect } from '@/components/ui/multi-select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  getRules,
  getLenderValues,
  transformDataForGrid,
  getLenders,
  upsertLenderValue,
  deleteLenderValue,
  addLender,
  removeLender,
  getRuleCategories,
} from '@/lib/services/rulesManager';
import { RuleGridRow, Lender, RuleType, RuleCategory } from '@/lib/types/rules';
import { CellValueChangedEvent, GridApi, GridReadyEvent, ModelUpdatedEvent, IRowNode } from 'ag-grid-community';
import { createQueryPredicate } from '@/lib/utils/filterParser';

type TypeFilter = 'All' | 'Rule' | 'Constant';

const RulesManager = () => {
  const [rowData, setRowData] = useState<RuleGridRow[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('Constant');
  const [activePredicate, setActivePredicate] = useState<
    ((key: string) => boolean) | null
  >(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);
  
  // Expanded filters state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Metadata panel state
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RuleGridRow | null>(null);

  // Add Lender modal state
  const [isAddLenderModalOpen, setIsAddLenderModalOpen] = useState(false);

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
    setTypeFilter('Constant');
    setActivePredicate(null);
    // Reset categories to all selected (default state)
    setSelectedCategories(categories.map(cat => cat.category));
  }, [categories]);

  // Handle opening metadata panel
  const handleOpenMetadata = useCallback((rule: RuleGridRow) => {
    setSelectedRule(rule);
    setIsMetadataPanelOpen(true);
  }, []);

  // Handle closing metadata panel
  const handleCloseMetadata = useCallback((open: boolean) => {
    setIsMetadataPanelOpen(open);
    if (!open) {
      setSelectedRule(null);
    }
  }, []);

  // Handle rule metadata updates
  const handleRuleUpdate = useCallback((updatedRule: RuleGridRow) => {
    setRowData(prevData =>
      prevData.map(row =>
        row.id === updatedRule.id ? updatedRule : row
      )
    );
    // Also update the selectedRule if it's the same rule
    if (selectedRule && selectedRule.id === updatedRule.id) {
      setSelectedRule(updatedRule);
    }
  }, [selectedRule]);

  // Handle adding new lender
  const handleAddLender = useCallback(async (lenderName: string) => {
    try {
      console.log('Adding new lender:', lenderName);
      
      // Add lender to database
      const newLender = await addLender(lenderName);
      
      // Update local lenders state to reflect the new lender column
      setLenders(prevLenders => [...prevLenders, newLender]);
      
      console.log('Successfully added lender:', newLender);
    } catch (error) {
      console.error('Failed to add lender:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  }, []);

  // Handle removing lender with confirmation
  const handleRemoveLender = useCallback(async (lenderName: string) => {
    try {
      console.log('Removing lender:', lenderName);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to remove the "${lenderName}" lender column?\n\n` +
        `This will permanently delete all values for this lender and cannot be undone.`
      );
      
      if (!confirmed) {
        console.log('Lender removal cancelled by user');
        return;
      }
      
      // Remove lender from database (this also removes all lender values)
      await removeLender(lenderName);
      
      // Update local lenders state to remove the column from grid
      setLenders(prevLenders => prevLenders.filter(l => l.name !== lenderName));
      
      // Update rowData to remove the lender values from the grid data
      setRowData(prevData => 
        prevData.map(row => {
          const { [lenderName]: removed, ...rest } = row;
          return rest as RuleGridRow;
        })
      );
      
      console.log('Successfully removed lender:', lenderName);
    } catch (error) {
      console.error('Failed to remove lender:', error);
      
      // Show error message to user
      alert(`Failed to remove lender "${lenderName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Effect to apply the filter when the predicate, type filter, or category filter changes
  useEffect(() => {
    gridApi?.onFilterChanged();
  }, [activePredicate, typeFilter, selectedCategories, gridApi]);

  const isExternalFilterPresent = useCallback((): boolean => {
    return activePredicate != null || typeFilter !== 'All' || 
           (selectedCategories.length > 0 && selectedCategories.length < categories.length);
  }, [activePredicate, typeFilter, selectedCategories, categories]);

  const doesExternalFilterPass = useCallback(
    (node: IRowNode<RuleGridRow>): boolean => {
      if (!node.data) return true;

      // Apply text filter
      const passesTextFilter = !activePredicate || activePredicate(node.data.key);
      
      // Apply type filter - handle case mismatch between DB values (lowercase) and filter values (capitalized)
      let passesTypeFilter = true;
      if (typeFilter !== 'All') {
        const dbType = node.data.type?.toLowerCase();
        const filterType = typeFilter.toLowerCase();
        passesTypeFilter = dbType === filterType;
      }

      // Apply category filter
      let passesCategoryFilter = true;
      if (selectedCategories.length > 0 && selectedCategories.length < categories.length) {
        // If no categories selected, show none
        if (selectedCategories.length === 0) {
          passesCategoryFilter = false;
        } else {
          // Check if the rule's category is in the selected categories
          const ruleCategory = node.data.category;
          passesCategoryFilter = ruleCategory ? selectedCategories.includes(ruleCategory) : false;
        }
      }

      return passesTextFilter && passesTypeFilter && passesCategoryFilter;
    },
    [activePredicate, typeFilter, selectedCategories, categories],
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
      },
      400);
    },
    [setRowData],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rules, lenderValues, lendersData, categoriesData] = await Promise.all([
          getRules(),
          getLenderValues(),
          getLenders(),
          getRuleCategories(),
        ]);
        const gridData = transformDataForGrid(rules, lenderValues);
        setRowData(gridData);
        setLenders(lendersData);
        setCategories(categoriesData);
        // Default to all categories selected
        setSelectedCategories(categoriesData.map(cat => cat.category));
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
      <div className="border rounded-md">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
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
          
          {/* More Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="flex items-center space-x-1"
          >
            <span className="text-sm">More Filters</span>
            {isFiltersExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Filters Section */}
        {isFiltersExpanded && (
          <div className="border-t px-4 py-3 bg-muted/30">
            <div className="flex items-center space-x-8">
              {/* Categories Filter */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Categories:</Label>
                <MultiSelect
                  options={categories.map(cat => ({ 
                    label: cat.category, 
                    value: cat.category 
                  }))}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select categories..."
                  className="w-80"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Type:</Label>
                <RadioGroup
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as TypeFilter)}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Constant" id="constants" />
                    <Label htmlFor="constants" className="text-sm">Constants</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Rule" id="rules" />
                    <Label htmlFor="rules" className="text-sm">Rules</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="All" id="all" />
                    <Label htmlFor="all" className="text-sm">All</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lender Management Controls */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {displayedRowCount} of {rowData.length} rows
        </p>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsAddLenderModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Add Lender
          </Button>
        </div>
      </div>

      <div className="flex-grow">
        <RulesManagerGrid
          rowData={rowData}
          lenders={lenders}
          onCellValueChanged={handleCellValueChange}
          onGridReady={onGridReady}
          onModelUpdated={onModelUpdated}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          onOpenMetadata={handleOpenMetadata}
          onRemoveLender={handleRemoveLender}
        />
      </div>

      {/* Metadata Panel */}
      <MetadataPanel
        isOpen={isMetadataPanelOpen}
        onOpenChange={handleCloseMetadata}
        selectedRule={selectedRule}
        onRuleUpdate={handleRuleUpdate}
      />

      {/* Add Lender Modal */}
      <AddLenderModal
        isOpen={isAddLenderModalOpen}
        onOpenChange={setIsAddLenderModalOpen}
        existingLenders={lenders}
        onAddLender={handleAddLender}
      />
    </div>
  );
};

export default RulesManager;