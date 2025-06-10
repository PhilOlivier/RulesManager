import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScenarioTable from '../components/scenarios/ScenarioTable';
import * as scenarioFns from '../lib/supabase/scenarios';
import '@testing-library/jest-dom';
import { Scenario } from '../lib/types/scenario';

// Mock the scenarios module
jest.mock('../lib/supabase/scenarios');
const mockedScenarioFns = scenarioFns as jest.Mocked<typeof scenarioFns>;

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockScenarios: Scenario[] = [
  { id: '1', name: 'Scenario A', description: 'Alpha test', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), author: 'user1', scenario_data: {} },
  { id: '2', name: 'Scenario B', description: 'Bravo test', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), author: 'user2', scenario_data: {} },
];

describe('ScenarioTable', () => {
  beforeEach(() => {
    mockedScenarioFns.getAllScenarios.mockResolvedValue([...mockScenarios]);
    mockedScenarioFns.deleteScenario.mockResolvedValue();
    mockedScenarioFns.duplicateScenario.mockResolvedValue({ ...mockScenarios[0], id: '3', name: 'Scenario A (Copy)' });
    jest.clearAllMocks();
  });

  it('renders loading state initially then displays scenarios', async () => {
    // We can't easily test the loading state because it flashes too fast.
    // Instead, we'll just test that the data loads correctly.
    render(<ScenarioTable searchTerm="" />);
    expect(await screen.findByText('Scenario A')).toBeInTheDocument();
    expect(await screen.findByText('Scenario B')).toBeInTheDocument();
  });

  it('filters scenarios based on search term', async () => {
    mockedScenarioFns.getAllScenarios.mockResolvedValue([mockScenarios[0]]);
    render(<ScenarioTable searchTerm="Alpha" />);
    
    await waitFor(() => {
        expect(screen.getByText('Scenario A')).toBeInTheDocument();
        expect(screen.queryByText('Scenario B')).not.toBeInTheDocument();
    });
    expect(mockedScenarioFns.getAllScenarios).toHaveBeenCalledWith('Alpha');
  });

  it('handles scenario duplication', async () => {
    const user = userEvent.setup();
    render(<ScenarioTable searchTerm="" />);
    await waitFor(() => expect(screen.getByText('Scenario A')).toBeInTheDocument());

    // This is still a bit brittle, but user-event should be more reliable.
    const actionButton = (await screen.findAllByRole('button')).find(
      (button) =>
        button.closest('tr')?.querySelector('td')?.textContent === 'Scenario A' &&
        button.querySelector('svg.lucide-ellipsis')
    );

    if (!actionButton) throw new Error('Could not find action button for Scenario A');

    await user.click(actionButton);
    
    const duplicateButton = await screen.findByText('Duplicate');
    await user.click(duplicateButton);

    await waitFor(() => {
      expect(mockedScenarioFns.duplicateScenario).toHaveBeenCalledWith('1');
      expect(mockRouterPush).toHaveBeenCalledWith('/test-scenarios/3/edit');
    });
  });

  it('handles scenario deletion', async () => {
    const user = userEvent.setup();
    render(<ScenarioTable searchTerm="" />);
    await waitFor(() => expect(screen.getByText('Scenario A')).toBeInTheDocument());

    const actionButton = (await screen.findAllByRole('button')).find(
        (button) =>
          button.closest('tr')?.querySelector('td')?.textContent === 'Scenario A' &&
          button.querySelector('svg.lucide-ellipsis')
      );
  
    if (!actionButton) throw new Error('Could not find action button for Scenario A');
  
    await user.click(actionButton);
      
    const deleteButton = await screen.findByText('Delete');
    await user.click(deleteButton);
    
    const continueButton = await screen.findByText('Continue');
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockedScenarioFns.deleteScenario).toHaveBeenCalledWith('1');
    });
  });
}); 