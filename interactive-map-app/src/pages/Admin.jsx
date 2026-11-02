import { useState, useEffect, useRef } from "react";

import TaskList from "../components/Database";
import CreateConnection from "../components/admin/CreateConnection.jsx";
import App from "../App.jsx"
import ImagePicker from "../components/admin/ImagePicker.jsx";
import IslandRow from "../components/admin/IslandRow.jsx";
import LanguagePanel from "../components/admin/LanguagePanel.jsx";


function createEmptyConnection(){
	return {
		category: "",
		name: "",
		description: "",
	}
}

function createEmptyLanguage(){
	return{
		name: "",
		description:"",
		connections:[createEmptyConnection()],
	}
}


// This function will normalize (set the information in the right position) the data
function normalizeIsland(data) {
  return {
	...data,
	_id: data._id,
	identifier: data.identifier ?? "New Island",
	islandImageID: data.islandImageID ?? "",
    imageID: data.imageID ?? "",
    enabled: data.enabled ?? true,
    EN: data.EN ?? createEmptyLanguage(),
    FR: data.FR ?? createEmptyLanguage(),
    IN: data.IN ?? createEmptyLanguage(),
  };
}


export default function Admin() {
    const[islands,setIslands] = useState([]);
	const[savedIslands, setSavedIslands] = useState([]);

	const[loading, setLoading] = useState(true);
	const [openIslandId, setOpenIslandId] = useState(null);
	const [panelLanguage, setPanelLanguage] = useState("EN");  
	const fileInputRef = useRef(null);

	// -------------------------------- Images ----------------------------------------
	function handleImageClick() {
		fileInputRef.current?.click();
	}
	async function handleFileChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("image", file);

		const response = await fetch("/api/image", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			alert("Could not upload image.");
			return;
		} else {
			alert("Image is Uploaded!");
		}

	}
	// ----------------------------------------------- Data -----------------------------------

	// Load stored islands
	useEffect(() => {
		async function loadIslands() {
			try {
				const response = await fetch("/api/islands");
				const data = await response.json();
				const normalizedData = data.map(normalizeIsland);

				setIslands(normalizedData);
				setSavedIslands(normalizedData);


			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		loadIslands();
	}, []);

	// This function will add a new empty row (New Island)
	function addRow() {
		const newRow = normalizeIsland({
			identifier: "New Island",
			islandImageID: "",
			imageID: "",
			enabled: true,
		});

		setIslands((prev) => [...prev, newRow]);
	}

	// This function will either add or update a row into the database
	async function saveIsland(island, showAlert = true) {
		const isNew = !island._id;

		const response = await fetch(
			isNew ? "/api/islands" : `/api/islands/${island._id}`,
			{
				method: isNew ? "POST" : "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(island),
			}
		);

		const savedIsland = normalizeIsland(await response.json());
	

		// Update the island list
		setIslands((prev) =>
				prev.map((row) =>
				row === island ? normalizeIsland(savedIsland) : row
			)
		);

		// Update the saved snapshot
		setSavedIslands((prev) => {
			const existingSavedIsland = prev.find(
				(row) => row._id === savedIsland._id
			);

			// Island already existed: replace its snapshot
			if (existingSavedIsland) {
				return prev.map((row) =>
					row._id === savedIsland._id ? savedIsland : row
				);
			}

			// Island was newly created: add its first snapshot
			return [...prev, savedIsland];
		});

		// Send an alert based on response
		if (!response.ok) {
			alert("Could not save island.");
			return false;
		}
		else{
			if(showAlert){
				alert("Save Successful!")
			}
		}

		return true;
	}

	async function saveAllIslands(){
		let success = true;

		for(const island of islands){
			let status = await saveIsland(island, false);
			if(!status)
			{
				success = false;
			}
		}

		if(success)
		{
			alert("All Islands Saved Successfully!")
		}
		else {
			alert("There was an error saving one or more entries.")
		}
		
	}


	/***
	 * This function will update the selected Island's fields
	*/
	function updateIsland(islandId, field, value) {
		setIslands((prev) =>
			prev.map((island) => island._id === islandId ? { ...island, [field]: value } : island)
		);
	}

	/***
	 * This function will update the nested fields
	 */
	function updateLanguage(islandId, language, field, value) {
		setIslands((prev) =>
			prev.map((island) => {
				if (island._id !== islandId) {
					return island;
				}

				return {
					...island,
					[language]: {
					...island[language],
					[field]: value,
					},
				};
			})
		);
	}

	/***
	 * This function will remove any entries from the database that were removed here.
	 */
	async function deleteIsland(island) {
		if (!island._id) {
			// Row was never saved; remove it locally only.
			setIslands((prev) => prev.filter((row) => row !== island));
			return;
		}

		const response = await fetch(`/api/islands/${island._id}`, {
			method: "DELETE",
		});

		if (response.ok) {
			setIslands((prev) => prev.filter((row) => row._id !== island._id));
		} else {
			alert("Could not delete island.");
		}
	}

	function isIslandUnsaved(island){
		const savedIsland = savedIslands.find((row) => row._id === island._id);

		if(!savedIsland)
		{
			return true;
		}

		return (
			JSON.stringify(island) !== JSON.stringify(savedIsland)
		);
	}


	// If the tables are still loading, return a placeholder
	if (loading) {
    	return <p>Loading islands...</p>;
  	}


	// ---------------------------------- Edit Panel ----------------------------------

	function openLanguagePanel(islandId){
		setOpenIslandId(islandId);
		setPanelLanguage("EN");
	}

	function closeLanguagePanel()
	{
		setOpenIslandId(null);
	}

	const openIsland = islands.find((island) => island._id === openIslandId)


	// ----------------------------------- Edit Connections -------------------------------------

	function addConnection(islandId, language) {
		console.log("addConnection islandId:", islandId);
		console.log("addConnection language:", language);

		setIslands((prev) => prev.map((island) => {
			if (island._id !== islandId) {
				return
			}

			return {
				...island,
				[language]: {
					...island[language],
					connections: [
						...island[language].connections,
						{
							category: "",
							name: "",
							description: "",
						}
					]
				}
			}
		}));
	}

	function updateConnection(islandId, language, connectionIndex, field, value){
		setIslands((prev) => prev.map((island) => {
			if(island._id !==islandId){
				return island
			}

			const updatedConnections = island[language].connections.map((connection, index) => index === connectionIndex ? {...connection, [field]: value} : connection);

			return {
				...island,
				[language]: {
					...island[language],
					connections: updatedConnections,
				},
			};
		}))
	}

	function removeConnection(islandId, language, connectionIndex){
		setIslands((prev) => prev.map((island) => {
			if (island._id !== islandId){
				return island;
			}

			const updatedConnections = island[language].connections.filter((_,index)=> index !== connectionIndex);

			return {
				...island,
				[language]: {
					...island[language],
					connections: updatedConnections,
				}
			}
		}))
	}

    return (
		<div className="flex flex-col">
			<App />
			{openIsland && (<LanguagePanel  island={openIsland} language={panelLanguage} onLanguageChange={setPanelLanguage} onUpdateLanguage={updateLanguage} onClose={closeLanguagePanel} onAddConnection={addConnection} onUpdateConnection={updateConnection} onRemoveConnection={removeConnection} />)}
			<div className="flex flex-row justify-end">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className="hidden"
				/>

				<button type="button" onClick={handleImageClick} className="rounded bg-blue-300 p-2 m-1 text-black">
					Upload image
				</button>
				<button type="button" onClick={saveAllIslands} className="rounded bg-green-300 p-2 m-1 text-black">
					Save All
				</button>
				<button className="w-30 self-end flex rounded p-2 m-1 bg-amber-50 justify-center" type="button" onClick={addRow}>
					Add Island
				</button>
			</div>
			<div className="flex-1 overflow-y-auto p-6">
				<table className="w-full border-collapse">
					<thead>
						<tr>
						<th className="border p-2">Island Identifier</th>
						<th className="border p-2">Island Image</th>
						<th className="border p-2">Image</th>
						<th className="border p-2">Enabled</th>
						<th className="border p-2">Edit</th>
						<th className="border p-2">Save</th>
						<th className="border p-2">Delete</th>
						</tr>
					</thead>

					<tbody>
						{islands.map((island, index) => (
						<IslandRow
							key={island._id ?? `new-island-${index}`}
							island={island}
							onUpdate={updateIsland}
							openLanguagePanel={openLanguagePanel}
							onSave={saveIsland}
							onDelete={deleteIsland}
							isDirty = {isIslandUnsaved(island)}
						/>
						))}
					</tbody>
				</table>
			</div>
		</div>    
    );
}
