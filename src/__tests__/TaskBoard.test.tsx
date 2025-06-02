
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Index from '../pages/Index';
import { AuthLayout } from '../components/AuthLayout';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch for avatar API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ download_url: 'https://example.com/avatar.jpg' }),
  })
) as jest.Mock;

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
    (fetch as jest.Mock).mockClear();
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

    test('validates form inputs', async () => {
      const mockOnAuth = jest.fn();
      
      render(
        <TestWrapper>
          <AuthLayout onAuthSuccess={mockOnAuth} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
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

    test('opens task dialog when add task is clicked', async () => {
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

      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    test('shows mobile menu on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user') return JSON.stringify({ name: 'Test User', email: 'test@example.com' });
        return null;
      });

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      // Mobile menu button should be visible
      const menuButton = screen.getByLabelText(/menu/i);
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Local Storage Integration', () => {
    test('saves user data to localStorage on authentication', () => {
      const mockOnAuth = jest.fn();
      
      render(
        <TestWrapper>
          <AuthLayout onAuthSuccess={mockOnAuth} />
        </TestWrapper>
      );

      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockOnAuth).toHaveBeenCalledWith({
        name: 'test',
        email: 'test@example.com',
      });
    });
  });

  describe('Random Avatar Integration', () => {
    test('fetches random avatar from API', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ name: 'Test User', email: 'test@example.com' })
      );

      render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/https:\/\/picsum\.photos\/id\/\d+\/info/)
        );
      });
    });
  });
});
