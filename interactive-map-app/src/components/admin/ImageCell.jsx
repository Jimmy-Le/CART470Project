import { useState } from "react";
import ImagePickerModal from "./ImagePickerModal";

export default function ImageCell({island, onUpdate, fieldName, label = "Choose Image"}) {

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedImageId = island[fieldName];

  return (
    <td className="border p-2">
      {selectedImageId ? (
        <button type="button" onClick={() => setIsPickerOpen(true)} className="block">
          <img src={`/api/images/${selectedImageId}`} alt={island.identifier || "Island image"} className="h-16 w-auto rounded border"/>
        </button>
      ) : (
        <button type="button" onClick={() => setIsPickerOpen(true)} className="flex h-16 w-24 items-center justify-center rounded border text-xs text-gray-500">
          {label}
        </button>
      )}

      {isPickerOpen && (
        <ImagePickerModal
          selectedImageId={selectedImageId}
          onSelect={(imageId) => {
            onUpdate(island._id, fieldName, imageId);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </td>
  );
}