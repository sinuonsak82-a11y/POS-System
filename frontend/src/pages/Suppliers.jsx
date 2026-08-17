import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

const emptyForm = { supplierId: null, supplierName: '', contactPerson: '', phone: '', email: '', address: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    axiosClient.get('/api/suppliers.php').then((res) => setSuppliers(res.data.data));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => {
    setForm({
      supplierId: s.SupplierID, supplierName: s.SupplierName,
      contactPerson: s.ContactPerson, phone: s.Phone, email: s.Email, address: s.Address
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.supplierId) {
      await axiosClient.put('/api/suppliers.php', form);
    } else {
      await axiosClient.post('/api/suppliers.php', form);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    await axiosClient.delete(`/api/suppliers.php?id=${id}`);
    load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Suppliers" />
        <div className="card">
          <div className="toolbar">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{suppliers.length} suppliers</span>
            <button className="btn btn-gold" onClick={openCreate}>+ Add Supplier</button>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th></th></tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.SupplierID}>
                  <td>{s.SupplierName}</td>
                  <td>{s.ContactPerson}</td>
                  <td className="mono">{s.Phone}</td>
                  <td>{s.Email}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(s)}>Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => handleDelete(s.SupplierID)}>Delete</button>
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
            <h3 style={{ marginBottom: 16 }}>{form.supplierId ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Supplier Name</label>
                <input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} required />
              </div>
              <div className="field">
                <label>Contact Person</label>
                <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
