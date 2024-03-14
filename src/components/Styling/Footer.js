import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer py-3">
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <p className="copyright">
              © 2024 TWELVE KLAUS PLT. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
