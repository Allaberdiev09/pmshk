import React, { useState } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { HouseDoorFill, PersonCircle, List, CaretLeftFill, QuestionCircleFill } from 'react-bootstrap-icons';

const Sidebar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      {sidebarOpen &&
        <Button className="toggle-btn" onClick={toggleSidebar}>
          <CaretLeftFill />
        </Button>
      }
      {!sidebarOpen &&
        <Button className="toggle-btn" onClick={toggleSidebar}>
          <List />
        </Button>
      }
      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link as={Link} to="/home" className={location.pathname === '/home' ? 'active' : ''}>
            <HouseDoorFill />
            Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            <PersonCircle />
            Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/help" className={location.pathname === '/help' ? 'active' : ''}>
            <QuestionCircleFill />
            Help
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
