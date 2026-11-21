import island from "../assets/blue.png"
import sound from "../assets/audio/seagulls.mp3"
import { useRef, useState } from "react"
import svgIsland from "../assets/green.png"



// TODO: Use Image and Audio from database
function IslandComponent() {

  let audio;
  let islandName;
  let islandWatercolor;
  let islandSVG;
  const [displayImage, setDisplayImage] = useState(islandWatercolor);

  function constructor(map,audio, islandWatercolor,islandSVG, coord, islandName){
    this.audio = audio;
    this.islandName = islandName;
    this.islandWatercolor = islandWatercolor;
    this.islandSVG = islandSVG;
  }
  
  
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

  function toggleIslandFocus(){
    //switches to the opposite image when clicked
    setDisplayImage((current) => current === island ? svgIsland : island);
  }


  return (
      <div className="fixed top-1/3 place-self-center">
        
        <a className="island-blue" onMouseEnter={playAudio} onMouseLeave={pauseAudio} onClick={toggleIslandFocus}> {/*href="https://wastescapes.com/as-the-gull-flies/"*/}
          <img src={displayImage} alt="blue watercolor painting"/> 
          <p>{islandName}</p>
        </a>
        <audio id="hoverAudio" src={sound} loop></audio>
        <div id="focusedJustIsland"></div>
      </div>
      
  );
}

// Export using the same name as the Function name.
export default IslandComponent;