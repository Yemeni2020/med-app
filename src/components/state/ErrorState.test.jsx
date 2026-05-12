import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from '@/components/state/ErrorState';

describe('ErrorState', () => {
  it('renders the message and action callback', () => {
    const onAction = vi.fn();

    render(
      <ErrorState
        title="Assistant unavailable"
        description="Please retry."
        actionLabel="Retry"
        onAction={onAction}
      />
    );

    expect(screen.getByText('Assistant unavailable')).toBeInTheDocument();
    expect(screen.getByText('Please retry.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
