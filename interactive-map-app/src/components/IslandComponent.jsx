import island from "../assets/blue.png"
import sound from "../assets/audio/seagulls.mp3"
import { useRef, useState } from "react"
import svgIsland from "../assets/green.png"



// TODO: Use Image and Audio from database
function IslandComponent({
  //props received by the parent (in this case, mapLeaflet)
  audioClip = sound,
  islandName = "placeholder",
  islandWatercolor = island,
  islandSVG = svgIsland,
  imageSize,
 

}) {

const [displayImage, setDisplayImage] = useState([island]);

 const audio = useRef(null);
  
  
  function playAudio()
  {
    if(!audio.current)
    {
      audio.current = new Audio(audioClip);
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

  function toggleIslandFocus(){
    //switches to the opposite image when clicked
    setDisplayImage((current) => current === islandWatercolor ? islandSVG : islandWatercolor);
  }

  let resizeImage = "w-" + imageSize;

  return (
      <div>
        
        <a className="island-blue relative text-center" onMouseEnter={playAudio} onMouseLeave={pauseAudio} onClick={toggleIslandFocus}> {/*href="https://wastescapes.com/as-the-gull-flies/"*/}
          <img src={displayImage} alt="blue watercolor painting"/> 
          <p className="absolute top-1/2 left-1/2">{islandName}</p>
        </a>
        <audio id="hoverAudio" src={audio} loop></audio>
        <div id="focusedJustIsland"></div>
      </div>
      
  );
}

// Export using the same name as the Function name.
export default IslandComponent;