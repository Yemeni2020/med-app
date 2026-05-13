import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import HealthInsights from '@/pages/HealthInsights';
import { LanguageProvider } from '@/lib/LanguageContext';

vi.mock('@/lib/med-api', () => ({
  getHealthInsights: vi.fn(),
}));

const { getHealthInsights } = await import('@/lib/med-api');

function renderPage() {
  const client = new QueryClient();

  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <LanguageProvider>
          <HealthInsights />
        </LanguageProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('HealthInsights', () => {
  it('shows the empty state when there is not enough data', async () => {
    getHealthInsights.mockResolvedValue({
      overview: {
        total_metric_entries: 0,
        metric_types_tracked: [],
        total_symptom_assessments: 0,
        symptom_days: 0,
      },
      metric_series: [],
      symptom_history: [],
      timeline: [],
      correlations: [],
    });

    renderPage();

    expect(await screen.findByText('More data is needed before trends can be shown')).toBeInTheDocument();
  });

  it('renders the timeline overlay when data exists', async () => {
    getHealthInsights.mockResolvedValue({
      overview: {
        total_metric_entries: 2,
        metric_types_tracked: ['sleep_hours'],
        total_symptom_assessments: 1,
        symptom_days: 1,
      },
      metric_series: [
        {
          metric_type: 'sleep_hours',
          unit: 'hours',
          points: [
            { date: '2026-05-10', value: 5.5, unit: 'hours' },
            { date: '2026-05-11', value: 8, unit: 'hours' },
          ],
        },
      ],
      symptom_history: [
        {
          id: 1,
          date: '2026-05-10',
          urgency: 'moderate',
          symptoms: ['Fatigue'],
          summary: 'Fatigue with poor sleep.',
          next_steps: ['Book a prompt appointment.'],
        },
      ],
      timeline: [
        {
          date: '2026-05-10',
          symptom_score: 3,
          symptom_event_count: 1,
          metrics: { sleep_hours: 5.5 },
        },
        {
          date: '2026-05-11',
          symptom_score: 0,
          symptom_event_count: 0,
          metrics: { sleep_hours: 8 },
        },
      ],
      correlations: [
        {
          metric_type: 'sleep_hours',
          unit: 'hours',
          symptom_day_average: 5.5,
          baseline_average: 8,
          direction: 'lower_on_symptom_days',
          confidence: 'low',
        },
      ],
    });

    renderPage();

    expect(await screen.findByText('Timeline Overlay')).toBeInTheDocument();
    expect(screen.getByText('Recent Symptom History')).toBeInTheDocument();
  });
});
