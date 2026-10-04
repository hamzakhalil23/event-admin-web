"use client";

import { useRef, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useToast } from "./Toast";

interface Props {
  value?:    string;
  onChange:  (url: string) => void;
  label?:    string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: Props) {
  const toast    = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState<string>(value || "");

  const handleFile = async (file: File) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res  = await apiFetch("/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Upload failed.");
        setPreview(value || "");
        return;
      }

      onChange(data.url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Upload failed — check your connection.");
      setPreview(value || "");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-bold text-stone-500">{label}</label>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`relative flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden
          rounded-xl border-2 border-dashed transition-colors outline-none
          ${uploading
            ? "border-emerald-300 bg-emerald-50 cursor-wait"
            : "border-stone-200 bg-stone-50 hover:border-emerald-400 hover:bg-emerald-50 focus:border-emerald-400"
          }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 p-4 text-center">
            <span className="text-3xl">🖼️</span>
            <p className="text-sm font-semibold text-stone-500">
              Click or drag an image here
            </p>
            <p className="text-xs text-stone-400">PNG, JPG, WebP · max 10 MB</p>
          </div>
        )}

        {/* Upload spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-900 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Remove button + URL preview */}
      {value && !uploading && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-stone-400">{value}</p>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
