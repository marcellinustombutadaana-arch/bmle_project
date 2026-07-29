import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Check, X, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  aspectRatio?: 'square' | 'banner';
  placeholder?: string;
  presetImages?: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  placeholder = 'Upload image from device',
  presetImages = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Limit file size to ~5MB for smooth localStorage storage
    if (file.size > 5 * 1024 * 1024) {
      alert('File size is over 5MB. Please upload a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-amber-400 hover:underline flex items-center gap-1"
        >
          {showUrlInput ? 'Use Device File Upload' : 'Enter Image URL Instead'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlInputValue || value}
            onChange={(e) => {
              setUrlInputValue(e.target.value);
              onChange(e.target.value);
            }}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {Boolean(value && value.trim() !== '') ? (
            <div className="relative group rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950">
              <img
                src={value}
                alt="Preview"
                className={`w-full object-cover ${
                  aspectRatio === 'banner' ? 'h-32' : 'h-28'
                }`}
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg hover:brightness-110"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change File</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-2 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg hover:bg-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-200">
                Click or Drag & Drop Image File
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Supports PNG, JPG, WEBP, GIF (Max 5MB)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Suggestions */}
      {presetImages.length > 0 && !value && (
        <div className="pt-1">
          <div className="text-[10px] font-semibold text-slate-500 mb-1">Quick Stock Presets:</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {presetImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(img)}
                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 shrink-0 transition-colors"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
