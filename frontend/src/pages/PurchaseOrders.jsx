import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import axiosClient from '../api/axiosClient.js';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([{ productId: '', quantity: '', unitCost: '' }]);

  const load = () => {
    axiosClient.get('/api/purchase_orders.php').then((res) => setOrders(res.data.data));
  };

  useEffect(() => {
    axiosClient.get('/api/suppliers.php').then((res) => setSuppliers(res.data.data));
    axiosClient.get('/api/products.php').then((res) => setProducts(res.data.data));
    load();
  }, []);

  const openCreate = () => {
    setSupplierId('');
    setNotes('');
    setLineItems([{ productId: '', quantity: '', unitCost: '' }]);
    setShowModal(true);
  };

  const updateLine = (idx, field, value) => {
    const copy = [...lineItems];
    copy[idx][field] = value;
    setLineItems(copy);
  };

  const addLine = () => setLineItems([...lineItems, { productId: '', quantity: '', unitCost: '' }]);

  const handleSave = async (e) => {
    e.preventDefault();
    await axiosClient.post('/api/purchase_orders.php', {
      supplierId,
      notes,
      items: lineItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost }))
    });
    setShowModal(false);
    load();
  };

  const handleReceive = async (poId) => {
    if (!confirm('Mark this order as received and update stock?')) return;
    await axiosClient.post('/api/purchase_orders.php?action=receive', { poId });
    load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Purchase Orders" />
        <div className="card">
          <div className="toolbar">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{orders.length} orders</span>
            <button className="btn btn-gold" onClick={openCreate}>+ New Purchase Order</button>
          </div>
          <table>
            <thead>
              <tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.POID}>
                  <td className="mono">#{po.POID}</td>
                  <td>{po.SupplierName}</td>
                  <td>{po.items?.map((i) => `${i.ProductName} x${i.Quantity}`).join(', ')}</td>
                  <td><span className={`badge ${po.Status === 'Received' ? 'active' : 'inactive'}`}>{po.Status}</span></td>
                  <td>{po.CreatedBy}</td>
                  <td style={{ textAlign: 'right' }}>
                    {po.Status !== 'Received' && (
                      <button className="btn btn-primary" onClick={() => handleReceive(po.POID)}>Receive</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>New Purchase Order</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Supplier</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
                </select>
              </div>

              {lineItems.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <select style={{ flex: 2 }} value={line.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)} required>
                    <option value="">Product</option>
                    {products.map((p) => <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
                  </select>
                  <input style={{ flex: 1 }} type="number" placeholder="Qty" min="1" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} required />
                  <input style={{ flex: 1 }} type="number" placeholder="Unit cost" step="0.01" value={line.unitCost} onChange={(e) => updateLine(idx, 'unitCost', e.target.value)} required />
                </div>
              ))}
              <button type="button" className="btn btn-ghost" onClick={addLine} style={{ marginBottom: 14 }}>+ Add line</button>

              <div className="field">
                <label>Notes</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
