import { useState } from "react";
import ImagePickerModal from "./ImagePickerModal";
import AudioGallery from "./AudioGallery";
import AudioPlayer from "./AudioPlayer";

export default function AudioCell({island, onUpdate, fieldName, label = "Choose Audio"}) {

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedAudioId = island[fieldName];

  return (
    <td className="border p-2">
      {selectedAudioId ? (
        <button type="button" onClick={() => setIsPickerOpen(true)} className="block">
          <AudioPlayer audioModelData={selectedAudioId}/>
        </button>
      ) : (
        <button type="button" onClick={() => setIsPickerOpen(true)} className="flex h-16 w-24 items-center justify-center rounded border text-xs text-gray-500">
          {label}
        </button>
      )}

      {isPickerOpen && (
        <AudioGallery
          selectedAudioId={selectedAudioId}
          onSelect={(audioId) => {
            onUpdate(island._id, "audio","gridFsId", audioId.gridFsId);
            onUpdate(island._id, "audio", "name", audioId.name)
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </td>
  );
}