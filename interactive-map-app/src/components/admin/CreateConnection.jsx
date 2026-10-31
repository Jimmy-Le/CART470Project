import { useEffect, useState } from "react";
import IslandThumbnail from "../IslandThumbnail";
import Categories from "./Categories";
import NameInput from "./NameInput";
import DescriptionInput from "./DescriptionInput";


function CreateConnection() {

  const defaultName = "New Connection";
  const [inputtedName, setName] = useState(defaultName);
  const [inputtedDescription, setDesc] = useState("");

  const categories = ["Paths", "Threats", "Communities"];

  return (
      <div className="flex flex-row bg-amber-100 space-x-5">
        <div>
          <Categories />
          <NameInput value="" onChange={(event) => setName(event.target.value)} placeholder={defaultName}/>
        </div>
        {/* Description box */}
        <div>
          <DescriptionInput value="" onChange={(event) => setDesc(event.target.value)} placeholder={"Enter Description"}/>
        </div>
        {/* Delete */}
        <div>

        </div>
          
      </div>
  );
}

// Export using the same name as the Function name.
export default CreateConnection;