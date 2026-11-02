import { useEffect, useState } from "react";

import CreateConnection from "./CreateConnection";

const connections = [
  { id: "red", name: "Threats"},
  { id: "yellow", name: "Communities"},
  { id: "green", name: "Paths"},
];

function ConnectionTable({connections, islandId, language, categories, onAddConnection, onRemoveConnection, onUpdateConnection}) {

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
          <th className="border p-2">Category</th>
          <th className="border p-2">Name</th>
          <th className="border p-2">Description</th>
          <th className="border p-2">Remove</th>
          </tr>
        </thead>

        <tbody>
          {connections.map((connection, index) => (
            <CreateConnection key={index} index={index} connection={connection} islandId={islandId} language={language} categories={categories} onUpdateConnection={onUpdateConnection} onRemoveConnection={onRemoveConnection}/>
          ))}
          
        </tbody>
      </table>
      <button type="button" onClick={() => onAddConnection(islandId, language)} className="mt-3 rounded bg-blue-600 px-4 py-2 text-white">
        Add Connection
      </button>
    </div>
    
  );
}

export default ConnectionTable;