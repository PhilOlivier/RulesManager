import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import { useAuth } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the LoginForm component
jest.mock('@/components/auth/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form Component</div>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height }: any) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        data-testid="qdex-logo"
      />
    );
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      signInWithEmail: jest.fn(),
      loading: false,
      user: null,
      session: null,
      signOut: jest.fn(),
    });
  });

  it('should render login page with proper structure', () => {
    render(<LoginPage />);
    
    // Check main container structure
    const mainContainer = screen.getByRole('main') || document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should display QDEX logo', () => {
    render(<LoginPage />);
    
    const logo = screen.getByTestId('qdex-logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'QDEX Logo');
    expect(logo).toHaveAttribute('width', '32');
    expect(logo).toHaveAttribute('height', '32');
  });

  it('should display Rules Builder branding', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Rules Builder')).toBeInTheDocument();
  });

  it('should display welcome heading', () => {
    render(<LoginPage />);
    
    const heading = screen.getByRole('heading', { name: /welcome/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'tracking-tight');
  });

  it('should display login instructions', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/enter your email address to log in/i)).toBeInTheDocument();
  });

  it('should render LoginForm component', () => {
    render(<LoginPage />);
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should have proper responsive layout classes', () => {
    const { container } = render(<LoginPage />);
    
    // Check for responsive container classes
    const outerContainer = container.querySelector('.min-h-screen');
    expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center');
    
    const innerContainer = container.querySelector('.w-full.max-w-md');
    expect(innerContainer).toHaveClass('space-y-8', 'p-8');
  });

  it('should have proper text styling and hierarchy', () => {
    render(<LoginPage />);
    
    // Check Rules Builder styling matches navbar
    const rulesBuilderText = screen.getByText('Rules Builder');
    expect(rulesBuilderText).toHaveClass('font-bold', 'text-xl');
    
    // Check welcome heading styling
    const welcomeHeading = screen.getByText('Welcome');
    expect(welcomeHeading).toHaveClass('text-2xl', 'font-bold', 'tracking-tight');
    
    // Check instruction text styling
    const instructions = screen.getByText(/enter your email address to log in/i);
    expect(instructions).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('should have centered branding layout', () => {
    const { container } = render(<LoginPage />);
    
    // Check branding container has proper centering classes
    const brandingContainer = container.querySelector('.flex.items-center.justify-center');
    expect(brandingContainer).toHaveClass('space-x-2', 'mb-6');
  });

  it('should have proper semantic structure', () => {
    render(<LoginPage />);
    
    // The page should have proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Logo should have proper alt text for accessibility
    const logo = screen.getByTestId('qdex-logo');
    expect(logo).toHaveAttribute('alt', 'QDEX Logo');
  });

  it('should maintain consistent spacing', () => {
    const { container } = render(<LoginPage />);
    
    // Check main content area spacing
    const contentArea = container.querySelector('.space-y-8');
    expect(contentArea).toBeInTheDocument();
    
    // Check form area spacing
    const formArea = container.querySelector('.mt-8.space-y-6');
    expect(formArea).toBeInTheDocument();
  });
}); 