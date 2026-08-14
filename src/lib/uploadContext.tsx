import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from './compressImage';
import { canPostListingType, parseSubscriptionDetails } from './subscription';

interface UploadJob {
  id: string;
  title: string;
  progress: number; // 0-100
  status: 'uploading' | 'done' | 'error';
  errorMessage?: string | null;
}

interface UploadContextType {
  jobs: UploadJob[];
  startBackgroundUpload: (params: {
    title: string;
    form: Record<string, string>;
    images: File[];
    selectedType: string;
    userId: string;
  }) => void;
  dismissJob: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const updateJob = (id: string, patch: Partial<UploadJob>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  };

  const startBackgroundUpload = useCallback(async ({ title, form, images, selectedType, userId }: {
    title: string;
    form: Record<string, string>;
    images: File[];
    selectedType: string;
    userId: string;
  }) => {
    const id = `upload-${Date.now()}`;
    setJobs(prev => [...prev, { id, title, progress: 0, status: 'uploading' }]);

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('account_type, extra_account_types, subscription_expires_at, subscription_details, lister_type')
        .eq('id', userId)
        .single();

      if (userError || !userData) throw new Error('Could not verify listing permissions.');

      const details = parseSubscriptionDetails(userData.subscription_details);
      const extraTypes = Array.isArray(userData.extra_account_types) ? userData.extra_account_types : [];
      const allowed = canPostListingType(
        selectedType,
        userData.account_type ?? '',
        extraTypes,
        details,
        userData.subscription_expires_at ?? null
      );

      if (!allowed) throw new Error('You no longer have permission to post this listing type.');

      const imageUrls: string[] = [];
      const total = images.length;

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const compressed = await compressImage(file);
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { data: uploadData, error } = await supabase.storage
          .from('listings')
          .upload(path, compressed, { upsert: true });

        if (error) throw error;
        const { data: urlData } = supabase.storage.from('listings').getPublicUrl(uploadData.path);
        imageUrls.push(urlData.publicUrl);

        // Update progress after each image
        updateJob(id, { progress: Math.round(((i + 1) / total) * 80) });
      }

      // Save listing to DB
      updateJob(id, { progress: 90 });
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: userId,
        title: form.title,
        listing_type: selectedType,
        county: form.county,
        area: form.area,
        price: form.price,
        description: form.description,
        phone: form.phone,
        whatsapp: form.whatsapp,
        images: imageUrls,
        map_url: form.map_url || null,
        lister_type: userData.lister_type || null,
        status: 'live',
      });

      if (insertError) throw insertError;
      updateJob(id, { progress: 100, status: 'done' });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setJobs(prev => prev.filter(j => j.id !== id)), 5000);

    } catch (err: any) {
      // Log error for debugging and show a user-facing message in the toast
      // so we can diagnose why some uploads fail (permissions, storage, DB, etc.).
      // Keep the original behavior of marking the job as errored.
      // eslint-disable-next-line no-console
      console.error('Listing upload failed', err);
      updateJob(id, { status: 'error', errorMessage: err?.message ?? String(err) });
    }
  }, []);

  const dismissJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  return (
    <UploadContext.Provider value={{ jobs, startBackgroundUpload, dismissJob }}>
      {children}
      {/* Floating upload progress toast */}
      {jobs.length > 0 && (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 space-y-2 w-72">
          {jobs.map(job => (
            <div key={job.id} className={`rounded-2xl shadow-xl border p-4 ${
              job.status === 'done' ? 'bg-emerald-50 border-emerald-200' :
              job.status === 'error' ? 'bg-rose-50 border-rose-200' :
              'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {job.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  )}
                  {job.status === 'done' && (
                    <i className="ri-checkbox-circle-fill text-emerald-500 text-lg flex-shrink-0"></i>
                  )}
                  {job.status === 'error' && (
                    <i className="ri-error-warning-fill text-rose-500 text-lg flex-shrink-0"></i>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">
                      {job.status === 'uploading' && `Uploading... ${job.progress}%`}
                      {job.status === 'done' && 'Listing published successfully!'}
                      {job.status === 'error' && (job.errorMessage ? job.errorMessage : 'Upload failed. Please try again.')}
                    </p>
                  </div>
                </div>
                {(job.status === 'done' || job.status === 'error') && (
                  <button onClick={() => dismissJob(job.id)} className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0">
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
              {job.status === 'uploading' && (
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used inside UploadProvider');
  return ctx;
}
