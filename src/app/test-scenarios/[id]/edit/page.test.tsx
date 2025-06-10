import React from 'react';
import { render, screen } from '@testing-library/react';
import EditScenarioPage from './page';
import { getScenarioById } from '@/lib/supabase/scenarios';
import { notFound } from 'next/navigation';
import { Scenario } from '@/lib/types/scenario';

// Mock dependencies
jest.mock('@/lib/supabase/scenarios');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('@/components/scenarios/ScenarioEditor', () => {
  // eslint-disable-next-line react/display-name
  return ({ scenario }: { scenario: Scenario }) => (
    <div data-testid="scenario-editor">{scenario.name}</div>
  );
});

const mockGetScenarioById = getScenarioById as jest.Mock;

describe('EditScenarioPage', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  it('renders the editor when a scenario is found', async () => {
    const mockScenario: Scenario = {
      id: '123',
      name: 'Test Scenario',
      description: 'A test',
      scenario_data: { key: 'value' },
      expected_outcomes: { result: 'pass' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'test-user',
    };
    mockGetScenarioById.mockResolvedValue(mockScenario);

    const Page = await EditScenarioPage({ params: { id: '123' } });
    render(Page);

    expect(
      screen.getByRole('heading', { name: /edit scenario/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('scenario-editor')).toHaveTextContent(
      'Test Scenario'
    );
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound when scenario is not found', async () => {
    mockGetScenarioById.mockResolvedValue(null);

    // To test the notFound case, we need to resolve the promise and check the mock
    await EditScenarioPage({ params: { id: '404' } });

    expect(notFound).toHaveBeenCalled();
  });
}); 