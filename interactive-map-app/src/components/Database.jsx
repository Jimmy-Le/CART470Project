import { useEffect, useState } from "react";

/***
 * This function creates an empty Connection Object
 */
function createEmptyConnection(){
	return {
		category: "",
		name: "",
		description: "",
	}
}

/***
 * This function create an Empty Language Template
 */
function createEmptyLanguage(){
	return{
		name: "",
		description:"",
		connections:[createEmptyConnection()],
	}
}


// This function will normalize (set the information in the right position) the data
function normalizeIsland(data) {
  return {
	  ...data,
    _id: data._id,
    identifier: data.identifier ?? "New Island",
    islandImageID: data.islandImageID ?? "",
    imageID: data.imageID ?? "",
    enabled: data.enabled ?? true,
    EN: data.EN ?? createEmptyLanguage(),
    FR: data.FR ?? createEmptyLanguage(),
    IN: data.IN ?? createEmptyLanguage(),
  };
}



export function useDatabase() {
  const[islands,setIslands] = useState([]);
  const[loading, setLoading] = useState(true);

  // Load stored islands
  useEffect(() => {
    async function loadIslands() {
      try {
        const response = await fetch("/api/islands");
        const data = await response.json();
        const normalizedData = data.map(normalizeIsland);

        setIslands(normalizedData);


      } catch (error) {
        console.error(error);
      }  finally {
				setLoading(false);
			}
    }
    loadIslands();
  }, []);

  // This returns the list of islands and wheter or not the islands finished loading
  return ({islands, loading});
}
