import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ReviewForm from '@/components/reviews/ReviewForm';
import { LanguageProvider } from '@/lib/LanguageContext';

describe('ReviewForm', () => {
  it('submits rating and comment', () => {
    const handleSubmit = vi.fn();

    render(
      <LanguageProvider>
        <ReviewForm onSubmit={handleSubmit} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByLabelText('Set rating to 4'));
    fireEvent.change(screen.getByPlaceholderText('Add your feedback about this content'), {
      target: { value: 'Very helpful article.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      rating: 4,
      comment: 'Very helpful article.',
    });
  });
});
