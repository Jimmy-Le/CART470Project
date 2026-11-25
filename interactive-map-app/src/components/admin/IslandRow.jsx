import ImagePicker from "./ImagePicker";
import ImageCell from "./ImageCell";
import AudioCell from "./AudioCell";
import ActionsMenu from "./ActionsMenu";




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

			{/*Actions Button */}
			<td className="border p-2">
				<ActionsMenu onSave={onSave} onDelete={onDelete} onEdit={openLanguagePanel} island={island} />
			</td>
		</tr>
	);
}