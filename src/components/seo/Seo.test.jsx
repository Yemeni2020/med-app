import React from 'react';
import { render } from '@testing-library/react';
import Seo from '@/components/seo/Seo';

describe('Seo', () => {
  it('injects title, description, canonical, and json-ld', () => {
    render(
      <Seo
        title="Doctor profile"
        description="Consultant cardiologist profile."
        canonicalUrl="https://medblog.test/doctors/1"
        openGraph={{ type: 'profile', title: 'Doctor profile' }}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Person', name: 'Doctor profile' }}
      />
    );

    expect(document.title).toBe('Doctor profile');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Consultant cardiologist profile.');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://medblog.test/doctors/1');
    expect(document.getElementById('seo-json-ld')?.textContent).toContain('"@type":"Person"');
  });
});
