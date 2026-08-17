import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ categoryId: null, categoryName: '', description: '' });

  const load = () => {
    axiosClient.get('/api/categories.php').then((res) => setCategories(res.data.data));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ categoryId: null, categoryName: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({ categoryId: cat.CategoryID, categoryName: cat.CategoryName, description: cat.Description });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.categoryId) {
      await axiosClient.put('/api/categories.php', form);
    } else {
      await axiosClient.post('/api/categories.php', form);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await axiosClient.delete(`/api/categories.php?id=${id}`);
    load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Categories" />
        <div className="card">
          <div className="toolbar">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{categories.length} categories</span>
            <button className="btn btn-gold" onClick={openCreate}>+ Add Category</button>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Description</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.CategoryID}>
                  <td>{cat.CategoryName}</td>
                  <td>{cat.Description}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(cat)}>Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => handleDelete(cat.CategoryID)}>Delete</button>
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
            <h3 style={{ marginBottom: 16 }}>{form.categoryId ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Category Name</label>
                <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required />
              </div>
              <div className="field">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
