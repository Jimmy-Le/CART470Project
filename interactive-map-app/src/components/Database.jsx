import { useEffect, useState } from "react";

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