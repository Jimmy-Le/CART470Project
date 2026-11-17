function AudioPlayer({ audioModelData }) {
  // audioModelData represents the Mongoose document you saved earlier.
  // Example: { _id: "...", name: "Theme", gridFsId: "654321..." }

  if (!audioModelData) return <p>No audio available</p>;

  // Construct the URL pointing to the GET route you just made
  // Adjust the "/api/upload-audio" base path if you mounted it differently in server.mjs
  const audioStreamUrl = `/api/audio/${audioModelData.gridFsId}`;

  return (
    <div>
      <h3>{audioModelData.name}</h3>
      
      {/* The browser will automatically hit your GET route and stream the chunks */}
      <audio controls src={audioStreamUrl}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;