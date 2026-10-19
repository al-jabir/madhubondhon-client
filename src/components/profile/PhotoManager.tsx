import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Trash2,
  Shield,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { profilesApi } from '../../api/profiles.api';
import { ProfilePhoto } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useLanguage } from '../../i18n/LanguageContext';

interface PhotoManagerProps {
  photos: ProfilePhoto[];
  currentPrivacy?: 'public' | 'registered_only' | 'on_interest_accepted' | 'hidden';
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos = [],
  currentPrivacy = 'public',
}) => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurPhoto, setBlurPhoto] = useState(false);
  const [isProfilePhoto, setIsProfilePhoto] = useState(photos.length === 0);
  const [privacy, setPrivacy] = useState(currentPrivacy);

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      isPrimary,
      blur,
    }: {
      file: File;
      isPrimary: boolean;
      blur: boolean;
    }) => profilesApi.uploadPhoto(file, isPrimary, blur),
    onSuccess: () => {
      toast.success(
        isBengali ? 'ছবি সফলভাবে আপলোড করা হয়েছে' : 'Photo uploaded successfully'
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Failed to upload photo.');
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (photoKey: string) => profilesApi.deletePhoto(photoKey),
    onSuccess: () => {
      toast.success(isBengali ? 'ছবি মুছে ফেলা হয়েছে' : 'Photo deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: () => {
      toast.error(isBengali ? 'ছবি মুছতে সমস্যা হয়েছে' : 'Failed to delete photo');
    },
  });

  // Privacy Mutation
  const privacyMutation = useMutation({
    mutationFn: (newPrivacy: string) => profilesApi.updatePhotoPrivacy(newPrivacy),
    onSuccess: () => {
      toast.success(
        isBengali ? 'ছবির গোপনীয়তা সেটিংস সংরক্ষিত হয়েছে' : 'Privacy settings saved'
      );
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: () => {
      toast.error(
        isBengali ? 'গোপনীয়তা সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save privacy settings'
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          isBengali
            ? 'ছবির সর্বোচ্চ সাইজ ৫ মেগাবাইট হতে পারবে'
            : 'Maximum image size is 5 MB'
        );
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(
        isBengali ? 'অনুগ্রহ করে একটি ছবি নির্বাচন করুন' : 'Please select an image'
      );
      return;
    }
    uploadMutation.mutate({
      file: selectedFile,
      isPrimary: isProfilePhoto,
      blur: blurPhoto,
    });
  };

  const handlePrivacyChange = (newPrivacy: string) => {
    setPrivacy(newPrivacy as typeof privacy);
    privacyMutation.mutate(newPrivacy);
  };

  return (
    <div className="mb-card rounded-3xl p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'ছবি ও পর্দাশীলতা ব্যবস্থাপনা' : 'Photo & Privacy Settings'}</span>
          </h3>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'বায়োডাটার ছবি আপলোড করুন এবং কে কে আপনার ছবি দেখতে পারবে তা নির্ধারণ করুন'
              : 'Upload photos and control who can view them'}
          </p>
        </div>

        {/* Privacy Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-ink-3 shrink-0" />
          <label className="text-xs text-ink-2 font-semibold shrink-0">
            {isBengali ? 'ছবির দৃশ্যমানতা:' : 'Photo Visibility:'}
          </label>
          <select
            value={privacy}
            onChange={(e) => handlePrivacyChange(e.target.value)}
            disabled={privacyMutation.isPending}
            className="mb-input !text-xs font-semibold py-1.5 cursor-pointer"
          >
            <option value="public">{isBengali ? 'সবার জন্য উন্মুক্ত (Public)' : 'Public'}</option>
            <option value="registered_only">
              {isBengali ? 'শুধুমাত্র নিবন্ধিত সদস্য (Registered Only)' : 'Registered Members Only'}
            </option>
            <option value="on_interest_accepted">
              {isBengali ? 'প্রস্তাব গ্রহণ করলে (On Interest Accepted)' : 'On Interest Accepted Only'}
            </option>
            <option value="hidden">{isBengali ? 'ছবি পুরোপুরি গোপন (Hidden)' : 'Hidden'}</option>
          </select>
        </div>
      </div>

      {/* Gallery of Uploaded Photos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          <span>
            {isBengali
              ? `সংরক্ষিত ছবিসমূহ (${formatNumber(photos.length)})`
              : `Uploaded Photos (${photos.length})`}
          </span>
        </h4>

        {photos.length === 0 ? (
          <div className="py-8 text-center bg-elev rounded-2xl border border-dashed border-line p-4">
            <p className="text-xs text-ink-3">
              {isBengali
                ? 'এখনও কোনো ছবি যোগ করা হয়নি। নিচে থেকে ছবি আপলোড করুন।'
                : 'No photos uploaded yet. Upload a photo below.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p, idx) => {
              const photoKey = p.key || String(idx);
              const imageUrl = p.url?.startsWith('http')
                ? p.url
                : `http://localhost:5000${p.url}`;

              return (
                <div
                  key={photoKey}
                  className="group relative rounded-2xl overflow-hidden border border-line bg-elev aspect-3/4 flex flex-col justify-between shadow-2xs"
                >
                  <img
                    src={imageUrl}
                    alt={isBengali ? 'বায়োডাটা ছবি' : 'Biodata photo'}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      p.blurPhoto ? 'blur-md' : ''
                    }`}
                  />

                  {/* Overlays */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {p.isProfilePhoto && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand text-white shadow-xs">
                        {isBengali ? 'প্রধান ছবি' : 'Primary'}
                      </span>
                    )}
                    {p.blurPhoto && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-soft text-gold border border-gold/25 backdrop-blur-xs flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {isBengali ? 'পর্দাশীল' : 'Purdah Blur'}
                      </span>
                    )}
                  </div>

                  {/* Action Delete */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(photoKey)}
                      disabled={deleteMutation.isPending}
                      className="p-2.5 bg-brand hover:bg-brand/85 text-white rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title={isBengali ? 'ছবি মুছুন' : 'Delete photo'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload New Photo Form */}
      <form onSubmit={handleUpload} className="rounded-2xl bg-elev border border-line p-5 space-y-4">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand" />
          <span>{isBengali ? 'নতুন ছবি আপলোড করুন' : 'Upload New Photo'}</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* File Picker */}
          <div className="w-full sm:flex-1">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand/40 hover:border-brand bg-card rounded-xl p-4 cursor-pointer transition-colors text-center">
              <Camera className="w-6 h-6 text-brand mb-1" />
              <span className="text-xs font-bold text-brand">
                {selectedFile
                  ? selectedFile.name
                  : isBengali
                  ? 'ছবি বেছে নিন (গ্যালারি বা ফাইল)'
                  : 'Choose photo (Gallery or Files)'}
              </span>
              <span className="text-[11px] text-ink-3 mt-0.5">
                {isBengali ? 'JPG, PNG, WEBP (সর্বোচ্চ ৫ MB)' : 'JPG, PNG, WEBP (Max 5 MB)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview Box */}
          {previewUrl && (
            <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-brand/50 relative shrink-0">
              <img
                src={previewUrl}
                alt="preview"
                className={`w-full h-full object-cover ${blurPhoto ? 'blur-sm' : ''}`}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-start gap-2.5 bg-card p-3 rounded-xl border border-line cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={blurPhoto}
              onChange={(e) => setBlurPhoto(e.target.checked)}
              className="mt-0.5 rounded text-brand focus:ring-brand"
            />
            <div>
              <span className="font-bold text-ink flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                {isBengali ? 'পর্দাশীল ছবি (ব্লার রাখুন)' : 'Modest Purdah Blur'}
              </span>
              <span className="text-[11px] text-ink-3 block mt-0.5">
                {isBengali
                  ? 'ছবিটি ঝাপসা থাকবে; পাত্র-পাত্রী বা অভিভাবক সরাসরি অনুরোধ গ্রহণ করলেই শুধু স্পষ্ট দেখা যাবে।'
                  : 'Photo remains blurred and becomes clear only upon mutual interest acceptance.'}
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 bg-card p-3 rounded-xl border border-line cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isProfilePhoto}
              onChange={(e) => setIsProfilePhoto(e.target.checked)}
              className="mt-0.5 rounded text-brand focus:ring-brand"
            />
            <div>
              <span className="font-bold text-ink">
                {isBengali ? 'প্রধান প্রোফাইল ছবি করুন' : 'Set as primary photo'}
              </span>
              <span className="text-[11px] text-ink-3 block mt-0.5">
                {isBengali
                  ? 'বায়োডাটা কার্ড ও তালিকায় এই ছবিটি সর্বপ্রথম প্রদর্শিত হবে।'
                  : 'This photo will be displayed on biodata search cards.'}
              </span>
            </div>
          </label>
        </div>

        {/* Submit Upload */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!selectedFile || uploadMutation.isPending}
            className="mb-btn-primary px-5 py-2.5 !text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{isBengali ? 'ছবি আপলোড সম্পন্ন করুন' : 'Upload Photo'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotoManager;
