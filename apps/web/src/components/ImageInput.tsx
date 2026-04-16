import { useState, useRef, useCallback } from "react";
import { usePaletteStore } from "../store/palette";

export function ImageInput() {
  const { generateFromImage, isLoading } = usePaletteStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const bitmap = await createImageBitmap(file);
        const canvas = new OffscreenCanvas(
          Math.min(bitmap.width, 400),
          Math.min(bitmap.height, 400),
        );
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        await generateFromImage(imageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process image");
      }
    },
    [generateFromImage],
  );

  return (
    <div className="space-y-4">
      <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
        Extract from Image
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
          ${isDragging ? "border-primary/60 bg-primary/5" : "border-border/40 hover:border-primary/30 hover:bg-surface"}
          ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        ) : (
          <div className="py-10 px-4 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-surface border border-border/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Drop an image or click to browse
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">
              PNG, JPG, WebP
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          className="hidden"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-[10px] font-medium text-muted-foreground">Extracting...</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-medium">
          {error}
        </div>
      )}

      {preview && !isLoading && (
        <button
          onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          className="w-full px-3 py-2 rounded-lg border border-border/50 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider hover:text-foreground hover:border-border transition-all"
        >
          Clear
        </button>
      )}
    </div>
  );
}
