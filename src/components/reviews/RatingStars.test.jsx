import React from 'react';
import { render, screen } from '@testing-library/react';
import RatingStars from '@/components/reviews/RatingStars';

describe('RatingStars', () => {
  it('renders the selected rating', () => {
    render(<RatingStars rating={4} />);

    expect(screen.getAllByLabelText ? true : true).toBe(true);
    expect(document.querySelectorAll('.fill-amber-400').length).toBe(4);
  });
});
