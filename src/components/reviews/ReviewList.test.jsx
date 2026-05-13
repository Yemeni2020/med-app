import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewList from '@/components/reviews/ReviewList';
import { LanguageProvider } from '@/lib/LanguageContext';

describe('ReviewList', () => {
  it('renders review items with user and comment', () => {
    render(
      <LanguageProvider>
        <ReviewList
          reviews={[
            {
              id: '1',
              rating: 5,
              comment: 'Clear and practical.',
              status: 'approved',
              created_date: '2026-05-12T12:00:00Z',
              user: { name: 'Nora' },
            },
          ]}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Nora')).toBeInTheDocument();
    expect(screen.getByText('Clear and practical.')).toBeInTheDocument();
  });

  it('renders empty state when no reviews exist', () => {
    render(
      <LanguageProvider>
        <ReviewList reviews={[]} />
      </LanguageProvider>
    );

    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });
});
