import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Heart, Brain, Ribbon, Baby, Sparkles, Bone, SmilePlus, Stethoscope, Scissors, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  cardiology: Heart,
  neurology: Brain,
  oncology: Ribbon,
  pediatrics: Baby,
  dermatology: Sparkles,
  orthopedics: Bone,
  psychiatry: SmilePlus,
  general_medicine: Stethoscope,
  surgery: Scissors,
  infectious_diseases: Bug,
};

const categoryColors = [
  'bg-red-50 text-red-600 border-red-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-pink-50 text-pink-600 border-pink-100',
  'bg-sky-50 text-sky-600 border-sky-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-teal-50 text-teal-600 border-teal-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-lime-50 text-lime-600 border-lime-100',
];

export default function CategoriesSection() {
  const { t } = useLanguage();
  const categories = Object.keys(t.categories);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-2xl md:text-3xl font-serif font-bold mb-10">{t.footer.categories}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat, i) => {
          const Icon = categoryIcons[cat] || Stethoscope;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/articles?category=${cat}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 ${categoryColors[i]}`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-sm font-medium text-center">{t.categories[cat]}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}