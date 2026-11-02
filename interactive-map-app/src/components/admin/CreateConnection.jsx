import { useEffect, useState } from "react";
import IslandThumbnail from "../IslandThumbnail";
import Categories from "./Categories";
import NameInput from "./NameInput";
import DescriptionInput from "./DescriptionInput";


function CreateConnection( {connection, index, islandId, language, categories, onUpdateConnection, onRemoveConnection}) {

  const defaultName = "New Connection";
  const [inputtedName, setName] = useState(defaultName);
  const [inputtedDescription, setDesc] = useState("");

  function updateField(field, value){
	onUpdateConnection(islandId, language, index, field, value);
  }

  return (
      	<tr>
			{/* Island ID */}
			<td className="border p-2">
				<Categories value={connection.category} options={categories} onChange={(value) => updateField("category", value)}/>
			</td>

			<td className="border p-2">
				<NameInput value={connection.name} onChange={(value)=> updateField("name", value)}/>
			</td>
			<td className="border p-2">
				<DescriptionInput value={connection.description} onChange={(value)=> updateField("description", value)}/>
			</td>

			<td className="border p-2">
				<button className="bg-red-400 rounded py-1 px-3 text-black" type="button" onClick={() => {
						const confirmed = window.confirm(
							"Are you sure you want to delete this connection? This cannot be undone."
						);

						if(confirmed)
						{
							onRemoveConnection(islandId, language, index)
						}
					}}>
					Remove
				</button>
			</td>

      	</tr>
 	);
}

// Export using the same name as the Function name.
export default CreateConnection;