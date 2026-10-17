
function Tag({tagColor, tagName}) {

  return (
      <div className="flex flex-row space-x-1 items-center">
          <div className="rounded-full w-2 h-2 " style={{backgroundColor: tagColor}}></div>
          <p>{tagName}</p>
          
      </div>
  );
}

// Export using the same name as the Function name.
export default Tag;