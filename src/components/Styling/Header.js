import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/UserAuthContext";
import Sidebar from "./Sidebar";
import { BoxArrowRight } from 'react-bootstrap-icons';

const Header = () => {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        await logOut();
        navigate("/");
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <header className="header py-3">
      <Container>
        <Row>
          <Col>
            <Sidebar />
          </Col>
        </Row>
        <Row className="align-items-center">
          <Col className="text-center">
            <h4>TWELVE KLAUS - PMS HK</h4>
          </Col>
        </Row>
        <div className="headerLogOut">
          <Button className="logoutButton" onClick={handleLogout}>
            <BoxArrowRight />
          </Button>
        </div>
      </Container>
    </header>
  );
};

export default Header;
