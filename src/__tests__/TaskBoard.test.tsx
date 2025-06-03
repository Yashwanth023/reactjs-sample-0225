
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Index from '../pages/Index';
import { AuthLayout } from '../components/AuthLayout';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch for avatar API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ download_url: 'https://example.com/avatar.jpg' }),
  })
) as jest.MockedFunction<typeof fetch>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TaskBoard Application', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('Authentication', () => {
    test('renders login form when not authenticated', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    test('shows signup form when toggled', () => {
      const mockOnAuth = jest.fn();
      
      render(
        <TestWrapper>
          <AuthLayout onAuthSuccess={mockOnAuth} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    });
  });

  describe('Task Management', () => {
    test('renders task board when authenticated', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify({ name: 'Test User', email: 'test@example.com' });
        if (key === 'task-board-columns') return JSON.stringify([]);
        return null;
      });

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      expect(screen.getByText('TaskBoard')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('User Profile', () => {
    test('renders user profile dropdown', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify({ name: 'Test User', email: 'test@example.com' });
        return null;
      });

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      // Profile button should be visible
      const profileButton = screen.getByRole('button');
      expect(profileButton).toBeInTheDocument();
    });
  });
});
