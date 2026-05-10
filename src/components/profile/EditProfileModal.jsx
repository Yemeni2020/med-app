import React, { useRef, useState } from 'react';
import { X, Loader2, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { buildPhoneValue, parsePhoneValue } from '@/lib/phone';
import { useUserProfile } from '@/lib/UserProfileContext';
import { toast } from 'sonner';
import PhoneInput from '@/components/shared/PhoneInput';

const CATEGORIES = ['cardiology','neurology','oncology','pediatrics','dermatology','orthopedics','psychiatry','general_medicine','surgery','infectious_diseases'];

export default function EditProfileModal({ onClose }) {
  const { t } = useLanguage();
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const fileRef = useRef(null);
  const initialPhone = parsePhoneValue(profile?.phone);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    full_name_ar: profile?.full_name_ar || '',
    email: profile?.email || '',
    current_password: '',
    phone_country_code: initialPhone.countryCode,
    phone_number: initialPhone.phoneNumber,
    bio: profile?.bio || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    location: profile?.location || '',
    health_conditions: profile?.health_conditions || [],
    interests: profile?.interests || [],
    notification_email: profile?.notification_email ?? true,
  });
  const [conditionInput, setConditionInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const emailChanged = form.email.trim().toLowerCase() !== (profile?.email || '').toLowerCase();

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success(t.profile.modal.messages.avatarUpdated);
    } catch {
      toast.error(t.profile.modal.messages.avatarUpdateFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!profile?.avatar_url) return;
    const confirmed = window.confirm(t.profile.modal.confirmRemoveAvatar);
    if (!confirmed) return;

    setRemovingAvatar(true);
    try {
      await updateProfile({ avatar_url: null });
      toast.success(t.profile.modal.messages.avatarRemoved);
    } catch {
      toast.error(t.profile.modal.messages.avatarRemoveFailed);
    } finally {
      setRemovingAvatar(false);
    }
  };

  const toggleInterest = (category) => {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(category)
        ? current.interests.filter((item) => item !== category)
        : [...current.interests, category],
    }));
  };

  const addCondition = () => {
    const value = conditionInput.trim();
    if (value && !form.health_conditions.includes(value)) {
      setForm((current) => ({ ...current, health_conditions: [...current.health_conditions, value] }));
    }
    setConditionInput('');
  };

  const removeCondition = (condition) => {
    setForm((current) => ({
      ...current,
      health_conditions: current.health_conditions.filter((item) => item !== condition),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { full_name, full_name_ar, current_password, ...profileFields } = form;
      await updateProfile({
        ...profileFields,
        email: profileFields.email.trim(),
        phone: buildPhoneValue(profileFields.phone_country_code, profileFields.phone_number) || null,
        current_password: emailChanged ? current_password : undefined,
        name: {
          en: full_name,
          ar: full_name_ar || full_name,
        },
      });
      toast.success(emailChanged ? t.profile.modal.messages.profileUpdatedVerifyEmail : t.profile.modal.messages.profileUpdated);
      onClose();
    } catch (error) {
      toast.error(error.message || t.profile.modal.messages.profileUpdateFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold">{t.profile.modal.title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{(profile?.full_name || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || removingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              </button>
              {profile?.avatar_url ? (
                <button
                  onClick={handleAvatarRemove}
                  disabled={uploading || removingAvatar}
                  className="absolute -top-1 -right-1 w-7 h-7 bg-destructive rounded-lg flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors disabled:opacity-60"
                  title={t.profile.modal.removeAvatar}
                >
                  {removingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-white" />}
                </button>
              ) : null}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile?.avatar_url ? t.profile.modal.avatarHintWithRemove : t.profile.modal.avatarHint}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.fullName}</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
              placeholder={t.profile.modal.placeholders.fullName}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.arabicName}</label>
            <input
              type="text"
              value={form.full_name_ar}
              onChange={(event) => setForm((current) => ({ ...current, full_name_ar: event.target.value }))}
              placeholder={t.profile.modal.placeholders.arabicName}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder={t.profile.modal.placeholders.email}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t.profile.modal.emailReverify}
            </p>
          </div>

          {emailChanged ? (
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.currentPassword}</label>
              <input
                type="password"
                value={form.current_password}
                onChange={(event) => setForm((current) => ({ ...current, current_password: event.target.value }))}
                placeholder={t.profile.modal.placeholders.currentPassword}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t.profile.modal.currentPasswordRequired}
              </p>
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.phone}</label>
            <PhoneInput
              inputId="profile-phone"
              countryCode={form.phone_country_code}
              phoneNumber={form.phone_number}
              onCountryCodeChange={(value) => setForm((current) => ({ ...current, phone_country_code: value }))}
              onPhoneNumberChange={(value) => setForm((current) => ({ ...current, phone_number: value }))}
              placeholder={t.profile.modal.placeholders.phone}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.bio}</label>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder={t.profile.modal.placeholders.bio}
              rows={2}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.dateOfBirth}</label>
              <input type="date" value={form.date_of_birth} onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.gender}</label>
              <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">{t.profile.gender.select}</option>
                <option value="male">{t.profile.gender.male}</option>
                <option value="female">{t.profile.gender.female}</option>
                <option value="prefer_not_to_say">{t.profile.gender.prefer_not_to_say}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.location}</label>
            <input type="text" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder={t.profile.modal.placeholders.location}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.healthConditions}</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={conditionInput} onChange={(event) => setConditionInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addCondition())}
                placeholder={t.profile.modal.placeholders.condition}
                className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button size="sm" onClick={addCondition} className="rounded-xl">{t.common.add}</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.health_conditions.map((condition) => (
                <span key={condition} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                  {condition}
                  <button onClick={() => removeCondition(condition)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.profile.modal.fields.medicalInterests}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button key={category} onClick={() => toggleInterest(category)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.interests.includes(category) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/50'}`}>
                  {t.categories[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <div>
              <p className="text-sm font-medium">{t.profile.modal.fields.emailNotifications}</p>
              <p className="text-xs text-muted-foreground">{t.profile.modal.fields.emailNotificationsDesc}</p>
            </div>
            <button
              onClick={() => setForm((current) => ({ ...current, notification_email: !current.notification_email }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.notification_email ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.notification_email ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t.common.cancel}</Button>
          <Button onClick={save} disabled={saving} className="flex-1 rounded-xl gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t.profile.modal.buttons.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  );
}
