import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<Input label="Name" hint="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders as an input element', () => {
    render(<Input label="Test" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input label="Test" error="Required" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red');
  });
});
