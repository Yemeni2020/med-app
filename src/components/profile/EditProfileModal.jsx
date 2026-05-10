import React, { useRef, useState } from 'react';
import { X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/lib/UserProfileContext';
import { toast } from 'sonner';

const CATEGORIES = ['cardiology','neurology','oncology','pediatrics','dermatology','orthopedics','psychiatry','general_medicine','surgery','infectious_diseases'];
const CAT_LABELS = { cardiology:'Cardiology', neurology:'Neurology', oncology:'Oncology', pediatrics:'Pediatrics', dermatology:'Dermatology', orthopedics:'Orthopedics', psychiatry:'Psychiatry', general_medicine:'General Medicine', surgery:'Surgery', infectious_diseases:'Infectious Diseases' };

export default function EditProfileModal({ onClose }) {
  const { profile, updateProfile, uploadAvatar } = useUserProfile();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
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
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated.');
    } catch {
      toast.error('Failed to upload avatar.');
    } finally {
      setUploading(false);
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
      await updateProfile(form);
      toast.success('Profile updated.');
      onClose();
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold">Edit Profile</h2>
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
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click the camera to change your avatar</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder="Tell us a bit about yourself..."
              rows={2}
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Gender</label>
              <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Location</label>
            <input type="text" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="City, Country"
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Health Conditions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={conditionInput} onChange={(event) => setConditionInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addCondition())}
                placeholder="e.g. Hypertension, Diabetes..."
                className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button size="sm" onClick={addCondition} className="rounded-xl">Add</Button>
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
            <label className="text-sm font-medium mb-1.5 block">Medical Interests</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button key={category} onClick={() => toggleInterest(category)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.interests.includes(category) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/50'}`}>
                  {CAT_LABELS[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive personalized health updates</p>
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
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={save} disabled={saving} className="flex-1 rounded-xl gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
