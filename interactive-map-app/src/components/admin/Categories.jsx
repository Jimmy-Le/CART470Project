import { useEffect, useState } from "react";

const connections = [
  { id: "red", name: "Threats"},
  { id: "yellow", name: "Communities"},
  { id: "green", name: "Paths"},
];

function Categories() {
  const [selectedConnection, setSelectedConnection] = useState("");

  return (
    <select value={selectedConnection} onChange={(event) => setSelectedConnection(event.target.value)}>
      <option value="">Select a Category</option>

      {connections.map((connection) => (
        <option key={connection.id} value={connection.name}>
          {connection.name}
        </option>
      ))}
    </select>
  );
}

export default Categories;