import React, { useState, useEffect } from "react";
import "./Styling/GlobalStyling.css";
import { Button, Container, Row, Col, Form, Modal, ListGroup, InputGroup, FormControl, Alert } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";
import { Trash, PlusCircle, Filter } from 'react-bootstrap-icons';
import { addDoc, updateDoc, collection, serverTimestamp, getDocs, query, where, doc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import Header from "./Styling/Header";
import Footer from "./Styling/Footer";

const Home = () => {
  const { user } = useUserAuth();

  const [showModal, setShowModal] = useState({ createRoom: false, roomType: false });
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState([]); // State to store filters
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // State to store the selected room for editing/deletion
  const [lastUpdatedByUserName, setLastUpdatedByUserName] = useState(""); // State to store lastUpdatedBy username
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");

  const resetForm = () => {
    setError("");
    setIsFormChanged(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'available';
      case 'Pending Cleaning':
        return 'pending-cleaning';
      case 'Pending MakeUp':
        return 'pending-makeup';
      case 'Unavailable':
        return 'unavailable';
      default:
        return '';
    }
  };

  useEffect(() => {
    const unsubscribeRoomTypes = onSnapshot(collection(db, "room_types"), (snapshot) => {
      const sortedRoomTypes = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .sort((a, b) => a.room_type_name.localeCompare(b.room_type_name)); // to sort alphabetically
      setRoomTypes(sortedRoomTypes);
    });

    const unsubscribeRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const fetchedRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(fetchedRooms);
    });

    return () => {
      unsubscribeRoomTypes();
      unsubscribeRooms();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom && selectedRoom.lastUpdatedBy) {
      async function fetchUsername() {
        try {
          const userDoc = await getDoc(doc(db, "users", selectedRoom.lastUpdatedBy));
          if (userDoc.exists()) {
            setLastUpdatedByUserName(userDoc.data().username);
          } else {
            setLastUpdatedByUserName("");
          }
        } catch (error) {
          console.error("Error fetching last updated by username: ", error);
        }
      }
      fetchUsername();
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.lastUpdatedTime) {
      const timestamp = selectedRoom.lastUpdatedTime.toDate(); // to convert firestore timestamp to javaScript date object
      const optionsTime = { hour: 'numeric', minute: 'numeric' };
      const optionsDate = { month: 'long', day: 'numeric' };

      const formattedTime = timestamp.toLocaleTimeString('en-US', optionsTime);
      const formattedDate = timestamp.toLocaleDateString('en-US', optionsDate);

      const formattedDateTime = `at ${formattedTime}, ${formattedDate}`;
      
      setLastUpdatedTime(formattedDateTime);
    }
  }, [selectedRoom]);

  const openModal = (modalType) => setShowModal({ ...showModal, [modalType]: true });
  const closeModal = () => {
    setShowModal({ createRoom: false, roomType: false, roomDetails: false });
    resetForm(); // to ensure form is reset when modal is closed
    setSearchTerm(""); // to clear the search term
    setLastUpdatedByUserName(""); // to reset last updated by username
    setLastUpdatedTime(""); // to reset last updated time
  };

  

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    // to check if the updated room number is the same as the existing room number
    const roomQuery = query(collection(db, "rooms"), where("room_number", "==", selectedRoom.room_number));
    const querySnapshot = await getDocs(roomQuery);
    const existingRoom = querySnapshot.docs.find(doc => doc.id !== selectedRoom.id);
  
    if (existingRoom) {
      setError("Room number already exists!");
      return;
    }
  
    // to add lastUpdatedBy field with the current user's UID
    const updatedRoom = {
      ...selectedRoom,
      lastUpdatedBy: user.uid,
      lastUpdatedTime: serverTimestamp()
    };
  
    try {
      await updateDoc(doc(db, "rooms", selectedRoom.id), updatedRoom);
      setIsFormChanged(false);
      setError(""); // to reset error if no error occurred
      closeModal(); // to close modal after updating
    } catch (error) {
      console.error("Error updating room: ", error);
    }
  };
  

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    openModal('roomDetails'); // to open modal for room details
  };

  const handleFormChange = () => {
    setIsFormChanged(true);
  };

  // to group rooms by room type
  const groupedRooms = {};
  rooms.forEach(room => {
    if (!groupedRooms[room.room_type]) {
      groupedRooms[room.room_type] = [];
    }
    groupedRooms[room.room_type].push(room);
  });

  const clearFilter = () => {
    // to clear all filters
    setFilters([]);
  
    // to reset the value of the filter dropdowns to "All"
    const roomTypesDropdown = document.getElementById("roomTypesDropdown");
    if (roomTypesDropdown) {
      roomTypesDropdown.value = "";
    }
  
    const roomStatusDropdown = document.getElementById("roomStatusDropdown");
    if (roomStatusDropdown) {
      roomStatusDropdown.value = "";
    }
  };
  

  return (
    <>
      <Header />
      <main className="main">
        <Container>
          {/* Search bar and filtering options */}
          <Row className="justify-content-start mt-3">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <InputGroup>
                <FormControl
                  placeholder="Search room number..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} sm={6} md={8} lg={3} className="mb-2">
  <InputGroup>
    <InputGroup.Text>
      <Filter />
    </InputGroup.Text>
    <Form.Select
      id="roomTypesDropdown"
      onChange={(e) => {
        const type = e.target.value;
        if (type !== "") {
          const label = e.target.options[e.target.selectedIndex].parentNode.label;
          // to remove existing room type filter if present
          const newFilters = filters.filter(filter => filter.type !== "Room Types");
          const newFilter = {
            type: label,
            value: type
          };
          setFilters([...newFilters, newFilter]);
        } else {
          // to clear room type filter if "All" is selected
          const newFilters = filters.filter(filter => filter.type !== "Room Types");
          setFilters(newFilters);
        }
      }}
    >
      <option value="">All Room Types</option>
      <optgroup label="Room Types">
        {roomTypes.map(({ id, room_type_name }) => (
          <option key={id} value={room_type_name}>{room_type_name}</option>
        ))}
      </optgroup>
    </Form.Select>
  </InputGroup>
</Col>
<Col xs={12} sm={6} md={8} lg={3} className="mb-2">
  <InputGroup>
    <InputGroup.Text>
      <Filter />
    </InputGroup.Text>
    <Form.Select
      id="roomStatusDropdown"
      onChange={(e) => {
        const type = e.target.value;
        if (type !== "") {
          const label = e.target.options[e.target.selectedIndex].parentNode.label;
          // to remove existing room status filter if present
          const newFilters = filters.filter(filter => filter.type !== "Room Status");
          const newFilter = {
            type: label,
            value: type
          };
          setFilters([...newFilters, newFilter]);
        } else {
          // to clear room status filter if "All" is selected
          const newFilters = filters.filter(filter => filter.type !== "Room Status");
          setFilters(newFilters);
        }
      }}
    >
      <option value="">All Room Status</option>
      <optgroup label="Room Status">
        <option value="Available">Available</option>
        <option value="Pending Cleaning">Pending Cleaning</option>
        <option value="Pending MakeUp">Pending MakeUp</option>
        <option value="Unavailable">Unavailable</option>
      </optgroup>
    </Form.Select>
  </InputGroup>
</Col>

<Row>
  {filters.map((filter, index) => (
    <Col xs="auto" className="mb-2" key={index}>
      <Button variant="light" size="sm" onClick={() => {
        const newFilters = [...filters];
        newFilters.splice(index, 1);
        setFilters(newFilters);
      }}>
        <span onClick={clearFilter}>{filter.type} {filter.value}</span>
      </Button>
    </Col>
  ))}
  {filters.length > 0 && (
    <Col xs="auto" className="mb-2">
      <Button variant="light" size="sm" onClick={clearFilter}>
        Clear Filters
      </Button>
    </Col>
  )}
</Row>
          </Row>
          {/* Display room types and rooms */}
          {Object.keys(groupedRooms)
  .filter(roomType => {
    // to check if any room within this room type matches the search term or filters
    return groupedRooms[roomType].some(room => {
      const roomTypeFilter = filters.find(filter => filter.type === "Room Types");
      const statusFilter = filters.find(filter => filter.type === "Room Status");
      if (roomTypeFilter && roomTypeFilter.value !== roomType) return false;
      if (statusFilter && room.roomStatus !== statusFilter.value) return false;
      return room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })
  .sort((a, b) => a.localeCompare(b)) // to sort room types alphabetically
  .map(roomType => (
    <div key={roomType}>
      <h5>{roomType}:</h5>
      <div className="room-grid">
        {groupedRooms[roomType]
          .filter(room => {
            const roomTypeFilter = filters.find(filter => filter.type === "Room Types");
            const statusFilter = filters.find(filter => filter.type === "Room Status");
            if (roomTypeFilter && roomTypeFilter.value !== roomType) return false;
            if (statusFilter && room.roomStatus !== statusFilter.value) return false;
            return room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
          }) // to apply filters and search term
          .sort((a, b) => a.room_number.localeCompare(b.room_number)) // to sort rooms numerically
          .map(room => (
            <div
              key={room.room_number}
              className={`room-box ${getStatusClass(room.roomStatus)}`}
              onClick={() => handleRoomClick(room)} // to handle click event to open modal
              data-room-status={room.roomStatus}
            >
              <span className="room-number">{room.room_number}</span>
            </div>
          ))}
      </div>
    </div>
  ))}
          {Object.keys(groupedRooms)
            .filter(roomType => {
              // to check if any room within this room type matches the search term or filters
              return groupedRooms[roomType].some(room => {
                const roomTypeFilter = filters.find(filter => filter.type === "Room Types");
                const statusFilter = filters.find(filter => filter.type === "Room Status");
                if (roomTypeFilter && roomTypeFilter.value !== roomType) return false;
                if (statusFilter && room.roomStatus !== statusFilter.value) return false;
                return room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
              });
            }).length === 0 && (
              <div>No rooms found.</div>
            )}

        </Container>
      </main>
      <Footer />
     {/* Modal for room details */}
     <Modal show={showModal.roomDetails} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Room Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {selectedRoom && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Room Number</Form.Label>
                <Form.Control
                  type="text"
                  required
                  maxLength={5}
                  readOnly // to adding the readOnly attribute here
                  value={selectedRoom.room_number}
                  onChange={(e) => {
                    handleFormChange();
                    setSelectedRoom({ ...selectedRoom, room_number: e.target.value });
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Room Status</Form.Label>
                <Form.Select
                  value={selectedRoom.roomStatus}
                  onChange={(e) => {
                    handleFormChange();
                    setSelectedRoom({ ...selectedRoom, roomStatus: e.target.value });
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="roomType">
    <Form.Label>Room Type:</Form.Label>
    <Form.Control
      type="text"
      readOnly
      value={selectedRoom.room_type}
    />
  </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Floor</Form.Label>
                <Form.Control
                  type="text"
                  required
                  readOnly // to adding the readOnly attribute here
                  maxLength={3}
                  value={selectedRoom.floor_room}
                  onChange={(e) => {
                    handleFormChange();
                    setSelectedRoom({ ...selectedRoom, floor_room: e.target.value });
                  }}
                />
              </Form.Group>
              <Form.Group>
      <Form.Label style={{ fontWeight: 'bold' }}>Last Updated By:</Form.Label>
      <Form.Control
        type="text"
        value={`${lastUpdatedByUserName} ${lastUpdatedTime}`}
        readOnly // to adding the readOnly attribute here
        style={{ fontWeight: 'bold' }} // to applying bold font style
      />
    </Form.Group>

            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={isFormChanged ? "primary" : "secondary"}
            onClick={handleUpdateRoom}
            disabled={!isFormChanged}
          >
            Update Room
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;