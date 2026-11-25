
import languageIcon from '../assets/languageIcon.svg';
import backIcon from '../assets/backIcon.svg';
import dropDownIcon from '../assets/dropDownIcon.svg';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const islands = [
  { id: 'i1', name: 'Ile Deslauriers' },
  { id: 'i2', name: 'Ile Sainte-Helene' },
  { id: 'i3', name: 'Ile Notre-Dame' },
  { id: 'i4', name: 'Ile Meow'},
  { id: 'i5', name: 'Ile Meow'},
  { id: 'i6', name: 'Ile Meow'},
  { id: 'i7', name: 'Ile Meow'},
  { id: 'i8', name: 'Ile Meow'},
  { id: 'i9', name: 'Ile Meow'},
  { id: 'i10', name: 'Ile Meow'},
  { id: 'i11', name: 'Ile Meow'},
  { id: 'i12', name: 'Ile Meow'},
  { id: 'i13', name: 'Ile Meow'},
  { id: 'i14', name: 'Ile Meow'},
  { id: 'i15', name: 'Ile Meow'}

];

export default function IslandList({ activeIsland, onSelect }) {
//dropdown toggle
const [isOpen, setIsOpen] = useState(true);

let listOfClassNames = "IslandListDiv"

if(isOpen == false){
  listOfClassNames = "IslandListDiv IslandListDivClosed";
}

  return <div className={listOfClassNames}>
    <div className="flex justify-between m-2">
      <NavLink to="/Intro" className="ml-5 m-auto flex introLink"><img src={backIcon} alt="Back to" className = "w-3"/>Intro</NavLink>
      <img src={languageIcon} alt="Language" className = "w-5"/>
      <select className="languagePicker" defaultValue="EN">
        <option value="FR">FR</option>
        <option value="EN">EN</option>
        <option value="KA">KA</option>
      </select>
    </div>
    <ul className="team-island-list-items">
    <h2 className="whitespace-nowrap">List of Islands</h2>
    {islands.map(island => <li key={island.id}>
      <button type="button" aria-pressed={activeIsland === island.id}
        onClick={() => onSelect?.(island.id, island.name)}>{island.name}</button>
    </li>)}
  </ul>
  <div className="flex flex-row-reverse"><NavLink to="/Credits" className="mr-3 text-black creditsLink mt-2">Credits</NavLink></div>
  <button className="IslandListToggle w-1/1" onClick={() => setIsOpen(open => !open)}><img src={dropDownIcon} alt="Open Island List" className = "w-5 m-auto"/></button>
  </div>;
}
