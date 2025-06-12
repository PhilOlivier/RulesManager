import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import ScenarioEditor from '../components/scenarios/ScenarioEditor';
import * as scenarioFns from '../lib/supabase/scenarios';
import '@testing-library/jest-dom';
import { Scenario } from '../lib/types/scenario';

// Mock dependencies
jest.mock('../lib/supabase/scenarios');
const mockedScenarioFns = scenarioFns as jest.Mocked<typeof scenarioFns>;

// Mock Supabase auth - MUST be defined before it is used in the next mock
const mockUser = { id: 'test-user-id', email: 'test@example.com' };
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
  },
}));

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
}));

// Mock UUID to return unique IDs
let uuidCounter = 0;
jest.mock('uuid', () => ({ v4: () => `mock-uuid-${uuidCounter++}` }));

const mockScenario: Scenario = {
  id: '1',
  name: 'Initial Scenario',
  description: 'Initial Description',
  scenario_data: {
    key1: 'value1',
    key2: { nested: true },
  },
  author: 'test-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ScenarioEditor', () => {
    beforeEach(() => {
        uuidCounter = 0;
        mockedScenarioFns.createScenario.mockResolvedValue({ ...mockScenario, id: 'new-id' });
        mockedScenarioFns.updateScenario.mockResolvedValue(mockScenario);
        jest.clearAllMocks();
    });

    it('renders correctly for a new scenario', () => {
        render(<ScenarioEditor />);
        expect(screen.getByLabelText('Scenario Name')).toHaveValue('');
        expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    it('renders correctly when editing an existing scenario', async () => {
        render(<ScenarioEditor scenario={mockScenario} />);
        expect(screen.getByLabelText('Scenario Name')).toHaveValue('Initial Scenario');
        expect(screen.getByLabelText('Description')).toHaveValue('Initial Description');
        await waitFor(() => {
            expect(screen.getByText('key1')).toBeInTheDocument();
            expect(screen.getByText(/"nested":\s*true/)).toBeInTheDocument();
        });
    });

    it('adds a new row when "Add Row" is clicked', async () => {
        const user = userEvent.setup();
        render(<ScenarioEditor />);
        const addRowButton = screen.getByText('Add Row');
        await user.click(addRowButton);
        const rows = await screen.findAllByRole('row');
        // Initial render has 1 data row + header. After click, should have 2 data rows + header.
        expect(rows.length).toBe(3);
    });

    it('updates name and description fields', async () => {
        const user = userEvent.setup();
        render(<ScenarioEditor />);
        const nameInput = screen.getByLabelText('Scenario Name');
        const descriptionInput = screen.getByLabelText('Description');

        await user.type(nameInput, 'New Name');
        await user.type(descriptionInput, 'New Description');

        expect(nameInput).toHaveValue('New Name');
        expect(descriptionInput).toHaveValue('New Description');
    });

    it('calls updateScenario on change with debounce', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<ScenarioEditor scenario={mockScenario} />);
        const nameInput = screen.getByLabelText('Scenario Name');
        
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Name');

        act(() => {
            jest.advanceTimersByTime(800);
        });

        await waitFor(() => {
            expect(mockedScenarioFns.updateScenario).toHaveBeenCalledWith('1', 
                expect.objectContaining({ name: 'Updated Name' })
            );
        });
        jest.useRealTimers();
    });

    it('calls createScenario when editing a new scenario', async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        render(<ScenarioEditor />);
        const nameInput = screen.getByLabelText('Scenario Name');
        await user.type(nameInput, 'A brand new scenario');

        act(() => {
            jest.advanceTimersByTime(800);
        });

        await waitFor(() => {
            expect(mockedScenarioFns.createScenario).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'A brand new scenario', author: mockUser.id })
            );
            expect(mockRouterReplace).toHaveBeenCalledWith('/protected-routes/test-scenarios/new-id/edit');
        });
        jest.useRealTimers();
    });
}); 