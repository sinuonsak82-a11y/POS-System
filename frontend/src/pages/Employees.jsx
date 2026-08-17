import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

const emptyForm = {
  userId: null, username: '', password: '', fullName: '',
  email: '', phone: '', roleId: '2', status: 'Active'
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    axiosClient.get('/api/employees.php').then((res) => setEmployees(res.data.data));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setForm({
      userId: emp.UserID, username: emp.Username, password: '',
      fullName: emp.FullName, email: emp.Email, phone: emp.Phone,
      roleId: emp.RoleName === 'Admin' ? '1' : emp.RoleName === 'Cashier' ? '2' : '3',
      status: emp.Status
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.userId) {
      await axiosClient.put('/api/employees.php', form);
    } else {
      await axiosClient.post('/api/employees.php', form);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this employee?')) return;
    await axiosClient.delete(`/api/employees.php?id=${id}`);
    load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Employees" />
        <div className="card">
          <div className="toolbar">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{employees.length} employees</span>
            <button className="btn btn-gold" onClick={openCreate}>+ Add Employee</button>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Username</th><th>Role</th><th>Contact</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.UserID}>
                  <td>{emp.FullName}</td>
                  <td className="mono">{emp.Username}</td>
                  <td>{emp.RoleName}</td>
                  <td>{emp.Email}<br /><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.Phone}</span></td>
                  <td><span className={`badge ${emp.Status === 'Active' ? 'active' : 'inactive'}`}>{emp.Status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(emp)}>Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => handleDelete(emp.UserID)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{form.userId ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Full Name</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              {!form.userId && (
                <>
                  <div className="field">
                    <label>Username</label>
                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                </>
              )}
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  <option value="1">Admin</option>
                  <option value="2">Cashier</option>
                  <option value="3">Manager</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
