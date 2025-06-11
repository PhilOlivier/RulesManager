import React, { useContext } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  EnvironmentProvider,
  EnvironmentContext,
  ApiEnvironment,
  EnvironmentContextType,
} from './EnvironmentContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key:string]: string } = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const TestConsumerComponent = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error(
      'TestConsumerComponent must be used within an EnvironmentProvider',
    );
  }
  const { environment, setEnvironment } = context;

  const toggle = () => {
    setEnvironment(environment === 'MVP' ? 'UAT' : 'MVP');
  };

  return (
    <div>
      <span data-testid="environment">{environment}</span>
      <button onClick={toggle}>Toggle</button>
    </div>
  );
};

describe('EnvironmentContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should default to MVP environment', () => {
    render(
      <EnvironmentProvider>
        <TestConsumerComponent />
      </EnvironmentProvider>,
    );
    expect(screen.getByTestId('environment')).toHaveTextContent('MVP');
  });

  it('should toggle environment from MVP to UAT and back', () => {
    render(
      <EnvironmentProvider>
        <TestConsumerComponent />
      </EnvironmentProvider>,
    );

    const toggleButton = screen.getByText('Toggle');

    expect(screen.getByTestId('environment')).toHaveTextContent('MVP');

    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(screen.getByTestId('environment')).toHaveTextContent('UAT');

    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(screen.getByTestId('environment')).toHaveTextContent('MVP');
  });

  it('should save the environment to localStorage on change', () => {
    render(
      <EnvironmentProvider>
        <TestConsumerComponent />
      </EnvironmentProvider>,
    );

    const toggleButton = screen.getByText('Toggle');

    expect(localStorage.getItem('apiEnvironment')).toBe('MVP');

    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(localStorage.getItem('apiEnvironment')).toBe('UAT');
  });

  it('should initialize with the environment from localStorage if present', () => {
    localStorage.setItem('apiEnvironment', 'UAT');

    render(
      <EnvironmentProvider>
        <TestConsumerComponent />
      </EnvironmentProvider>,
    );

    expect(screen.getByTestId('environment')).toHaveTextContent('UAT');
  });

  it('should handle invalid values in localStorage by defaulting to MVP', () => {
    localStorage.setItem('apiEnvironment', 'INVALID_ENV');

    render(
      <EnvironmentProvider>
        <TestConsumerComponent />
      </EnvironmentProvider>,
    );

    expect(screen.getByTestId('environment')).toHaveTextContent('MVP');
  });
}); 