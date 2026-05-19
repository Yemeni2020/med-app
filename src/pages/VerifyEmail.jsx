import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { ApiError, resendEmailVerificationCode, verifyEmailOtp } from '@/lib/med-api';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    refreshUser,
    logout,
    pendingOtpChallenge,
    verifyOtpChallenge,
    resendOtpChallenge,
  } = useAuth();
  const { lang } = useLanguage();
  const isArabic = lang === 'ar';
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const redirectTo = useMemo(() => {
    return location.state?.from?.pathname || '/dashboard';
  }, [location.state]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasAuthenticatedVerification = isAuthenticated && user?.email_verified === false;
  const hasPendingChallenge = !isAuthenticated && pendingOtpChallenge;

  if (!hasAuthenticatedVerification && !hasPendingChallenge) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && user?.email_verified) {
    return <Navigate to={redirectTo} replace />;
  }

  const email = pendingOtpChallenge?.email || user?.email;
  const isLoginChallenge = pendingOtpChallenge?.purpose === 'login';
  const isRegisterChallenge = pendingOtpChallenge?.purpose === 'register';

  const handleVerify = async (event) => {
    event.preventDefault();

    if (code.length !== 6) {
      toast.error(isArabic ? 'أدخل رمز التحقق الكامل.' : 'Enter the full verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasPendingChallenge) {
        await verifyOtpChallenge(code);
      } else {
        await verifyEmailOtp(code);
        await refreshUser();
      }

      toast.success(
        isArabic
          ? (isLoginChallenge ? 'تم تأكيد تسجيل الدخول.' : 'تم توثيق البريد الإلكتروني.')
          : (isLoginChallenge ? 'Sign in confirmed successfully.' : 'Email verified successfully.')
      );
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.payload?.errors?.code?.[0] || error.message
        : (isArabic ? 'تعذر التحقق من الرمز.' : 'Unable to verify the code.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      if (hasPendingChallenge) {
        await resendOtpChallenge();
      } else {
        await resendEmailVerificationCode();
      }

      toast.success(isArabic ? 'تم إرسال رمز جديد إلى بريدك.' : 'A new code has been sent to your email.');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : (isArabic ? 'تعذر إعادة الإرسال.' : 'Unable to resend the code.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full rounded-3xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">
            {isArabic
              ? (isLoginChallenge ? 'أدخل رمز تسجيل الدخول' : 'تحقق من بريدك الإلكتروني')
              : (isLoginChallenge ? 'Enter your sign-in code' : 'Verify your email')}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? `أرسلنا رمزًا من 6 أرقام إلى ${email}. أدخله ${isLoginChallenge ? 'لإكمال تسجيل الدخول' : 'لإكمال تفعيل حسابك'}.`
              : `We sent a 6-digit code to ${email}. Enter it ${isLoginChallenge ? 'to complete your sign in' : 'to finish activating your account'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting
                ? (isArabic ? 'جارٍ التحقق...' : 'Verifying...')
                : (isArabic ? 'تأكيد الرمز' : 'Confirm code')}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-primary hover:underline"
              disabled={isResending}
            >
              {isResending
                ? (isArabic ? 'جارٍ إعادة الإرسال...' : 'Resending...')
                : (isArabic ? 'إعادة إرسال الرمز' : 'Resend code')}
            </button>

            <div>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isArabic ? 'تسجيل الخروج' : 'Sign out'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
