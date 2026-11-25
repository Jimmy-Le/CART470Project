

/***
 * 
 */
function ActionButton({color, text, action, hasConfirmation = false, confirmationMessage = "", data}) 
{
  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
    <button className={`rounded py-1 px-3 text-black ${color}`} type="button"
      onClick={() => {
        let confirmed;
        if(hasConfirmation){
          confirmed = window.confirm(confirmationMessage);
        }
        else {
          confirmed = true;
        }

        if (confirmed) {
          action(data);
        }
      }}
    >
      {text}
    </button>
  );
}

// Export using the same name as the Function name.
export default ActionButton;
