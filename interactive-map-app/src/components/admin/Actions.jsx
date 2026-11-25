import ActionButton from "./ActionButton";

function Actions({onSave, onDelete, onEdit, island}) {
    const saveButtonColor = "bg-[#587D32]";
    const editButtonColor = "bg-[#C3AC80]";
    const deleteButtonColor = "bg-[#C38080]";

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <div className="flex flex-col gap-1 " >
            {/* Save */}
            <ActionButton color={saveButtonColor} text="Save" action={onSave} data={island} />
            {/* Edit */}
            <ActionButton color={editButtonColor} text="Edit" action={onEdit} data={island._id} />
            {/* Delete */}
            <ActionButton color={deleteButtonColor} text="Delete" action={onDelete} data={island} hasConfirmation={true} confirmationMessage="Are you sure you want to delete this island? This cannot be undone." />
      </div>
  );
}

// Export using the same name as the Function name.
export default Actions;