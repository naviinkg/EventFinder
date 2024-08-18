import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaCheckCircle, FaCcVisa, FaCcMastercard, FaCcAmex, FaUser, FaEnvelope, FaCreditCard, FaCalendarAlt, FaLock, FaTicketAlt } from 'react-icons/fa';
import { Button, Form, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { purchaseTickets, getEventById, sendEmail, getVenueById } from '../utils/api';

const PaymentPage = () => {
  const { user } = useAuth0();
  const { eventID } = useParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [noOfTickets, setNoOfTickets] = useState(1);
  const [isValid, setIsValid] = useState(true);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cardNumberRegex = /^\d{16}$/;
  const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvRegex = /^\d{3,4}$/;
  const confirmationRef = useRef(null);

  useEffect(() => {
    console.log("here before useEffect = ", eventID);
    const fetchEventDetails = async () => {
      console.log("Payment page eventId =", eventID);
      setLoading(true);
      try {
        const response = await getEventById(eventID);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventID) {
      fetchEventDetails();
    }
  }, [eventID]);

  const handlePaymentSubmit = async () => {

    if(purchaseSuccess){
      alert("Ticket already purchased");
      setPurchaseSuccess(false);
      return;
    }

    if (
      emailRegex.test(email) &&
      cardNumberRegex.test(cardNumber) &&
      expiryDateRegex.test(expiryDate) &&
      cvvRegex.test(cvv)
    ) {
      setIsValid(true);
      try {
        if (user) {
          const response = await purchaseTickets(user.sub, eventID, noOfTickets);
          if (response.status === 200) {
            setPurchaseSuccess(true);
            console.log('Tickets purchased successfully');
            await sendConfirmationEmail();
          } else {
            handlePurchaseError(response.status, response.data.error);
          }
        } else {
          console.error('User is not authenticated');
        }
      } catch (err) {
        handlePurchaseError(err.response.status, err);
        console.error('Error during payment:', err);
      }
    } else {
      setIsValid(false);
    }
  };

  const sendConfirmationEmail = async () => {
    let paymentDetails = {};
    paymentDetails.firstName = firstName;
    paymentDetails.lastName = lastName;
    paymentDetails.email = email;
    paymentDetails.numberOfTickets = noOfTickets;
    paymentDetails.eventName = event.name;
    paymentDetails.totalPrice = event.price * noOfTickets;
    paymentDetails.location = event.venue.name + event.venue.address + event.venue.city + event.venue.state + event.venue.country + event.venue.postalCode
    paymentDetails.localDate = event.localDate;
    paymentDetails.localTime = event.localTime;
    
    const response = await sendEmail(paymentDetails);

    if(response.status == 200)
      alert('Email confirmation sent');
  };


  useEffect(() => {
    if (purchaseSuccess) {
      if (confirmationRef.current) {
        confirmationRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      sendConfirmationEmail();
    }
    
  }, [purchaseSuccess]);

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (!event) {
    return <div>Error loading event details. Please try again.</div>;
  }

  function handlePurchaseError(status, error) {
    switch (status) {
      case 401:
        alert("Not enough tickets available");
        break;
      case 400:
        alert("Event expired!!");
        break;
      default:
        alert("An unexpected error occurred: " + error);
        break;
    }
  }

  return (
    <div className="payment-page container my-5">
      <h1 className="text-center mb-4">Payment Details for {event.name}</h1>
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Last Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={!isValid && !emailRegex.test(email)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid email address.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCardNumber">
                  <Form.Label>Card Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaCreditCard /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter your card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      isInvalid={!isValid && !cardNumberRegex.test(cardNumber)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid 16-digit card number.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formExpiryDate">
                      <Form.Label>Expiry Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          isInvalid={!isValid && !expiryDateRegex.test(expiryDate)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid expiry date (MM/YY).
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formCVV">
                      <Form.Label>CVV</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaLock /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Enter CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          isInvalid={!isValid && !cvvRegex.test(cvv)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid CVV (3 or 4 digits).
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formNoOfTickets">
                <Form.Label>Number of Tickets</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaTicketAlt /></InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={noOfTickets}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value > 0) {
                            setNoOfTickets(value);
                          }
                        }}
                        min="1"
                        required
                      />
                  </InputGroup>
                </Form.Group>


                <Button variant="primary" size="lg" className="w-100" onClick={handlePaymentSubmit}>
                  Submit Payment
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Order Summary</h4>
              <p><strong>Event:</strong> {event.name}</p>
              <p><strong>Tickets:</strong> {noOfTickets}</p>
              <p><strong>Total:</strong> ${event.price ? (event.price * noOfTickets).toFixed(2) : '0.00'}</p>
              <hr />
              <div className="d-flex justify-content-around">
                <FaCcVisa size="2em" />
                <FaCcMastercard size="2em" />
                <FaCcAmex size="2em" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {purchaseSuccess && (
        <Card className="mt-4 text-center">
          <Card.Body>
            <FaCheckCircle color="green" size="3em" className="mb-3" />
            <h3>Purchase Successful!</h3>
            <p><strong>Name:</strong> {firstName} {lastName}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Event:</strong> {event.name}</p>
            <p><strong>Tickets:</strong> {noOfTickets}</p>
            <p><strong>Total:</strong> ${event.price ? (event.price * noOfTickets).toFixed(2) : '0.00'}</p>
          </Card.Body>
        </Card>
      )}

      {purchaseSuccess && (
        <div ref={confirmationRef} className="confirmation-section text-center mt-5">
          <h3><FaCheckCircle className="text-success" /> Payment Successful!</h3>
          <p>Your tickets have been purchased successfully. A confirmation email has been sent to {email}.</p>
        </div>
      )}

    </div>
  );
};

export default PaymentPage;