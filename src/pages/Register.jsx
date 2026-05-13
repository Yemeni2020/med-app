import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { ApiError } from '@/lib/med-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countryDialCodes } from '@/data/countryDialCodes';
import PageSeo from '@/components/seo/PageSeo';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoadingAuth } = useAuth();
  const { lang } = useLanguage();
  const isArabic = lang === 'ar';
  const [form, setForm] = useState({
    name: '',
    fullNameAr: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    nationality: '',
    bio: '',
    password: '',
    passwordConfirmation: '',
  });

  const countryOptions = useMemo(() => {
    const lang = document?.documentElement?.lang === 'ar' ? 'ar' : 'en';
    const names = typeof Intl !== 'undefined' ? new Intl.DisplayNames([lang], { type: 'region' }) : null;

    return countryDialCodes.map((entry) => {
      const iso = entry.iso;
      const label = names?.of(iso) || entry.country || iso;

      return {
        value: entry.country,
        label,
      };
    });
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register({
        ...form,
        phone: '',
        phoneCountryCode: '',
      });
      toast.success(isArabic ? 'تم إنشاء الحساب بنجاح.' : 'Account created successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof ApiError
        ? Object.values(error.payload?.errors || {}).flat()[0] || error.message
        : (isArabic ? 'تعذر إنشاء الحساب.' : 'Unable to create account.');
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-2xl items-center px-4 py-10">
      <PageSeo page="register" />
      <Card className="w-full rounded-3xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">{isArabic ? 'إنشاء حساب مريض' : 'Create Patient Account'}</CardTitle>
          <CardDescription>
            {isArabic
              ? 'سجّل مرة واحدة لمزامنة المقالات المحفوظة والمؤشرات الصحية وملفك الشخصي مع حسابك الفعلي.'
              : 'Register once to sync saved articles, health metrics, and your profile to your real account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{isArabic ? 'الاسم الكامل' : 'Full name'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullNameAr">{isArabic ? 'الاسم بالعربية' : 'Arabic name'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="fullNameAr" value={form.fullNameAr} onChange={(e) => updateField('fullNameAr', e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="pl-10" required />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{isArabic ? 'تاريخ الميلاد' : 'Date of birth'}</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{isArabic ? 'الجنس' : 'Gender'}</Label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{isArabic ? 'اختر الجنس' : 'Select gender'}</option>
                  <option value="male">{isArabic ? 'ذكر' : 'Male'}</option>
                  <option value="female">{isArabic ? 'أنثى' : 'Female'}</option>
                  <option value="prefer_not_to_say">{isArabic ? 'أفضل عدم الإفصاح' : 'Prefer not to say'}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">{isArabic ? 'الدولة' : 'Country'}</Label>
                <select
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{isArabic ? 'اختر الدولة' : 'Select country'}</option>
                  {countryOptions.map((country) => (
                    <option key={`country-${country.value}`} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">{isArabic ? 'الجنسية' : 'Nationality'}</Label>
                <select
                  id="nationality"
                  value={form.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{isArabic ? 'اختر الجنسية' : 'Select nationality'}</option>
                  {countryOptions.map((country) => (
                    <option key={`nationality-${country.value}`} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{isArabic ? 'نبذة عنك' : 'About you'}</Label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={3}
                placeholder={isArabic ? 'نبذة قصيرة أو معلومات صحية إضافية (اختياري)' : 'Optional short bio or health context'}
                className="flex min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">{isArabic ? 'كلمة المرور' : 'Password'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} className="pl-10" minLength={8} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">{isArabic ? 'تأكيد كلمة المرور' : 'Confirm password'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="passwordConfirmation" type="password" value={form.passwordConfirmation} onChange={(e) => updateField('passwordConfirmation', e.target.value)} className="pl-10" minLength={8} required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isLoadingAuth}>
              {isLoadingAuth
                ? (isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating account...')
                : (isArabic ? 'إنشاء الحساب' : 'Create Account')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {isArabic ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
