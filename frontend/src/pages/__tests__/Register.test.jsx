import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import Register from '../Register';
import { AuthProvider } from '../../context/AuthContext';

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegisterForm = () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders registration form', () => {
    renderRegisterForm();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('shows error when fields are empty', async () => {
    renderRegisterForm();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderRegisterForm();
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPassword123!' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    const mockRegisterResponse = {
      data: {
        message: 'User registered successfully',
        user: { username: 'testuser' },
      },
    };

    axios.post.mockResolvedValueOnce(mockRegisterResponse);
    
    renderRegisterForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/register/',
        {
          username: 'testuser',
          email: 'test@test.com',
          password: 'Password123!',
          confirm_password: 'Password123!',
        }
      );
    });
  });

  test('handles registration error', async () => {
    const mockError = {
      response: {
        data: {
          username: ['A user with this username already exists.'],
        },
      },
    };

    axios.post.mockRejectedValueOnce(mockError);
    
    renderRegisterForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123!' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(await screen.findByText(/a user with this username already exists/i)).toBeInTheDocument();
  });
}); 