
import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full">
      <label className={`
        flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl 
        cursor-pointer transition-all duration-300
        ${isLoading ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'}
      `}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-12 h-12 mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-2 text-sm text-slate-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-slate-500">Photocopy or B&W image (PNG, JPG, WEBP)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={isLoading}
        />
      </label>
    </div>
  );
};
