import ImagePicker from "./ImagePicker";
import ImageCell from "./ImageCell";
import AudioCell from "./AudioCell";




export default function IslandRow({island, onUpdate, onUpdateNested, openLanguagePanel, onSave, onDelete, isDirty }) {
	return (
		// Table Row
		<tr className ={isDirty ? "bg-yellow-50" : ""}>

			{/* Enabled  */}
			<td className="border p-2 text-center">
				<input type="checkbox" checked={island.enabled}
					onChange={(event) =>
						onUpdate(island._id, "enabled", event.target.checked)
					}
				/>
			</td>

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
			<AudioCell island={island} onUpdate={onUpdateNested} fieldName="audio" label="Choose Island Audio"/>

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