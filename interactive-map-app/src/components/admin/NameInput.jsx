

function NameInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      {label}

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

export default NameInput;