import ConnectionTable from "./ConnectionTable";
import NameInput from "./NameInput";
import DescriptionInput from "./DescriptionInput";
import Categories from "./Categories";

const categories = [ 
	{label: "Threat", value: "Threat"},
	{label: "Paths", value: "Paths"},
	{label: "Communities", value: "Communities"},
];




export default function LanguagePanel({island, language, onLanguageChange, onUpdateLanguage, onClose, onAddConnection, onUpdateConnection, onRemoveConnection}){
	const availableLanguages = ["EN", "FR", "IN"];


	const languageData = island[language] ?? {
		name: "",
		description: "",
		connections: [],
	};

	return (
		<div className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className ="flex flex-col space-y-2 w-full rounded-lg bg-white p-6 max-w-6xl max-h-[90vh] ">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold">
						{island._id} - {language}
					</h2>

					<button type="button" onClick={onClose}>
						Close
					</button>
				</div>
				<div className="mt-4 flex gap-2">
					{availableLanguages.map((lang) => (
						<button key={lang} type="button" onClick={() => onLanguageChange(lang)} 
							className={`rounded border px-3 py-1 ${language === lang ? "bg-blue-600 text-white" : "bg-white"}`}>
								{lang}
							</button>
					))}
				</div>

				<label className="mt-4 flex flex-col">
					<label className="text-left p-1">Island Name</label>
					<input className="rounded-lg border border-gray-300 px-3 py-2 text-left w-50" value={languageData.name} onChange={(event) => onUpdateLanguage(island._id, language, "name", event.target.value)}/>
				</label>

				<label className="mt-4 flex flex-col">
					<label className="text-left p-1">Description</label>
					<textarea className="rounded-lg border border-gray-300 p-3" value={languageData.description} onChange={(event) => onUpdateLanguage(island._id, language, "description", event.target.value)}/>
				</label>

				<div className="flex-1 overflow-y-auto p-6">
					<ConnectionTable connections={languageData.connections} islandId={island._id} language={language} categories={categories} onAddConnection={onAddConnection} onUpdateConnection={onUpdateConnection} onRemoveConnection={onRemoveConnection}/>				
				</div>
				<button type="button" onClick={onClose} className="w-50 mt-6 rounded bg-blue-600 px-4 py-2 text-white self-end">
					Done
				</button>

			</div>
		</div>
	);


}