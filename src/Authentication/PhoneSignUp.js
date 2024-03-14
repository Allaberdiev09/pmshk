import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Button, Form, Alert, Container, Row, Col } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";

const PhoneSignUp = () => {
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [confirmObj, setconfirmObj] = useState("");
  const { setUpRecaptcha } = useUserAuth();
  const navigate = useNavigate();

  const getOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (number === "" || number === undefined)
      return setError("Please enter a valid phone number!");
    try {
      const response = await setUpRecaptcha(number);
      console.log(response);
      setconfirmObj(response);
      setFlag(true);
    } catch (err) {
      setError(err.message);
    }
    console.log(number);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp === "" || otp === null) return;
    try {
      setError("");
      await confirmObj.confirm(otp);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Container className="Authentication">
        <Row>
          <Col>
            <div className="p-4 box">
              <h2 className="mb-3">Firebase Phone Auth</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form
                onSubmit={getOtp}
                style={{ display: !flag ? "block" : "none" }}
              >
                <Form.Group className="mb-3" controlId="formBasicPhoneNumber">
                  <PhoneInput
                    defaultCountry="MY"
                    value={number}
                    onChange={setNumber}
                    placeholder="Enter Phone Number"
                  />
                  <div id="recaptcha-container" />
                </Form.Group>
                <div className="button-right">
                  <Link to="/" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Cancel</Button> &nbsp;
                  </Link>
                  <Button variant="primary" type="submit">
                    Send OTP
                  </Button>
                </div>
              </Form>

              <Form
                onSubmit={verifyOtp}
                style={{ display: flag ? "block" : "none" }}
              >
                <Form.Group className="mb-3" controlId="formBasictp">
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Form.Group>
                <div className="button-right">
                  <Link to="/" style={{ textDecoration: "none" }}>
                    <Button variant="secondary">Cancel</Button> &nbsp;
                  </Link>
                  <Button variant="primary" type="submit">
                    Verify OTP
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PhoneSignUp;
