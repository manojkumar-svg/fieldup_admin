import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

describe('Badge Component', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge.className).toContain('green');
  });

  it('applies error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('red');
  });
});

describe('StatusBadge Component', () => {
  it('renders ACTIVE status', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders INACTIVE status', () => {
    render(<StatusBadge status="INACTIVE" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('EmptyState Component', () => {
  it('renders title and message', () => {
    render(<EmptyState title="No data" message="Nothing to show here" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No courts"
        message="Add your first court"
        actionLabel="Add Court"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('Add Court')).toBeInTheDocument();
  });

  it('does not show action button when not provided', () => {
    render(<EmptyState title="Empty" message="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ErrorState Component', () => {
  it('renders error heading', () => {
    render(<ErrorState onRetry={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(<ErrorState onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
