'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { mlApi } from '@/lib/api/ml';
import { applicationsApi } from '@/lib/api/applications';
import { MLModel } from '@/lib/types/ml';
import { Application } from '@/lib/types/application';
import { useAuth } from '@/lib/auth';
import { BrainCircuit, Loader2, Sparkles, Activity, Play, Settings } from 'lucide-react';

export default function MLSettingsPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<MLModel[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainingDays, setTrainingDays] = useState(7);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);

  const fetchData = async () => {
    try {
      const [modelsData, appsData] = await Promise.all([
        mlApi.getModels(),
        applicationsApi.list()
      ]);
      setModels(modelsData);
      setApplications(appsData.items);
    } catch (error) {
      console.error('Failed to fetch ML data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrainModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTraining) return;
    setIsTraining(true);
    try {
      await mlApi.trainModel({
        application_id: selectedAppId || null,
        training_days: trainingDays
      });
      alert('Model training started in the background!');
      await fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to start training');
    } finally {
      setIsTraining(false);
    }
  };

  const hasManagePerm = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Machine Learning
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage ML anomaly detection models and baseline settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasManagePerm && (
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel overflow-hidden">
              <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Train New Model</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleTrainModel} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Target Application
                    </label>
                    <select
                      className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                    >
                      <option value="">Global (All Applications)</option>
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Training History (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      value={trainingDays}
                      onChange={(e) => setTrainingDays(parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Amount of historical data to use for the baseline.</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isTraining}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      {isTraining ? 'Initializing Training...' : 'Start Training Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={`glass-panel overflow-hidden ${hasManagePerm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Model Inventory</h2>
            </div>
            <span className="bg-secondary text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium border border-border">
              {models.length} {models.length === 1 ? 'Model' : 'Models'}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm">Retrieving model inventory...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <BrainCircuit className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No ML Models Found</h3>
                <p className="text-sm mt-1">Train a new model to enable anomaly detection.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-secondary/20">
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Model Name</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Target</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Trained At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {models.map((model) => (
                    <tr key={model.id} className="group hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <BrainCircuit className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground block">{model.name}</span>
                            <span className="text-xs text-muted-foreground font-mono mt-0.5">ID: {model.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{model.model_type}</span>
                          <span className="text-xs text-muted-foreground">v{model.feature_version}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {model.application_id ? (
                          <span className="text-sm text-foreground">
                            {applications.find(a => a.id === model.application_id)?.name || model.application_id.slice(0,8)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium border border-border">
                            Global
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border
                          ${model.status === 'ACTIVE' ? 'bg-success/15 text-success border-success/30' :
                            model.status === 'TRAINING' ? 'bg-primary/15 text-primary border-primary/30 animate-pulse' :
                            model.status === 'FAILED' ? 'bg-critical/15 text-critical border-critical/30' :
                            'bg-secondary text-muted-foreground border-border'}
                        `}>
                          {model.status === 'ACTIVE' && <Activity className="h-3 w-3" />}
                          {model.status === 'TRAINING' && <Loader2 className="h-3 w-3 animate-spin" />}
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-muted-foreground font-mono text-[11px]">
                          {model.trained_at ? new Date(model.trained_at).toLocaleString() : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
