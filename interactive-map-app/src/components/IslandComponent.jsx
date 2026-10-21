import island from "../assets/blue.png"
import sound from "../assets/audio/seagulls.mp3"
import {useRef } from "react";

// TODO: Use Image and Audio from database
function IslandComponent() {
  const audio = useRef(null)

  

  function playAudio()
  {
    if(!audio.current)
    {
      audio.current = new Audio(sound);
    }
    audio.current.play();
  }

  function pauseAudio()
  {
    if(audio.current)
    {
      audio.current.pause();
      audio.currentTime = 0;
    }
  }

  function togglePreview()
  {
    let islandPreviewClass = document.getElementById("focusedJustIsland")
    if(islandPreviewClass.style.display == "none"){
      islandPreviewClass.style.display = "flex";
    }
    else{
      islandPreviewClass.style.display = "none";
    }
  }

  return (
      <div className="fixed top-1/3 place-self-center">
        
        <a className="island-blue" onMouseEnter={playAudio} onMouseLeave={pauseAudio} onClick={togglePreview}> {/*href="https://wastescapes.com/as-the-gull-flies/"*/}
          <img src={island} alt="blue watercolor painting"/> 
        </a>
        <audio id="hoverAudio" src={sound} loop></audio>
        <div id="focusedJustIsland"></div>
      </div>
      
  );
}

// Export using the same name as the Function name.
export default IslandComponent;