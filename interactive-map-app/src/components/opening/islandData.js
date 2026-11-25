// Temporary technical test data: approximate marker positions, not island boundaries.
// Small-island coordinates: Natural Resources Canada place-name records EHZKE / EHLDH.
export const testIslands = [
    {
        id: 'montreal',
        name: 'Île de Montréal',
        coordinates: [-73.65, 45.52],
        labelPosition: 'left',
        labelOffset: [-4, -10],
        designGroup: 'inner',
        verificationNote: 'Existing approximate test marker position; preserved unchanged.'
    },
    {
        id: 'sainte-helene',
        name: 'Île Sainte-Hélène',
        coordinates: [-73.534202, 45.513666],
        labelPosition: 'above',
        labelOffset: [4, -8],
        designGroup: 'inner',
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EHZKE',
        verificationNote: 'CGNDB EHZKE reference point; existing coordinates preserved.'
    },
    {
        id: 'notre-dame',
        name: 'Île Notre-Dame',
        coordinates: [-73.527388, 45.508233],
        labelPosition: 'below-left',
        labelOffset: [-4, 0],
        designGroup: 'inner',
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EHLDH',
        verificationNote: 'CGNDB EHLDH reference point; existing coordinates preserved.'
    },
    {
        id: 'perrot', name: 'Île Perrot',
        coordinates: [-73.943416, 45.372402],
        labelPosition: 'below', designGroup: 'outer',
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EHPKS',
        verificationNote: 'Approved CGNDB EHPKS island reference point, not the municipality.'
    },
    {
        id: 'bizard', name: 'Île Bizard',
        coordinates: [-73.89851, 45.49404],
        labelPosition: 'left', designGroup: 'outer',
        sourceUrl: 'https://toponymie.gouv.qc.ca/ct/ToposWeb/Fiche.aspx?no_seq=5905',
        verificationNote: 'Approved Québec record 5905 island reference point, not the borough.'
    },
    {
        id: 'jesus', name: 'Île Jésus',
        coordinates: [-73.7233333, 45.6105556],
        labelPosition: 'above', designGroup: 'outer',
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EGTTB',
        verificationNote: 'Approved CGNDB EGTTB island reference point in Laval.'
    },
    {
        id: 'sainte-therese', name: 'Île Sainte-Thérèse',
        coordinates: [-73.4702778, 45.6816667],
        labelPosition: 'above', designGroup: 'outer',
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EHZQU',
        verificationNote: 'Approved Varennes island, not the Saint-Jean-sur-Richelieu namesake.'
    },
    {
        id: 'saint-laurent', name: 'Île Saint-Laurent',
        coordinates: [-73.44916, 45.72224],
        labelPosition: 'above', designGroup: 'outer',
        sourceUrl: 'https://toponymie.gouv.qc.ca/ct/ToposWeb/Fiche.aspx?no_seq=57037',
        verificationNote: 'Approved Québec record 57037: the Repentigny island.'
    },
    {
        id: 'charron', name: 'Île Charron',
        coordinates: [-73.48306, 45.58361],
        labelPosition: 'above', designGroup: 'outer',
        sourceUrl: 'https://toponymie.gouv.qc.ca/ct/ToposWeb/Fiche.aspx?no_seq=12559',
        verificationNote: 'Approved Longueuil island reference point, not the weather station.'
    },
    {
        id: 'visitation', name: 'Île de la Visitation',
        coordinates: [-73.6611111, 45.5794444],
        labelPosition: 'left', designGroup: 'inner',
        labelOffset: [-4, 0],
        sourceUrl: 'https://geonames.nrcan.gc.ca/search-place-names/unique?id=EILVA',
        verificationNote: 'Approved CGNDB EILVA island reference point in Montréal.'
    },
    {
        id: 'soeurs',
        name: 'Île des Sœurs',
        coordinates: [-73.54723, 45.46075],
        labelPosition: 'bottom',
        designGroup: 'inner',
        sourceUrl: 'https://toponymie.gouv.qc.ca/ct/ToposWeb/Fiche.aspx?no_seq=60147',
        verificationNote: 'Approved C5.5-F island; coordinates verified against Québec record 60147.'
    },
    {
        id: 'dorval',
        name: 'Île Dorval',
        coordinates: [-73.74168, 45.43221],
        labelPosition: 'bottom',
        labelOffset: [-8, -8],
        designGroup: 'outer',
        verificationNote: 'Approved C5.5-F bridge island; coordinates supplied for C5.5-E.'
    }
];
