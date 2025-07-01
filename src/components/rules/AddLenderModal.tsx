'use client';

import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lender } from '@/lib/types/rules';

interface AddLenderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingLenders: Lender[];
  onAddLender?: (lenderName: string) => void;
}

const AddLenderModal: React.FC<AddLenderModalProps> = ({
  isOpen,
  onOpenChange,
  existingLenders,
  onAddLender,
}) => {
  const [lenderName, setLenderName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate lender name format (dot notation)
  const validateLenderName = useCallback((name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Lender name is required';
    }

    // Check for valid dot notation format
    if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(trimmedName)) {
      return 'Lender name must follow dot notation format (e.g., "root", "root.resi", "root.resi.mass")';
    }

    // Check if lender already exists
    const existingLenderNames = existingLenders.map(l => l.name.toLowerCase());
    if (existingLenderNames.includes(trimmedName.toLowerCase())) {
      return 'A lender with this name already exists';
    }

    // If name contains dots, validate that parent lenders exist
    if (trimmedName.includes('.')) {
      const parts = trimmedName.split('.');
      for (let i = 1; i < parts.length; i++) {
        const parentName = parts.slice(0, i).join('.');
        if (!existingLenderNames.includes(parentName.toLowerCase())) {
          return `Parent lender "${parentName}" does not exist. Please create parent lenders first.`;
        }
      }
    }

    return null;
  }, [existingLenders]);

  // Handle input change with real-time validation
  const handleNameChange = useCallback((value: string) => {
    setLenderName(value);
    const validationError = validateLenderName(value);
    setError(validationError || '');
  }, [validateLenderName]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const validationError = validateLenderName(lenderName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onAddLender) {
        await onAddLender(lenderName.trim());
      }
      
      // Reset form and close modal on success
      setLenderName('');
      setError('');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to add lender:', err);
      setError('Failed to add lender. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [lenderName, validateLenderName, onAddLender, onOpenChange]);

  // Handle modal close/cancel
  const handleCancel = useCallback(() => {
    setLenderName('');
    setError('');
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle Enter key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && lenderName.trim() && !isSubmitting) {
      handleSubmit();
    }
  }, [error, lenderName, isSubmitting, handleSubmit]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Lender</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a lender name using dot notation. Parent lenders must exist before adding child lenders.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lender-name" className="text-sm font-medium">
              Lender Name
            </Label>
            <Input
              id="lender-name"
              placeholder="e.g., root, root.resi, root.resi.mass"
              value={lenderName}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Examples section */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Examples:</p>
            <ul className="text-xs space-y-1">
              <li>• <code>root</code> - Top-level lender</li>
              <li>• <code>root.resi</code> - Residential sub-lender</li>
              <li>• <code>root.resi.mass</code> - Massachusetts residential</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit} 
            disabled={!!error || !lenderName.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Lender'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddLenderModal; 