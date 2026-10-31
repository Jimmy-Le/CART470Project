

function DescriptionInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={6}
        className="rounded-lg border border-gray-300 p-3"
      />
    </label>
  );
}

export default DescriptionInput;