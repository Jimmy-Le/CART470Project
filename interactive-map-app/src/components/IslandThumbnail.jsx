
function IslandThumbnail({image}) {

  // Put HTML in here. Whatever is in here will render on screen when the component is called.
  // Variables are called using {variable_name}
  return (
      <img src={image} className= " w-20 h-10 bg-amber-50 rounded-xl"/>
  );
}

// Export using the same name as the Function name.
export default IslandThumbnail;