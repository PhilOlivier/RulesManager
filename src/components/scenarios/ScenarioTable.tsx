'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Copy, Pencil, PlayCircle } from 'lucide-react';
import { Scenario } from '@/lib/types/scenario';
import {
  getAllScenarios,
  deleteScenario,
  duplicateScenario,
} from '@/lib/supabase/scenarios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 10;

interface ScenarioTableProps {
  searchTerm: string;
}

const ScenarioTable = ({ searchTerm }: ScenarioTableProps) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [scenarioToDelete, setScenarioToDelete] = useState<Scenario | null>(null);
  const router = useRouter();

  const fetchScenarios = async (currentSearchTerm: string) => {
    try {
      setLoading(true);
      const data = await getAllScenarios(currentSearchTerm);
      setScenarios(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios(searchTerm);
  }, [searchTerm]);

  const handleDuplicate = async (id: string) => {
    startTransition(async () => {
      const newScenario = await duplicateScenario(id);
      router.push(`/protected-routes/test-scenarios/${newScenario.id}/edit`);
    });
  };

  const handleDelete = async () => {
    if (!scenarioToDelete) return;
    startTransition(async () => {
      await deleteScenario(scenarioToDelete.id);
      setScenarioToDelete(null);
      await fetchScenarios(searchTerm);
    });
  };

  const totalPages = Math.ceil(scenarios.length / PAGE_SIZE);
  const paginatedScenarios = scenarios.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    // Reset to the first page whenever the search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return <div>Loading scenarios...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedScenarios.map((scenario) => (
            <TableRow key={scenario.id}>
              <TableCell className="font-medium">{scenario.name}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="block max-w-xs truncate">
                        {scenario.description || '-'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md whitespace-normal">
                      <p>{scenario.description || 'No description'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                {new Date(scenario.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(scenario.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/protected-routes/scenarios/${scenario.id}/run`)
                      }
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Run
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/protected-routes/test-scenarios/${scenario.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(scenario.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setScenarioToDelete(scenario)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog
        open={!!scenarioToDelete}
        onOpenChange={(open) => !open && setScenarioToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              scenario "{scenarioToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ScenarioTable; 