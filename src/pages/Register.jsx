import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/med-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoadingAuth } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      toast.success('Account created successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof ApiError
        ? Object.values(error.payload?.errors || {}).flat()[0] || error.message
        : 'Unable to create account.';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full rounded-3xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">Create Patient Account</CardTitle>
          <CardDescription>Register once to sync saved articles and health metrics to your real account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} className="pl-10" minLength={8} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="passwordConfirmation" type="password" value={form.passwordConfirmation} onChange={(e) => updateField('passwordConfirmation', e.target.value)} className="pl-10" minLength={8} required />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isLoadingAuth}>
              {isLoadingAuth ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
