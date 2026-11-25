import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './App.css';
import './presentation-theme.css';

export default function App() {
  const { pathname } = useLocation();
  const page = pathname.toLowerCase() === '/admin' ? 'admin' : pathname.toLowerCase() === '/lines' ? 'lines' : 'home';
  return (
    <div className="atlas-shell" data-page={page}>
      <nav className="atlas-nav" aria-label="Main navigation">
        <NavLink to="/islands" end>Home</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/Lines">Lines</NavLink>
        <NavLink to="/"> Water Map</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
