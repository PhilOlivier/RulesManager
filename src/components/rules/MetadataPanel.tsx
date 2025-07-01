'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RuleGridRow, RuleType } from '@/lib/types/rules';
import { upsertRule } from '@/lib/services/rulesManager';

interface MetadataPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRule: RuleGridRow | null;
  onRuleUpdate?: (updatedRule: RuleGridRow) => void;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  isOpen,
  onOpenChange,
  selectedRule,
  onRuleUpdate,
}) => {
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [type, setType] = useState<RuleType>('Rule');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when selectedRule changes
  useEffect(() => {
    if (selectedRule) {
      setDescription(selectedRule.description || '');
      setCategory(selectedRule.category || '');
      // Handle case conversion from DB (lowercase) to UI (capitalized)
      const dbType = selectedRule.type?.toLowerCase();
      setType(dbType === 'rule' ? 'Rule' : 'Constant');
    }
  }, [selectedRule]);

  // Generic auto-save function
  const autoSaveRule = useCallback(async (updates: Partial<RuleGridRow>) => {
    if (!selectedRule) return;

    setIsSaving(true);
    try {
      const updatedRule = {
        id: selectedRule.id,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      console.log('Auto-saving rule updates:', updatedRule);
      await upsertRule(updatedRule);
      
      // Update the parent component's state if callback provided
      if (onRuleUpdate) {
        const updatedRuleForCallback: RuleGridRow = { ...selectedRule, ...updates } as RuleGridRow;
        onRuleUpdate(updatedRuleForCallback);
      }
      
      console.log('Auto-save successful for rule:', selectedRule.id);
    } catch (error) {
      console.error('Auto-save failed for rule:', selectedRule.id, error);
      // TODO: Show toast notification for error
    } finally {
      setIsSaving(false);
    }
  }, [selectedRule, onRuleUpdate]);

  // Handle description change with debounced auto-save
  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for auto-save (400ms debounce)
    debounceTimeoutRef.current = setTimeout(() => {
      autoSaveRule({ description: value || null });
    }, 400);
  }, [autoSaveRule]);

  // Handle category change with debounced auto-save
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for auto-save (400ms debounce)
    debounceTimeoutRef.current = setTimeout(() => {
      autoSaveRule({ category: value || null });
    }, 400);
  }, [autoSaveRule]);

  // Handle type change with debounced auto-save
  const handleTypeChange = useCallback((value: RuleType) => {
    setType(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for auto-save (400ms debounce)
    debounceTimeoutRef.current = setTimeout(() => {
      // Save the RuleType value directly - the upsertRule function will handle DB conversion
      autoSaveRule({ type: value });
    }, 400);
  }, [autoSaveRule]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedRule) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Rule Metadata</SheetTitle>
          <SheetDescription>
            Edit the metadata for this rule or constant.
            {isSaving && (
              <span className="text-blue-600 ml-2">Saving...</span>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col space-y-6 py-4 px-4">
          {/* Key Display (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Key</Label>
            <div className="p-2 bg-muted rounded border text-sm font-mono">
              {selectedRule.key}
            </div>
          </div>

          {/* Description Textarea (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this rule or constant..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSaving}
            />
          </div>

          {/* Category Input (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Input
              id="category"
              placeholder="Enter a category (e.g., Lending, Validation, etc.)"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {/* Type Selector (Rule/Constant) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => handleTypeChange(value as RuleType)}
              className="flex flex-row space-x-6"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Rule" id="type-rule" disabled={isSaving} />
                <Label htmlFor="type-rule" className="text-sm">Rule</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Constant" id="type-constant" disabled={isSaving} />
                <Label htmlFor="type-constant" className="text-sm">Constant</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Save status indicator */}
          <div className="text-sm text-muted-foreground">
            Changes are automatically saved after a brief delay.
            {isSaving && <span className="text-blue-600"> Saving...</span>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MetadataPanel; 