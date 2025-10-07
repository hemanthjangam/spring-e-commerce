/* ========================= src/pages/OrderPage.jsx (FIXED) ========================= */
import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, getOrderDetails } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // <--- FIX: Added missing Link import

function OrderDetailsView({ orderId, token, onBack }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const data = await getOrderDetails(orderId, token);
                setOrder(data);
            } catch (err) {
                console.error("Order details fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token]);

    if (loading) return <p className="text-secondary page-container">Loading order details...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;
    if (!order) return <p className="text-secondary page-container">Order not found.</p>;

    const statusClass = order.status === 'PAID' ? 'text-success' : 'text-accent';

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <button onClick={onBack} className="secondary-button" style={{ marginBottom: '1.5rem', padding: '8px 12px' }}>&larr; BACK TO ORDERS</button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ORDER DETAILS #<span className='text-accent'>{order.id}</span></h3>
            <p className='text-secondary'>Placed On: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={statusClass} style={{ fontWeight: 600 }}>{order.status}</span></p>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                <strong style={{ fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>TOTAL:</span> <span className="text-accent">₹{order.totalPrice}</span>
                </strong>
            </div>

            <h4 style={{ marginTop: '2rem', fontSize: '1.1rem', fontWeight: 600 }}>ITEMS:</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {order.items.map((item, index) => (
                    <li key={index} className="list-item" style={{ padding: '10px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontWeight: 500 }}>{item.product.name}</span>
                           <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{item.quantity} units @ ₹{item.product.price}</span>
                        </div>
                        <div className="text-accent" style={{ fontWeight: 600 }}>₹{item.totalPrice}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default function OrderPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!token) {
            setError("Login required to view your order history.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await getAllOrders(token);
            // Sort by createdAt descending for latest orders first
            const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders || []);
        } catch (err) {
            console.error("Order history fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (selectedOrderId) {
        return <OrderDetailsView orderId={selectedOrderId} token={token} onBack={() => setSelectedOrderId(null)} />;
    }

    if (loading) return <p className="text-secondary page-container">Loading order history...</p>;
    if (error) return <p className="text-error page-container">{error}</p>;

    return (
        <div className="page-container content-box" style={{ maxWidth: '800px' }}>
            <h2 className="page-header">YOUR ORDERS</h2>
            {orders.length === 0 ? (
                <p className="text-secondary">You haven't placed any orders yet. <Link to="/category/all" className="text-accent">Shop now.</Link></p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {orders.map(order => {
                        const statusClass = order.status === 'PAID' ? 'text-success' : 'text-accent';
                        return (
                            <li key={order.id} className="list-item" style={{ padding: '15px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>Order #{order.id}</strong>
                                    <span className={statusClass} style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.status}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="text-accent" style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>₹{order.totalPrice}</span>
                                    <button
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className="secondary-button small-button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    >
                                        VIEW DETAILS
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}