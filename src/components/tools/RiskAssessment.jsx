import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HeartPulse, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  { id: 'age', question: 'What is your age group?', options: [{ value: '0', label: 'Under 45' }, { value: '1', label: '45-64' }, { value: '2', label: '65+' }] },
  { id: 'smoking', question: 'Do you smoke?', options: [{ value: '0', label: 'No' }, { value: '1', label: 'Formerly' }, { value: '2', label: 'Yes' }] },
  { id: 'exercise', question: 'How often do you exercise?', options: [{ value: '0', label: 'Regularly' }, { value: '1', label: 'Sometimes' }, { value: '2', label: 'Rarely' }] },
  { id: 'family', question: 'Family history of heart disease?', options: [{ value: '0', label: 'No' }, { value: '1', label: 'Not sure' }, { value: '2', label: 'Yes' }] },
  { id: 'diet', question: 'How would you describe your diet?', options: [{ value: '0', label: 'Healthy' }, { value: '1', label: 'Average' }, { value: '2', label: 'Unhealthy' }] },
];

export default function RiskAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [questions[step].id]: parseInt(value) }));
  };

  const next = () => {
    if (step < questions.length - 1) setStep(s => s + 1);
    else setShowResult(true);
  };

  const reset = () => { setStep(0); setAnswers({}); setShowResult(false); };

  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 2;
  const percentage = Math.round((score / maxScore) * 100);
  const riskLevel = percentage <= 30 ? 'Low' : percentage <= 60 ? 'Moderate' : 'High';
  const riskColor = percentage <= 30 ? 'text-green-500' : percentage <= 60 ? 'text-amber-500' : 'text-red-500';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="font-serif text-xl">Heart Disease Risk Assessment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex gap-1 mb-6">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Question {step + 1} of {questions.length}</p>
              <h3 className="text-lg font-semibold mb-5">{questions[step].question}</h3>
              <RadioGroup value={answers[questions[step].id]?.toString()} onValueChange={handleAnswer}>
                <div className="space-y-3">
                  {questions[step].options.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-3 border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={opt.value} id={`${questions[step].id}-${opt.value}`} />
                      <Label htmlFor={`${questions[step].id}-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <Button
                onClick={next}
                disabled={answers[questions[step].id] === undefined}
                className="mt-6 rounded-xl gap-2"
              >
                {step < questions.length - 1 ? 'Next' : 'See Result'} <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <span className={`text-3xl font-bold ${riskColor}`}>{percentage}%</span>
              </div>
              <p className={`text-2xl font-bold ${riskColor}`}>{riskLevel} Risk</p>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
                This is an educational estimate only. Please consult a healthcare professional for personalized assessment.
              </p>
              <Button variant="outline" onClick={reset} className="mt-6 rounded-xl gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}