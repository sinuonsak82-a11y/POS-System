import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

const emptyForm = {
  productId: null, productName: '', categoryId: '', barcode: '',
  costPrice: '', sellingPrice: '', status: 'Active', image: null
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = () => {
    axiosClient.get('/api/products.php', { params: { search } }).then((res) => setProducts(res.data.data));
  };

  useEffect(() => {
    axiosClient.get('/api/categories.php').then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => { loadProducts(); }, [search]);

  const openCreate = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      productId: p.ProductID, productName: p.ProductName, categoryId: p.CategoryID,
      barcode: p.Barcode, costPrice: p.CostPrice, sellingPrice: p.SellingPrice,
      status: p.Status, image: null
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.productId) {
      await axiosClient.put('/api/products.php', form);
    } else {
      const fd = new FormData();
      fd.append('productName', form.productName);
      fd.append('categoryId', form.categoryId);
      fd.append('barcode', form.barcode);
      fd.append('costPrice', form.costPrice);
      fd.append('sellingPrice', form.sellingPrice);
      fd.append('status', form.status);
      if (form.image) fd.append('image', form.image);
      await axiosClient.post('/api/products.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    setShowModal(false);
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await axiosClient.delete(`/api/products.php?id=${id}`);
    loadProducts();
  };

  const generateBarcode = () => {
    const code = Date.now().toString().slice(-12);
    setForm({ ...form, barcode: code });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await axiosClient.post('/api/product_import_export.php?action=import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert(`Imported ${res.data.imported} products`);
    loadProducts();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Products" />
        <div className="card">
          <div className="toolbar">
            <input placeholder="Search by name or barcode..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="btn btn-ghost" href="http://localhost:8000/api/product_import_export.php?action=export">Export CSV</a>
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                Import CSV
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
              </label>
              <button className="btn btn-gold" onClick={openCreate}>+ Add Product</button>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Barcode</th><th>Cost</th><th>Price</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.ProductID}>
                  <td>{p.ProductName}</td>
                  <td>{p.CategoryName}</td>
                  <td className="mono">{p.Barcode}</td>
                  <td className="mono">${Number(p.CostPrice).toFixed(2)}</td>
                  <td className="mono">${Number(p.SellingPrice).toFixed(2)}</td>
                  <td><span className={`badge ${p.Status === 'Active' ? 'active' : 'inactive'}`}>{p.Status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(p)}>Edit</button>{' '}
                    <button className="btn btn-danger" onClick={() => handleDelete(p.ProductID)}>Delete</button>
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
            <h3 style={{ marginBottom: 16 }}>{form.productId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Product Name</label>
                <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Barcode</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
                  <button type="button" className="btn btn-ghost" onClick={generateBarcode}>Generate</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Cost Price</label>
                  <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Selling Price</label>
                  <input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
                </div>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {!form.productId && (
                <div className="field">
                  <label>Product Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                </div>
              )}
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
