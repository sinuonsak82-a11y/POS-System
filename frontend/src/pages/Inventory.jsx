import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

const emptyForm = { productId: '', type: 'In', quantity: '', reason: '', transferTo: '' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => {
    axiosClient.get('/api/inventory.php', { params: { lowStock: lowStockOnly ? '1' : '0' } })
      .then((res) => setItems(res.data.data));
  };

  useEffect(() => {
    axiosClient.get('/api/products.php').then((res) => setProducts(res.data.data));
  }, []);

  useEffect(() => { load(); }, [lowStockOnly]);

  const openMovement = () => {
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/api/stock.php', form);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record movement');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Inventory" />
        <div className="card">
          <div className="toolbar">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
              Low stock only
            </label>
            <button className="btn btn-gold" onClick={openMovement}>+ Stock Movement</button>
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Barcode</th><th>On Hand</th><th>Reorder Level</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.ProductID}>
                  <td>{p.ProductName}</td>
                  <td>{p.CategoryName}</td>
                  <td className="mono">{p.Barcode}</td>
                  <td className="mono">{p.QuantityOnHand}</td>
                  <td className="mono">{p.ReorderLevel}</td>
                  <td>
                    <span className={`badge ${p.QuantityOnHand <= p.ReorderLevel ? 'inactive' : 'active'}`}>
                      {p.QuantityOnHand <= p.ReorderLevel ? 'Low' : 'OK'}
                    </span>
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
            <h3 style={{ marginBottom: 16 }}>Record Stock Movement</h3>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Product</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Movement Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="In">Stock In</option>
                  <option value="Out">Stock Out</option>
                  <option value="Transfer">Stock Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                </select>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              {form.type === 'Transfer' && (
                <div className="field">
                  <label>Transfer To (location)</label>
                  <input value={form.transferTo} onChange={(e) => setForm({ ...form, transferTo: e.target.value })} required />
                </div>
              )}
              <div className="field">
                <label>Reason / Note</label>
                <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
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
