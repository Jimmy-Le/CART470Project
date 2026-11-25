function AudioPlayer({ audioModelData }) {
  // audioModelData now comes from listAudioFromDrive() or your Island document
  // Example: { _id: "1aBcD...", driveFileId: "1aBcD...", name: "Theme.mp3", mimeType: "audio/mpeg" }

  if (!audioModelData) return <p>No audio available</p>;

  // Support either a full Drive object ({ driveFileId }) or a raw Drive ID string
  const fileId =
    typeof audioModelData === "string"
      ? audioModelData
      : audioModelData.driveFileId || audioModelData._id;

  if (!fileId) return <p>No audio available</p>;

  const audioStreamUrl = `/api/audio/${fileId}`;

  return (
    <div>
      {audioModelData.name && <h3>{audioModelData.name}</h3>}

      <audio controls preload="metadata" src={audioStreamUrl}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;