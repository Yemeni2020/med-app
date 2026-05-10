import React, { useState } from 'react';
import { useUserProfile } from '@/lib/UserProfileContext';
import { useSavedArticles } from '@/lib/SavedArticlesContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditProfileModal from '@/components/profile/EditProfileModal';
import MetricChart from '@/components/dashboard/MetricChart';
import AddMetricModal from '@/components/dashboard/AddMetricModal';
import PasswordManager from '@/components/profile/PasswordManager';
import { clearViewHistory, deleteHealthMetric, deleteViewHistory, listHealthMetrics, listViewHistory } from '@/lib/med-api';
import {
  Bookmark, Activity, Clock, Settings, Plus, TrendingUp,
  MapPin, Calendar, Heart, Edit3, Trash2, LayoutDashboard,
  Bell, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

const METRIC_META = {
  weight: { label: 'Weight', unit: 'kg', color: '#0ea5e9' },
  blood_pressure_systolic: { label: 'BP Systolic', unit: 'mmHg', color: '#ef4444' },
  blood_pressure_diastolic: { label: 'BP Diastolic', unit: 'mmHg', color: '#f97316' },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', color: '#ec4899' },
  blood_glucose: { label: 'Blood Glucose', unit: 'mg/dL', color: '#a855f7' },
  sleep_hours: { label: 'Sleep', unit: 'hours', color: '#6366f1' },
  steps: { label: 'Steps', unit: 'steps', color: '#10b981' },
  water_intake: { label: 'Water Intake', unit: 'L', color: '#06b6d4' },
  temperature: { label: 'Temperature', unit: '°C', color: '#f59e0b' },
  oxygen_saturation: { label: 'O₂ Sat', unit: '%', color: '#14b8a6' },
};

const CAT_LABELS = {
  cardiology: 'Cardiology', neurology: 'Neurology', oncology: 'Oncology',
  pediatrics: 'Pediatrics', dermatology: 'Dermatology', orthopedics: 'Orthopedics',
  psychiatry: 'Psychiatry', general_medicine: 'General Medicine',
  surgery: 'Surgery', infectious_diseases: 'Infectious Diseases',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'health', label: 'Health Metrics', icon: Activity },
  { id: 'saved', label: 'Saved Articles', icon: Bookmark },
  { id: 'history', label: 'View History', icon: Eye },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function UserProfile() {
  const { profile, loading, updateProfile } = useUserProfile();
  const { savedItems, toggleSave } = useSavedArticles();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [activeMetric, setActiveMetric] = useState('weight');
  const queryClient = useQueryClient();

  const { data: metrics = [] } = useQuery({
    queryKey: ['health_metrics'],
    queryFn: listHealthMetrics,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['view_history'],
    queryFn: listViewHistory,
  });

  const deleteMetricMutation = useMutation({
    mutationFn: deleteHealthMetric,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['health_metrics'] }),
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: deleteViewHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['view_history'] }),
  });

  const clearHistoryMutation = useMutation({
    mutationFn: clearViewHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['view_history'] }),
  });

  const metricTypes = [...new Set(metrics.map((metric) => metric.metric_type))];
  const activeData = metrics.filter((metric) => metric.metric_type === activeMetric).sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));
  const latestByType = metricTypes.map((type) => {
    const latest = metrics.filter((metric) => metric.metric_type === type).sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date))[0];
    return { type, latest };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = profile?.full_name ? profile.full_name.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const age = profile?.date_of_birth ? Math.floor((new Date() - new Date(profile.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl overflow-hidden mb-6 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-secondary relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </div>
        <div className="px-6 pb-5 -mt-12 relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-card overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile?.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{initials}</span>
                )}
              </div>
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || 'User'}</h1>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  {profile?.location ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span> : null}
                  {age ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{age} years old</span> : null}
                  {profile?.gender && profile.gender !== 'prefer_not_to_say' ? <span className="capitalize">{profile.gender}</span> : null}
                </div>
              </div>
            </div>
            <Button onClick={() => setShowEditModal(true)} variant="outline" className="rounded-xl gap-2 mb-1">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Button>
          </div>

          {profile?.bio ? <p className="mt-3 text-sm text-muted-foreground max-w-xl">{profile.bio}</p> : null}

          {profile?.interests?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">{CAT_LABELS[interest] || interest}</Badge>
              ))}
            </div>
          ) : null}

          {profile?.health_conditions?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.health_conditions.map((condition) => (
                <span key={condition} className="text-xs bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" />{condition}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Saved Articles', value: savedItems.length, icon: Bookmark, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Health Records', value: metrics.length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Articles Read', value: history.length, icon: Eye, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Interests', value: profile?.interests?.length || 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Bookmark className="w-4 h-4 text-primary" /> Recently Saved</h3>
              <Link to="/saved" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {savedItems.slice(0, 4).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No saved articles yet</p>
            ) : (
              <div className="space-y-3">
                {savedItems.slice(0, 4).map((item) => (
                  <Link key={item.id} to={`/articles/${item.item_id}`} className="flex gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors">
                    {item.cover_image ? <img src={item.cover_image} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" /> : null}
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.author_name} · {item.read_time_minutes}min</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Latest Metrics</h3>
              <button onClick={() => setActiveTab('health')} className="text-xs text-primary hover:underline">View all</button>
            </div>
            {latestByType.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No health metrics logged yet</p>
                <Button size="sm" onClick={() => setShowAddMetric(true)} className="rounded-xl gap-1.5"><Plus className="w-3.5 h-3.5" /> Log Metric</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {latestByType.slice(0, 6).map(({ type, latest }) => {
                  const meta = METRIC_META[type] || { label: type, unit: '', color: '#64748b' };
                  return (
                    <div key={type} className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">{meta.label}</p>
                      <p className="font-bold" style={{ color: meta.color }}>{latest.value}<span className="text-xs font-normal text-muted-foreground ml-1">{meta.unit}</span></p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" /> Reading History</h3>
              <button onClick={() => setActiveTab('history')} className="text-xs text-primary hover:underline">View all</button>
            </div>
            {history.slice(0, 4).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reading history yet</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 4).map((item) => (
                  <Link key={item.id} to={`/articles/${item.article_id}`} className="flex gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors">
                    {item.cover_image ? <img src={item.cover_image} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" /> : null}
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.category?.replace(/_/g, ' ')} · {new Date(item.created_date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> My Interests</h3>
              <button onClick={() => setShowEditModal(true)} className="text-xs text-primary hover:underline">Edit</button>
            </div>
            {!profile?.interests?.length ? (
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground mb-3">No interests set yet</p>
                <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)} className="rounded-xl gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Interests</Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Link key={interest} to={`/articles?category=${interest}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">{CAT_LABELS[interest]}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'health' ? (
        <div className="space-y-5">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddMetric(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Log Metric</Button>
          </div>
          {latestByType.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold text-lg mb-2">No health data yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start tracking your health metrics</p>
              <Button onClick={() => setShowAddMetric(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Log First Metric</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {latestByType.map(({ type, latest }) => {
                  const meta = METRIC_META[type] || { label: type, unit: '', color: '#64748b' };
                  return (
                    <button key={type} onClick={() => setActiveMetric(type)}
                      className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${activeMetric === type ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{meta.label}</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      </div>
                      <div className="text-xl font-bold" style={{ color: activeMetric === type ? meta.color : undefined }}>
                        {latest.value}<span className="text-xs font-normal text-muted-foreground ml-1">{meta.unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{latest.recorded_date}</div>
                    </button>
                  );
                })}
              </div>
              {activeData.length > 0 ? (
                <MetricChart data={activeData} meta={METRIC_META[activeMetric] || { label: activeMetric, unit: '', color: '#0ea5e9' }}
                  metricType={activeMetric} onDelete={(id) => deleteMetricMutation.mutate(id)} />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {activeTab === 'saved' ? (
        <div>
          {savedItems.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold text-lg mb-2">No saved articles yet</p>
              <Link to="/articles"><Button className="rounded-xl">Browse Articles</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                  {item.cover_image ? (
                    <Link to={`/articles/${item.item_id}`}>
                      <img src={item.cover_image} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                    </Link>
                  ) : null}
                  <div className="p-4">
                    {item.category ? <Badge variant="secondary" className="text-xs mb-2">{CAT_LABELS[item.category] || item.category}</Badge> : null}
                    <Link to={`/articles/${item.item_id}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors mb-1">{item.title}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-3">{item.author_name} · {item.read_time_minutes}min read</p>
                    <Button size="sm" variant="outline" onClick={() => toggleSave(item)} className="w-full rounded-xl text-xs gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 fill-current" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold">Reading History ({history.length} articles)</h3>
            {history.length > 0 ? (
              <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => clearHistoryMutation.mutate()}>
                Clear All
              </Button>
            ) : null}
          </div>
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold mb-2">No reading history</p>
              <p className="text-sm text-muted-foreground">Articles you read will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                  {item.cover_image ? <img src={item.cover_image} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" /> : null}
                  <div className="flex-1 min-w-0">
                    <Link to={`/articles/${item.article_id}`} className="font-medium line-clamp-1 hover:text-primary transition-colors">{item.title}</Link>
                    <p className="text-xs text-muted-foreground">{item.author_name} · {item.category?.replace(/_/g, ' ')} · {new Date(item.created_date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteHistoryMutation.mutate(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'settings' ? (
        <div className="max-w-lg space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{profile?.created_date ? new Date(profile.created_date).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive health & article updates</p>
              </div>
              <button
                onClick={() => updateProfile({ notification_email: !profile?.notification_email })}
                className={`relative w-11 h-6 rounded-full transition-colors ${profile?.notification_email !== false ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile?.notification_email !== false ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <PasswordManager />

          <Button onClick={() => setShowEditModal(true)} className="w-full rounded-xl gap-2">
            <Edit3 className="w-4 h-4" /> Edit Full Profile
          </Button>
        </div>
      ) : null}

      {showEditModal ? <EditProfileModal onClose={() => setShowEditModal(false)} /> : null}
      {showAddMetric ? (
        <AddMetricModal onClose={() => setShowAddMetric(false)} onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['health_metrics'] });
          setShowAddMetric(false);
        }} />
      ) : null}
    </div>
  );
}
