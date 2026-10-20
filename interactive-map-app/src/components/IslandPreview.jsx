
import Tag from "./Tag.jsx";
import IslandThumbnail from "./IslandThumbnail.jsx";

import blueIsland from "../assets/blue.png";
import testIsland from "../assets/TestIsland.png";

function IslandPreview() {

  const title = "Seagull Island";

  const tags = [
    {id: "t1", color: "#f28f1d", name: "Seagulls"},
    {id: "t2", color: "#4a2101", name: "Pollution"},
    {id: "t3", color: "#22AAFF", name: "Human"}
  ];

  // TODO: Fetch images from database
  const images = [
    {id: "p1", link: blueIsland},
    {id: "p2", link: testIsland},
    {id: "p3", link: blueIsland}
  ]

  return (
      <div id="focusedJustIsland" className="bg-amber-100 rounded-xl w-75 flex flex-col justify-center pb-3 z-10">
          <p className="p-1 text-black font-bold">{title}</p>
          <ul className="flex flex-row space-x-3 justify-center">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Tag tagColor={tag.color} tagName={tag.name} />
              </li>
            ))}
          </ul>
          <ul className="flex flex-row space-x-3.5 justify-center">
            {images.map((photo) => (
              <li key={photo.id}>
                <IslandThumbnail image={photo.link} />  
              </li>
            ))}
          </ul>
          <hr className="my-3 mt-10" />
          <a href="" className="text-orange-400 ">More Details</a>
      </div>   
  );
}

// Export using the same name as the Function name.
export default IslandPreview;