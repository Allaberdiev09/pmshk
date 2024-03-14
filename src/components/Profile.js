import React, { useState, useEffect } from "react";
import "./Styling/GlobalStyling.css";
import { Button, Container, Form, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import { doc, setDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from '../firebase';
import Header from "./Styling/Header";
import Footer from "./Styling/Footer";

const Profile = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isUsernameExists, setIsUsernameExists] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user && user.uid) {
        const q = query(collection(db, "users"), where("id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setIsProfileSetup(false);
        } else {
          querySnapshot.forEach((doc) => {
            setUsername(doc.data().username);
            setOriginalUsername(doc.data().username);
          });
          setIsProfileSetup(true);
        }
      }
    };

    if (user) {
      checkUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setUsername(data.username);
        setOriginalUsername(data.username);
        setIsProfileSetup(true);
      } else {
        setIsProfileSetup(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelUpdate = () => {
    setUsername(originalUsername);
    setIsModified(false);
    setIsUsernameExists(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleUpdate = async () => {
    if (!username.trim()) {
      setErrorMessage("Username cannot be empty.");
      setIsUsernameExists(true);
      return;
    }
  
    // to check if the username already exists
    const usernameExists = await checkUsernameExists(username);
  
    if (usernameExists) {
      setErrorMessage("Username already exists. Please choose a different one.");
      setIsUsernameExists(true);
      return;
    }
  
    if (username === originalUsername) {
      setIsModified(false);
      setSuccessMessage("Username updated successfully.");
      return;
    }
  
    try {
      if (isProfileSetup) {
        // to update the existing document with the user's UID as the document ID
        await setDoc(doc(db, "users", user.uid), { username }, { merge: true });
      } else {
        // to create a new document with the user's UID as the document ID
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          username,
          user_type: "manager",
          createdAt: serverTimestamp(),
        });
        setIsProfileSetup(true);
      }
      setOriginalUsername(username);
      setIsModified(false);
      setIsUsernameExists(false);
      setErrorMessage("");
      setSuccessMessage("Username updated successfully.");
    } catch (error) {
      console.error("Error updating username:", error);
      setErrorMessage("Failed to update username. Please try again.");
    }
  };
  
  const checkUsernameExists = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };
  
  const handleInputChange = (event) => {
    setUsername(event.target.value);
    setIsModified(event.target.value !== originalUsername);
    setIsUsernameExists(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteAccount = async () => {
    try {
      const userToDelete = auth.currentUser;
      if (userToDelete) {
        await userToDelete.delete();
        await deleteDoc(doc(db, "users", user.uid)); 
        navigate("/"); // to redirect user to home page after successful deletion
      } else {
        throw new Error("No user signed in.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("Failed to delete account. Please try again.");
    }
  };
  

  return (
    <>
      <Header />
      <main className="main">
        <Container>
          <div>
            <Form>
              <Form.Group controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control className="mb-2" type="text" placeholder="Set up a username" value={username} onChange={handleInputChange} />
                {isUsernameExists && <Alert variant="danger">{errorMessage}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
              </Form.Group>
              <Button className="rightMargin" variant="primary" disabled={!isModified} onClick={handleUpdate}>Update</Button>
              {isModified && <Button className="rightMargin" variant="secondary" onClick={handleCancelUpdate}>Cancel</Button>}
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
            </Form>   
          </div>
        </Container>
      </main>
      <Footer />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your account? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Profile;
