import ImageCell from "./ImageCell";



export default function ImageHub({island, onUpdate }) {

	return (
		<table className="w-full border-collapse">
			<thead>
				<tr>
					<th className="border p-2">Island Image</th>
					<th className="border p-2">Island SVG</th>
					<th className="border p-2">Decoration</th>
					<th className="border p-2">Main Image</th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<ImageCell island={island} onUpdate={onUpdate} fieldName="islandImageID" label="Choose Island Image"/>
					<ImageCell island={island} onUpdate={onUpdate} fieldName="svgImageID" label="Choose Island Image"/>
					<ImageCell island={island} onUpdate={onUpdate} fieldName="decorationImageID" label="Choose Island Image"/>
					<ImageCell island={island} onUpdate={onUpdate} fieldName="imageID" label="Choose Island Image"/>
				</tr>
			</tbody>
		</table>
	);
}