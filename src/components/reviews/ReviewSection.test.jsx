import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ReviewSection from '@/components/reviews/ReviewSection';
import { LanguageProvider } from '@/lib/LanguageContext';

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

vi.mock('@/lib/med-api', () => ({
  listReviews: vi.fn().mockResolvedValue({
    average_rating: 0,
    review_count: 0,
    reviews: [],
  }),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

describe('ReviewSection', () => {
  it('shows the guest login prompt', async () => {
    const client = new QueryClient();

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <LanguageProvider>
            <ReviewSection reviewableType="article" reviewableId="1" />
          </LanguageProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Login to write a review')).toBeInTheDocument();
  });
});
