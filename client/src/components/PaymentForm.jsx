import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const PaymentForm = () => {
  const { eventID } = useParams();
  const { isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentStatus, setPaymentStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Prompt user to log in if not authenticated
      return;
    }
    
    try {
      // Simulate payment processing
      const response = await axios.post('http://localhost:5000/payment', {
        ...formData,
        eventID,
      });
      
      if (response.status === 200) {
        setPaymentStatus('success');
        navigate(`/event/${eventID}/payment-success`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="payment-form">
      <h2>Payment Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Card Number</label>
          <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Expiry Date (MM/YY)</label>
          <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Submit Payment</button>
      </form>
      {paymentStatus === 'success' && <p>Payment was successful!</p>}
      {paymentStatus === 'error' && <p>There was an error processing your payment.</p>}
    </div>
  );
};

export default PaymentForm;
