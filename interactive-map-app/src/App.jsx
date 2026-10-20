

import { Outlet, NavLink } from 'react-router-dom'

import './App.css'

function App() {

  return (
    <div>
      <nav className='space-x-5'>
        <NavLink to="/">Home</NavLink>
        {/* <NavLink to="/islands">Islands</NavLink> */}
        <NavLink to="/admin">Admin</NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

export default App
