import ImagePicker from "./ImagePicker";
import ImageCell from "./ImageCell";
import AudioCell from "./AudioCell";
import ActionsMenu from "./ActionsMenu";
import {useState} from "react";
import {createPortal} from "react-dom";
import ImageHub from "./ImageHub";



export default function IslandRow({island, onUpdate, onUpdateNested, openLanguagePanel, onSave, onDelete, isDirty }) {
	const [isImageSetterOpen, setIsImageSetterOpen] = useState(false);

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
			
			{/* Image Stuff */}
			<td>
				<button className="cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-[#7AA389] transition" type="button" onClick = {()=>setIsImageSetterOpen(true)}>
					<img className="w-24 h-14 object-cover" src={`/api/images/${island.islandImageID}`} alt={island.identifier}/>
				</button>
			
			
				{/* Images Popup */}
				{isImageSetterOpen && 
				createPortal(
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setIsImageSetterOpen(false)}>
						<div className="bg-[#F7F5EE] border border-stone-300 p-5 rounded-xl shadow-2xl" onClick = {(e) => e.stopPropagation()}>
							<ImageHub island={island} onUpdate={onUpdate}/>
						</div>
					</div>,
					document.body
				)}
			</td>
		
			<AudioCell island={island} onUpdate={onUpdateNested} fieldName="audio" label="Choose Island Audio"/>

			{/*Actions Button */}
			<td className="border p-2">
				<ActionsMenu onSave={onSave} onDelete={onDelete} onEdit={openLanguagePanel} island={island} />
			</td>
		</tr>
	);
}