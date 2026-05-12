import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/shared/PhoneInput';
import { buildPhoneValue, parsePhoneValue } from '@/lib/phone';

function getDisplayName(user) {
  if (!user?.name) return '';
  if (typeof user.name === 'string') return user.name;
  return user.name.en || user.name.ar || '';
}

export default function Profile() {
  const { user, loadProfile, updateProfile } = useAuth();
  const profileQuery = useQuery({
    queryKey: ['med-profile'],
    queryFn: loadProfile,
    initialData: user,
  });

  const profile = profileQuery.data || user;
  const isNormalUser = (profile?.role || 'patient') === 'patient';
  const parsedPhone = parsePhoneValue(profile?.phone);
  const [form, setForm] = useState(null);

  const initialForm = useMemo(() => ({
    name: getDisplayName(profile),
    phoneCountryCode: profile?.phone_country_code || parsedPhone.countryCode,
    phoneNumber: parsedPhone.phoneNumber,
    avatarUrl: profile?.avatar_url || '',
    language: profile?.language || 'en',
  }), [parsedPhone.countryCode, parsedPhone.phoneNumber, profile]);

  const currentForm = form || initialForm;

  const updateField = (key, value) => {
    setForm((existing) => ({
      ...(existing || initialForm),
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await updateProfile({
        name: {
          en: currentForm.name,
          ar: currentForm.name,
        },
        phone: isNormalUser ? null : (buildPhoneValue(currentForm.phoneCountryCode, currentForm.phoneNumber) || null),
        phone_country_code: isNormalUser ? null : (currentForm.phoneCountryCode || null),
        avatar_url: currentForm.avatarUrl || null,
        language: currentForm.language,
      });
      setForm(null);
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message || 'Unable to update profile.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <UserRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your patient account details stored in the backend.</p>
        </div>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Account Details
          </CardTitle>
          <CardDescription>{profile?.role === 'admin' ? 'Administrator access enabled.' : 'Patient account synced with the API.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" value={currentForm.name} onChange={(e) => updateField('name', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={profile?.email || ''} disabled />
            </div>

            {!isNormalUser ? (
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <PhoneInput
                  inputId="profile-phone"
                  countryCode={currentForm.phoneCountryCode}
                  phoneNumber={currentForm.phoneNumber}
                  onCountryCodeChange={(value) => updateField('phoneCountryCode', value)}
                  onPhoneNumberChange={(value) => updateField('phoneNumber', value)}
                  placeholder="5XXXXXXXX"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="profile-avatar">Avatar URL</Label>
              <Input id="profile-avatar" value={currentForm.avatarUrl} onChange={(e) => updateField('avatarUrl', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-language">Preferred language</Label>
              <select
                id="profile-language"
                value={currentForm.language}
                onChange={(e) => updateField('language', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-xl">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
