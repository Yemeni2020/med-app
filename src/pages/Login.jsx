import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { ApiError } from '@/lib/med-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoadingAuth } = useAuth();
  const { lang } = useLanguage();
  const isArabic = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ email, password });
      toast.success(isArabic ? 'تم تسجيل الدخول بنجاح.' : 'Signed in successfully.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.payload?.errors?.email?.[0] || error.message
        : (isArabic ? 'تعذر تسجيل الدخول.' : 'Unable to sign in.');
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full rounded-3xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">{isArabic ? 'دخول المريض' : 'Patient Sign In'}</CardTitle>
          <CardDescription>{isArabic ? 'ادخل للوصول إلى مقالاتك المحفوظة ولوحة المتابعة وملفك الشخصي.' : 'Access your saved articles, health dashboard, and profile.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isArabic ? 'كلمة المرور' : 'Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isLoadingAuth}>
              {isLoadingAuth ? (isArabic ? 'جارٍ تسجيل الدخول...' : 'Signing in...') : (isArabic ? 'تسجيل الدخول' : 'Sign In')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isArabic ? 'تحتاج حسابًا؟' : 'Need an account?'}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {isArabic ? 'أنشئ حسابًا' : 'Create one'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
