'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JournalQueryPage() {
  const [jobUuid, setJobUuid] = useState('');
  const [viewType, setViewType] = useState('results');

  const handleRetrieve = () => {
    if (jobUuid) {
      const url = `/protected-routes/journal-query/${jobUuid}?view=${viewType}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex justify-center items-center h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Journal Query</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-uuid">Job UUID</Label>
              <Input
                id="job-uuid"
                placeholder="Enter Job UUID"
                value={jobUuid}
                onChange={(e) => setJobUuid(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>View Type</Label>
              <RadioGroup
                defaultValue="results"
                className="mt-2"
                value={viewType}
                onValueChange={setViewType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="results" id="results" />
                  <Label htmlFor="results">View Results</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rules" id="rules" />
                  <Label htmlFor="rules">View Rules</Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              onClick={handleRetrieve}
              className="w-full"
              disabled={!jobUuid.trim()}
            >
              Retrieve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 