import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TestScenariosPage from '../app/test-scenarios/page';
import '@testing-library/jest-dom';

// Mock the ScenarioTable component
jest.mock('@/components/scenarios/ScenarioTable', () => {
  return function DummyScenarioTable({ searchTerm }: { searchTerm: string }) {
    return <div data-testid="scenario-table">{searchTerm}</div>;
  };
});

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode, href: string }) => {
        return <a href={href}>{children}</a>;
    }
});


describe('TestScenariosPage', () => {
  it('renders the page title', () => {
    render(<TestScenariosPage />);
    expect(screen.getByText('Test Scenarios')).toBeInTheDocument();
  });

  it('renders the create new scenario button', () => {
    render(<TestScenariosPage />);
    expect(screen.getByText('Create New Scenario')).toBeInTheDocument();
  });

  it('updates the search term when typing in the search input', () => {
    render(<TestScenariosPage />);
    const searchInput = screen.getByPlaceholderText('Search scenarios...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('passes the search term to the ScenarioTable component', () => {
    render(<TestScenariosPage />);
    const searchInput = screen.getByPlaceholderText('Search scenarios...');
    fireEvent.change(searchInput, { target: { value: 'filter-me' } });

    const table = screen.getByTestId('scenario-table');
    expect(table).toHaveTextContent('filter-me');
  });
}); 