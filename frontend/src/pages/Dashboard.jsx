import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    axiosClient.get('/api/dashboard.php').then((res) => setStats(res.data.data));
    axiosClient.get('/api/inventory.php', { params: { lowStock: '1' } }).then((res) => setLowStock(res.data.data));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Dashboard" />
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total Products</div>
            <div className="value">{stats?.totalProducts ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="label">Categories</div>
            <div className="value">{stats?.totalCategories ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="label">Active Employees</div>
            <div className="value">{stats?.activeEmployees ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="label">Inactive Products</div>
            <div className="value">{stats?.inactiveProducts ?? '—'}</div>
          </div>
        </div>
        {lowStock.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 24 }}>
            <h3>Low Stock Alert</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
              {lowStock.length} product(s) at or below reorder level.
            </p>
            <table>
              <thead><tr><th>Product</th><th>On Hand</th><th>Reorder Level</th></tr></thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.ProductID}>
                    <td>{p.ProductName}</td>
                    <td className="mono">{p.QuantityOnHand}</td>
                    <td className="mono">{p.ReorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <h3>Sprint 2 Status</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Product & Inventory complete: suppliers, purchase orders (with receiving), stock in/out/transfer/adjustment, low-stock tracking, and CSV import/export are live. Sprint 3 (Sales) is next.
          </p>
        </div>
      </div>
    </div>
  );
}
