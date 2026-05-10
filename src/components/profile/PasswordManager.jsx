import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { requestPasswordReset, updateProfilePassword } from '@/lib/med-api';
import { useUserProfile } from '@/lib/UserProfileContext';
import { toast } from 'sonner';

export default function PasswordManager() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requirements = [
    { label: t.profile.password.requirements.min, met: newPassword.length >= 8 },
    { label: t.profile.password.requirements.upper, met: /[A-Z]/.test(newPassword) },
    { label: t.profile.password.requirements.lower, met: /[a-z]/.test(newPassword) },
    { label: t.profile.password.requirements.number, met: /\d/.test(newPassword) },
  ];

  const allMet = requirements.every((requirement) => requirement.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!allMet) {
      setError(t.profile.password.errors.requirements);
      return;
    }

    if (!passwordsMatch) {
      setError(t.profile.password.errors.mismatch);
      return;
    }

    setLoading(true);
    try {
      await updateProfilePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(t.profile.password.success);
      handleClose();
    } catch (requestError) {
      setError(requestError.message || t.profile.password.errors.incorrectCurrent);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!profile?.email) {
      toast.error(t.profile.password.noEmail);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(profile.email);
      toast.success(t.profile.password.resetSent);
    } catch (requestError) {
      toast.error(requestError.message || t.profile.password.resetFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> {t.profile.password.title}
        </h3>
        {!isOpen ? (
          <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} className="rounded-xl gap-1.5">
            <Lock className="w-3.5 h-3.5" /> {t.profile.password.changePassword}
          </Button>
        ) : null}
      </div>

      {!isOpen ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-muted-foreground">{t.profile.password.keepSecure}</p>
          <button
            onClick={handleForgot}
            disabled={loading}
            className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {t.profile.password.forgotPassword}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.profile.password.currentPassword}</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                placeholder={t.profile.password.placeholders.currentPassword}
                className="w-full h-10 px-4 pr-10 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((value) => !value)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.profile.password.newPassword}</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                placeholder={t.profile.password.placeholders.newPassword}
                className="w-full h-10 px-4 pr-10 rounded-xl border border-input bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowNew((value) => !value)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {requirements.map((requirement) => (
                  <div
                    key={requirement.label}
                    className={`flex items-center gap-1 text-xs ${requirement.met ? 'text-green-600' : 'text-muted-foreground'}`}
                  >
                    <CheckCircle className={`w-3 h-3 ${requirement.met ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                    {requirement.label}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.profile.password.confirmNewPassword}</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                placeholder={t.profile.password.placeholders.confirmNewPassword}
                className={`w-full h-10 px-4 pr-10 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                  confirmPassword.length > 0 ? (passwordsMatch ? 'border-green-400' : 'border-red-400') : 'border-input'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch ? (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {t.profile.password.errors.mismatch}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>
              {t.profile.password.buttons.cancel}
            </Button>
            <Button type="submit" disabled={loading || !allMet || !passwordsMatch} className="flex-1 rounded-xl gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.profile.password.buttons.saving}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> {t.profile.password.buttons.update}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
