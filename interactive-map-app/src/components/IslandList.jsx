
function IslandList() {

  const islands = [
    {id: 'i1', name:"Ile Deslauriers"},
    {id: 'i2', name:"Ile Sainte-Helene"},
    {id: 'i3', name:"Ile Notre-Dame"}
  ];


  return (
      <ul className="bg-[#777f8f] w-50 rounded-md p-5 flex flex-col" >
          {islands.map((island) => (
            <li key ={island.id} className="text-left pl-5 text-[#000000]"> {island.name} </li>
          ))}
      </ul>
  );
}

// Export using the same name as the Function name.
export default IslandList;