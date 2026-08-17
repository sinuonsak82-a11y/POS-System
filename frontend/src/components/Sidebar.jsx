import { NavLink } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="brand">POS · Digital Payment</div>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
      <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
      <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>Categories</NavLink>
      <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>Inventory</NavLink>
      <NavLink to="/suppliers" className={({ isActive }) => isActive ? 'active' : ''}>Suppliers</NavLink>
      <NavLink to="/purchase-orders" className={({ isActive }) => isActive ? 'active' : ''}>Purchase Orders</NavLink>
      {user?.role === 'Admin' && (
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink>
      )}
      <NavLink to="/change-password" className={({ isActive }) => isActive ? 'active' : ''}>Change Password</NavLink>
    </div>
  );
}
