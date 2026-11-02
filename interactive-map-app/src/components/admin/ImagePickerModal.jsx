import { useEffect, useState } from "react";

export default function ImagePickerModal({selectedImageId, onSelect, onClose,}) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch("/api/images");
        const data = await response.json();

        setImages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadImages();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Choose an image</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded border px-3 py-1"
          >
            Close
          </button>
        </div>

        {isLoading ? (<p>Loading images...</p>) : images.length === 0 ? (<p className="text-gray-500">No images available. Upload an image first.</p>) : 
        (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => {
              const isSelected =
                image._id === selectedImageId;

              return (
                <button key={image._id} type="button" onClick={() =>{console.log("Image Selected:", image._id); onSelect(image._id)}} className={`rounded-lg border-4 p-1 ${isSelected ? "border-blue-500": "border-transparent"}`}>
                  <img src={image.url} alt={image.name} className="h-28 w-full rounded object-cover"/>

                  <p className="mt-1 truncate text-xs text-gray-600">
                    {image.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}