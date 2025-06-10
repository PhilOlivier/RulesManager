import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('renders the brand and navigation links on larger screens', () => {
    render(<Navigation />);

    const header = screen.getByRole('banner'); // The <header> element
    expect(within(header).getByText(/rules builder/i)).toBeInTheDocument();

    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: /test scenarios/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /lender settings/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /rules/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /results/i })).toBeInTheDocument();
  });

  it('renders the mobile menu button on smaller screens', () => {
    render(<Navigation />);
    const mobileMenuButton = screen.getByRole('button', {
      name: /toggle menu/i,
    });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('shows the correct active link styling for "Test Scenarios"', () => {
    render(<Navigation />);
    // We target the link within the main navigation for this test
    const nav = screen.getByRole('navigation');
    const testScenariosLink = within(nav).getByRole('link', {
      name: /test scenarios/i,
    });
    const lenderSettingsLink = within(nav).getByRole('link', {
      name: /lender settings/i,
    });

    expect(testScenariosLink).toHaveClass(
      'font-semibold text-foreground transition-colors hover:text-foreground/80'
    );
    expect(lenderSettingsLink).toHaveClass(
      'text-foreground/60 transition-colors hover:text-foreground/80'
    );
  });
}); 