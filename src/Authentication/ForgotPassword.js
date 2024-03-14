import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Alert, Container, Row, Col } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState(null);
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      setAlert({ type: 'danger', message: 'Please enter your email address.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setAlert({ type: 'success', message: 'Password reset email sent successfully.' });
      setEmail(''); // to clear email field after successful send
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to send password reset email. Please try again.' });
      console.error("Error sending password reset email:", error.message);
    }
  }

  return (
    <Container className="Authentication">
      <Row>
        <Col>
          <div className="p-4 box">
            <h2 className="mb-3">Forgot Password</h2>
            {alert && (
              <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                {alert.message}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  required
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit">
                  Send Reset
                </Button>
              </div>
            </Form>
          </div>
          <div className="p-4 box mt-3 text-center">
            <Link to="/">Back to Login</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
