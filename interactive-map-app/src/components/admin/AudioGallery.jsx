// src/components/AudioGallery.jsx
import { useState, useEffect } from 'react';

function AudioGallery({selectedAudioId, onSelect, onClose,}) {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the list of audio metadata when the component mounts
    async function fetchAudios() {
      try {
        const response = await fetch('/api/audio');
        
        if (!response.ok) {
          throw new Error('Failed to fetch audio list');
        }

        const data = await response.json();
        setAudios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAudios();
  }, []);

  if (loading) return <div>Loading audio files...</div>;
  if (error) return <div>Error: {error}</div>;
  if (audios.length === 0) return <div>No audio files found in the database.</div>;

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

                {loading ? (<p>Loading Audio...</p>) : audios.length === 0 ? (<p className="text-gray-500">No sounds available. Upload a sound first.</p>) : 
                (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {audios.map((audio) => {
                        const isSelected = audio.gridFsId === selectedAudioId;

                        return (

                            <button key={audio.gridFsId} type="button" onClick={() =>{console.log("Audio Selected:", audio.gridFsId); onSelect(audio)}} className={`rounded-lg border-4 p-1 ${isSelected ? "border-blue-500": "border-transparent"}`}>
                                <p className="mt-1 truncate text-xs text-gray-600">
                                    {audio.name}
                                </p>
                                
                                <audio controls src={`/api/audio/${audio.gridFsId}`} style={{ width: '100%', maxWidth: '400px' }}>
                                    Your browser does not support the audio element.
                                </audio>
            
                            </button>
                        );
                    })}
                </div>
                )}
            </div>
        </div>
  );
}

export default AudioGallery;