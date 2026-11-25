import { useEffect, useState, useRef} from "react";






export default function ImagePicker({ selectedImageId, onSelect }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert("Could not upload image.");
      return;
    }

    const newImage = await response.json();

    setImages((prev) => [...prev, newImage]);
    onSelect(newImage._id);
  }



  useEffect(() => { 
    async function loadImages() {
      try{
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

  if(isLoading){
    return  <p className="text-xs text-gray-500">Loading images...</p>;
  }

  // if(images.length === 0){
  //   return (
  //     <p className="text-xs text-gray-500">
  //       No images available. Upload an image first.
  //     </p>
  //   );
  // }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((image) => {
        const isSelected = image._id === selectedImageId;

        return (
          <button key={image._id} type="button" onClick={() => onSelect(image._id)} className={`rounded-lg border-4 p-1 ${isSelected ? "border-blue-500" : "border-transparent"}`}>
            <img src={image.url} alt={image.name} className="h-12 w-16 rounded object-cover"/>
          </button>
        );
      })}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* <button type="button" onClick={handleClick} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
        Upload image
      </button> */}
    </div>
  );
}