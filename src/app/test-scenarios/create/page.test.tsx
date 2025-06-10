import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateScenarioPage from './page';

// Mock the ScenarioEditor component to isolate the page component
jest.mock('@/components/scenarios/ScenarioEditor', () => {
  return function DummyScenarioEditor() {
    return <div data-testid="scenario-editor"></div>;
  };
});

describe('CreateScenarioPage', () => {
  it('renders the page title and the scenario editor', () => {
    render(<CreateScenarioPage />);

    // Check for the title
    expect(
      screen.getByRole('heading', { name: /create new scenario/i })
    ).toBeInTheDocument();

    // Check that the mocked ScenarioEditor is rendered
    expect(screen.getByTestId('scenario-editor')).toBeInTheDocument();
  });
}); 