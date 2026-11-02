import ImagePicker from "./ImagePicker";
import ImageCell from "./ImageCell";


export default function IslandRow({island, onUpdate, openLanguagePanel, onSave, onDelete, isDirty }) {
	return (
		// Table Row
		<tr className ={isDirty ? "bg-yellow-50" : ""}>
			{/* Island Identifier */}
			<td className="border p-2">
				<input
				value={island.identifier}
				onChange={(event) =>
					onUpdate(island._id, "identifier", event.target.value)
				}
				/>
			</td>

			<ImageCell island={island} onUpdate={onUpdate} fieldName="islandImageID" label="Choose Island Image"/>
			<ImageCell island={island} onUpdate={onUpdate} fieldName="imageID" label="Choose Island Image"/>


			{/* Image
			<td className="border p-2">
				{island.imageID && ( <img src={`/api/images/${island.imageID}`} alt={island.identifier || "Selected island image"} className="mb-2 h-16 w-auto rounded border"/>)}
				<ImagePicker selectedImageId={island.imageID} onSelect={(imageId)=> onUpdate(island._id, "imageID", imageId)}/>
			</td> */}

			{/* Enabled  */}
			<td className="border p-2 text-center">
				<input type="checkbox" checked={island.enabled}
					onChange={(event) =>
						onUpdate(island._id, "enabled", event.target.checked)
					}
				/>
			</td>

			{/* Edit */}
			<td className="border p-2">
				<button className="bg-blue-300 rounded py-1 px-3 text-black" type="button" onClick={() => openLanguagePanel(island._id)}>
					Edit
				</button>
			</td>


			{/* Save*/}
			<td className="border p-2">
				<button className="bg-green-300 rounded py-1 px-3 text-black" type="button" onClick={() => onSave(island)}>
					Save
				</button>
			</td>

			{/*Delete Button */}
			<td className="border p-2">
				<button className="bg-red-400 rounded py-1 px-3 text-black" type="button" 
					onClick={() => {
						const confirmed = window.confirm(
							"Are you sure you want to delete this island? This cannot be undone."
						);

						if(confirmed){
							onDelete(island);
						}
					}}>
					
					Delete
				</button>
			</td>
		</tr>
	);
}