import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';
import axiosClient from '../api/axiosClient.js';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axiosClient.post('/auth/logout.php');
    logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <h2>{title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user?.fullName} · {user?.role}</span>
        <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
