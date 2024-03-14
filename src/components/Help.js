import React from "react";
import "./Styling/GlobalStyling.css";
import { Container, Row } from "react-bootstrap";
import Header from "./Styling/Header";
import Footer from "./Styling/Footer";

const Help = () => {

  return (
    <>
      <Header />
      <main className="main d-flex justify-content-center align-items-center">
  <Container className="text-center">
    <Row className="">
      <h4 className="contactDetailsHeader">Contact to Developer</h4>
    </Row>
    <Row>
  <div>
    <h5 className="contactDetails">Email: <a href="mailto:allaberdiyevallaberdi09@gmail.com" className="contactLink">allaberdiyevallaberdi09@gmail.com</a></h5>
  </div>
</Row>
<Row>
  <div>
    <h5 className="contactDetails">Phone: <a href="tel:+60173821913" className="contactLink">+60 17 382 1913</a></h5>
  </div>
</Row>


  </Container>
</main>

      <Footer />
    </>
  );
};

export default Help;
