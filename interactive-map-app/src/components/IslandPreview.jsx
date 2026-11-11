
import Tag from "./Tag.jsx";
import IslandThumbnail from "./IslandThumbnail.jsx";

import blueIsland from "../assets/blue.png";
import testIsland from "../assets/TestIsland.png";

function IslandPreview({ onClose }) {

  const title = "Seagull Island";

  const tags = [
    {id: "t1", color: "#D87174", name: "Threats"},
    {id: "t2", color: "#EAA071", name: "Paths"},
    {id: "t3", color: "#655687", name: "Community"}
  ];

  // TODO: Fetch images from database
  const images = [
    {id: "p1", link: blueIsland},
    {id: "p2", link: testIsland},
    {id: "p3", link: blueIsland}
  ]

  return (
      <div className="team-preview-card rounded-xl w-75 flex flex-col justify-center z-10">
          <button type="button" className="team-preview-close" aria-label="Close island preview" onClick={onClose}>×</button>
          <h2>{title}</h2>
          <ul className="flex flex-row space-x-2 ml-5 text-sm">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Tag tagColor={tag.color} tagName={tag.name} />
              </li>
            ))}
          </ul>
          <ul className="flex flex-row space-x-2 ml-5">
            {images.map((photo) => (
              <li key={photo.id}>
                <IslandThumbnail image={photo.link} />  
              </li>
            ))}
          </ul>
          <a href="#island-information" className="text-black text-xs text-right mr-8 mt-2 mb-7 hover:text-[#885304]"> More Details &gt;</a>
      </div>   
  );
}

// Export using the same name as the Function name.
export default IslandPreview;