

import TaskList from "../components/Database";
import CreateConnection from "../components/admin/CreateConnection.jsx";
import App from "../App.jsx"

export default function Admin() {
    return (
        <div>
            <App />
            <CreateConnection />
        </div>

    
    );
}