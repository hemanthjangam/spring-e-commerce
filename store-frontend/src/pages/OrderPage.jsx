import React, { useEffect, useState } from 'react';
import { getAllOrders, getOrderDetails } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

function OrderDetailsView({ orderId, token, onBack }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getOrderDetails(orderId, token);
                setOrder(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId, token]);

    if (loading) return <p className="text-secondary page-container">Loading order details...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;
    if (!order) return <p className="text-secondary page-container">Order not found.</p>;

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                <HiArrowLeft /> Back to Orders
            </button>
            <h3 className="page-header">Order Details #{order.id}</h3>
            <p className='text-secondary'>Placed On: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={order.status === 'PAID' ? 'text-success' : 'text-accent'}>{order.status}</span></p>

            <h4 style={{ marginTop: '2rem' }}>Items</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {order.items.map((item, index) => (
                    <li key={index} className="list-item">
                        <div>
                           <span style={{ fontWeight: 500 }}>{item.product.name}</span>
                           <span className="text-secondary" style={{ display: 'block', fontSize: '0.9rem' }}>{item.quantity} x ₹{item.product.price}</span>
                        </div>
                        <div style={{ fontWeight: 600 }}>₹{item.totalPrice}</div>
                    </li>
                ))}
            </ul>
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'right', fontSize: '1.5rem', fontWeight: '700' }}>
                Total: ₹{order.totalPrice}
            </div>
        </div>
    );
}

export default function OrderPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Login required to view your order history.");
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const data = await getAllOrders(token);
                setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (selectedOrderId) {
        return <OrderDetailsView orderId={selectedOrderId} token={token} onBack={() => setSelectedOrderId(null)} />;
    }

    if (loading) return <p className="text-secondary page-container">Loading order history...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <h2 className="page-header">Your Orders</h2>
            {orders.length === 0 ? (
                <p className="text-secondary">You haven't placed any orders yet. <Link to="/category/all" style={{color: 'var(--color-primary)'}}>Shop now.</Link></p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {orders.map(order => (
                        <li key={order.id} className="list-item">
                            <div>
                                <strong>Order #{order.id}</strong>
                                <span className="text-secondary" style={{ display: 'block', fontSize: '0.9rem' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 600, display: 'block' }}>₹{order.totalPrice}</span>
                                <button onClick={() => setSelectedOrderId(order.id)} className="btn btn-secondary" style={{ marginTop: '5px' }}>
                                    View Details
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}