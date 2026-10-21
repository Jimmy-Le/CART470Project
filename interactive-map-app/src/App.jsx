import { Outlet, NavLink } from 'react-router-dom'

import './App.css'


/***
 * This will make the navigation bar. 
 * Add this component to the top of each of your pages if you want the navigation bar
 * 
 * To add a new item,
 * <NavLink to="/[PATHNAME]"> [ButtonName] </NavLink>
 */
function App() {

  return (
    <div>
      <nav className='space-x-5'>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/Lines">Lines</NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

export default App
