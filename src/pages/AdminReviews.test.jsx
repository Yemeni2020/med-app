import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/lib/LanguageContext';
import AdminReviews from '@/pages/AdminReviews';

const mockUseAuth = vi.fn();

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/seo/PageSeo', () => ({
  default: () => null,
}));

vi.mock('@/lib/med-api', () => ({
  listReviewModerationQueue: vi.fn().mockResolvedValue([
    {
      id: '1',
      rating: 5,
      comment: 'Needs approval',
      status: 'pending',
      created_date: '2026-05-12T12:00:00Z',
      user: { name: 'Nora' },
      reviewable: { type: 'article', id: '4' },
    },
  ]),
  moderateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

describe('AdminReviews', () => {
  it('shows moderation buttons for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
    const client = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <LanguageProvider>
            <AdminReviews />
          </LanguageProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('hides moderation UI from non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'patient' } });
    const client = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <LanguageProvider>
            <AdminReviews />
          </LanguageProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });
});
