import { useEffect, useState } from "react";
import reactImg from '../assets/react.svg';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/tasks")
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, []);

  async function addTask() {
    const response = await fetch("http://localhost:3001/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const newTask = await response.json();
    setTasks([newTask, ...tasks]);
    setText("");
  }

  return (
    <div>
      <div>
        <h1>
          Hochelaga Archipelago Interactive Map
        </h1>
        <p>Currently a work in progress!</p>
        <img src={reactImg} className="base" width="170" height="179" alt="" />
      
      </div>
      <br></br>
      <hr></hr>
      <h2>Database Entries</h2>
      <label>
        Test out the database: &nbsp;
      </label>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;