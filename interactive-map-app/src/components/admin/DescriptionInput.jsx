

function DescriptionInput({value, onChange}) {
  return (
    <label className="flex flex-col gap-1 ">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="rounded-lg border border-gray-300 p-3"
      />
    </label>
  );
}

export default DescriptionInput;