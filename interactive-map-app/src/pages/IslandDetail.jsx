import { useState, useEffect, useRef } from "react";

import App from "../App.jsx"




export default function IslandDetail({island}) {
    return (
		<div>
			<App />
			<p>
				{island}
			</p>
		</div>
    );
}
