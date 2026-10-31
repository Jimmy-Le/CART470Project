import CurvedLineOfImages from "../components/connectionLines";

export default function HomePage() {
    return <div>
        
        <h1>Lines page</h1>
        <CurvedLineOfImages
         start={{ x: 100, y: 150 }}
         control={{ x: 160, y: 600 }}
         end={{ x: 300, y: 850 }}
         src="../../../src/assets/arrow.svg" />
        </div>;
    
}