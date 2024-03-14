import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import ForgotPassword from "./Authentication/ForgotPassword";
import PhoneSignUp from "./Authentication/PhoneSignUp";
import ProtectedRoute from "./context/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Profile from "./components/Profile";
import Help from "./components/Help";

function App() {
  return (
          <UserAuthContextProvider>
            <Routes>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>} />
              <Route path="/" element={<Login />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/phonesignup" element={<PhoneSignUp />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>} />
                  <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>} />
            </Routes>
          </UserAuthContextProvider>
  );
}

export default App;
