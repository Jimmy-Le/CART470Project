

function NameInput({value, onChange}) {
  return (
      <input
        type="text"
        value={value}
        onChange={(event)=> onChange(event.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
  );
}

export default NameInput;