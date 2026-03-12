"use client";

export function ImageUploader({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onAdd(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      <div className="grid grid-cols-5 gap-2 mt-3">
        {images.map((img, i) => (
          <div key={i} className="relative">
            <img src={img} className="h-24 w-full object-cover rounded" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
