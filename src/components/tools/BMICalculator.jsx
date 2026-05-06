import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calculator, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BMICalculator() {
  const { t } = useLanguage();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let category = '';
    let color = '';
    if (bmi < 18.5) { category = t.bmi.underweight; color = 'text-blue-500'; }
    else if (bmi < 25) { category = t.bmi.normal; color = 'text-green-500'; }
    else if (bmi < 30) { category = t.bmi.overweight; color = 'text-amber-500'; }
    else { category = t.bmi.obese; color = 'text-red-500'; }
    setResult({ bmi: bmi.toFixed(1), category, color });
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setResult(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-xl">{t.bmi.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>{t.bmi.weight}</Label>
          <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>{t.bmi.height}</Label>
          <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="h-11 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Button onClick={calculateBMI} className="flex-1 rounded-xl">{t.common.calculate}</Button>
          <Button variant="outline" onClick={reset} className="rounded-xl"><RotateCcw className="w-4 h-4" /></Button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-muted rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1">{t.common.result}</p>
              <p className={`text-4xl font-bold ${result.color}`}>{result.bmi}</p>
              <p className={`text-lg font-medium mt-1 ${result.color}`}>{result.category}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}