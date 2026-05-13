import React from 'react';
import PageSeo from '@/components/seo/PageSeo';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedArticles from '@/components/home/FeaturedArticles';
import DoctorsSpotlight from '@/components/home/DoctorsSpotlight';
import NewsletterSection from '@/components/home/NewsletterSection';

export default function Home() {
  return (
    <div>
      <PageSeo page="home" />
      <HeroSection />
      <CategoriesSection />
      <FeaturedArticles />
      <DoctorsSpotlight />
      <NewsletterSection />
    </div>
  );
}
