import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { getAllOrders, getOrderDetails } from '../api';
import { useAuth } from '../contexts/AuthContext';

function OrderDetailsView({ orderId, token, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getOrderDetails(orderId, token);
        if (mounted) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load order details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [orderId, token]);

  if (loading) {
    return <p className="loading-state page-container">Loading order details...</p>;
  }

  if (error || !order) {
    return <p className="text-error page-container">{error || 'Order not found.'}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <HiArrowLeft />
          Back to orders
        </button>
        <div style={{ marginTop: '18px' }}>
          <span className="eyebrow">Order #{order.id}</span>
          <h1 className="page-header" style={{ marginTop: '14px' }}>Status: {order.status}</h1>
          <p className="section-copy">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </section>

      <section className="content-box">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.items.map((item, index) => (
            <li key={`${item.product.id}-${index}`} className="list-item">
              <div>
                <p className="product-name">{item.product.name}</p>
                <p className="section-copy" style={{ marginTop: '8px' }}>
                  {item.quantity} x ₹{item.product.price}
                </p>
              </div>
              <div />
              <div className="product-price">₹{item.totalPrice}</div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="summary-card" style={{ maxWidth: '420px' }}>
        <span className="eyebrow">Summary</span>
        <h2 className="page-header" style={{ marginTop: '14px', fontSize: '1.4rem' }}>Order total</h2>
        <p className="stat-card-value">₹{order.totalPrice}</p>
      </aside>
    </div>
  );
}

export default function OrderPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Login required to view order history.');
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const data = await getAllOrders(token);
        if (mounted) {
          setOrders(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load orders.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const sortedOrders = useMemo(
    () => [...orders].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [orders]
  );

  if (selectedOrderId) {
    return <OrderDetailsView orderId={selectedOrderId} token={token} onBack={() => setSelectedOrderId(null)} />;
  }

  if (loading) {
    return <p className="loading-state page-container">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-error page-container">{error}</p>;
  }

  return (
    <div className="page-container" style={{ display: 'grid', gap: '24px' }}>
      <section className="content-box">
        <span className="eyebrow">Orders</span>
        <h1 className="page-header" style={{ marginTop: '14px' }}>Order history</h1>
        <p className="section-copy">This page is seeded with demo order history so you can review the full post-checkout flow.</p>
      </section>

      <section className="content-box">
        {sortedOrders.length === 0 ? (
          <div className="empty-state">
            <p>You have not placed any orders yet.</p>
            <Link to="/category/all" className="btn btn-primary" style={{ marginTop: '16px' }}>Start shopping</Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sortedOrders.map((order) => (
              <li key={order.id} className="list-item">
                <div>
                  <p className="product-name">Order #{order.id}</p>
                  <p className="section-copy" style={{ marginTop: '8px' }}>
                    {new Date(order.createdAt).toLocaleString()} · {order.status}
                  </p>
                </div>
                <div className="metric-pill">{order.items?.length || 0} items</div>
                <div style={{ display: 'grid', gap: '10px', justifyItems: 'end' }}>
                  <span className="product-price">₹{order.totalPrice}</span>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderId(order.id)}>
                    View details
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
