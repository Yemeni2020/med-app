import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CATEGORY_LABELS = {
  cardiology: 'Cardiology', neurology: 'Neurology', oncology: 'Oncology',
  pediatrics: 'Pediatrics', dermatology: 'Dermatology', orthopedics: 'Orthopedics',
  psychiatry: 'Psychiatry', general_medicine: 'General Medicine', surgery: 'Surgery',
  infectious_diseases: 'Infectious Diseases',
};

export default function TrendingTopics({ savedItems }) {
  // Count categories from saved items
  const categoryCounts = savedItems.reduce((acc, item) => {
    if (item.category) acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const defaultTopics = [
    { category: 'cardiology', count: 0 },
    { category: 'neurology', count: 0 },
    { category: 'oncology', count: 0 },
  ];

  const topics = sorted.length > 0
    ? sorted.map(([category, count]) => ({ category, count }))
    : defaultTopics;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Your Trending Topics</h3>
      </div>
      {sorted.length === 0 && (
        <p className="text-xs text-muted-foreground mb-3">Based on your saved articles. Start bookmarking to see personalized trends!</p>
      )}
      <div className="space-y-2">
        {topics.map(({ category, count }, i) => (
          <Link key={category} to={`/articles?category=${category}`}>
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground w-4 text-center font-semibold">#{i + 1}</span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {CATEGORY_LABELS[category] || category}
                </span>
              </div>
              {count > 0 && (
                <Badge variant="secondary" className="text-xs rounded-full">{count} saved</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}