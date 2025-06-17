// This file will contain the custom hook for fetching and transforming journal data. 

import { useState, useEffect } from 'react';
import { ColDef } from 'ag-grid-community';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { getJournalByJobId, JournalEntry } from '@/lib/api/journal';

type ViewType = 'rules' | 'results';

interface UseJournalDataProps {
  jobUuid: string | null;
  viewType: ViewType;
}

export const useJournalData = ({ jobUuid, viewType }: UseJournalDataProps) => {
  const { environment } = useEnvironment();
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobUuid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getJournalByJobId(
          jobUuid,
          environment
        );
        
        // 1. Create separate buckets for rules and results.
        const allRules: Record<string, Record<string, any>> = {};
        const allResults: Record<string, Record<string, any>> = {};
        let currentBankCode: string | null = null;

        for (const entry of data) {
          // Determine the current lender context.
          if (entry.dictionary.hasOwnProperty('QDEXBankCode') && entry.dictionary.QDEXBankCode) {
            currentBankCode = entry.dictionary.QDEXBankCode;
          }
          if (!currentBankCode) continue;

          // Choose the correct bucket based on the comment.
          const targetBucket = entry.comment === 'Unresolved' ? allRules : allResults;

          // Ensure the lender group is initialized in the target bucket.
          if (!targetBucket[currentBankCode]) {
            targetBucket[currentBankCode] = {};
          }

          // Assign values from this entry to the correct lender in the correct bucket.
          for (const key in entry.dictionary) {
            if (key !== 'QDEXBankCode') {
              targetBucket[currentBankCode][key] = entry.dictionary[key];
            }
          }
        }
        
        // 2. Select the correct data group to pivot based on the viewType.
        const bankCodeGroups = viewType === 'rules' ? allRules : allResults;

        // 3. Collect all unique keys and bank codes from the selected group.
        const allKeys = new Set<string>();
        Object.values(bankCodeGroups).forEach(group => {
          Object.keys(group).forEach(key => allKeys.add(key));
        });
        const bankCodes = Object.keys(bankCodeGroups);

        // 4. Pivot the data to create rows.
        const newRowData = Array.from(allKeys).map(key => {
          const row: any = { key };
          for (const code of bankCodes) {
            row[code] = bankCodeGroups[code][key] ?? '';
          }
          return row;
        });

        // 5. Generate column definitions
        const newColumnDefs: ColDef[] = [
          { field: 'key', headerName: 'Key', pinned: 'left', filter: true },
          ...bankCodes.map(code => {
            const colDef: ColDef = {
              field: code,
              headerName: code,
              filter: true,
              tooltipField: code, // Show full content on hover
            };

            if (viewType === 'rules') {
              colDef.cellStyle = { 
                'text-overflow': 'ellipsis',
                'overflow': 'hidden',
                'white-space': 'nowrap'
              };
            }

            return colDef;
          }),
        ];

        setRowData(newRowData);
        setColumnDefs(newColumnDefs);
        
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobUuid, viewType, environment]);

  return { rowData, columnDefs, loading, error };
}; 