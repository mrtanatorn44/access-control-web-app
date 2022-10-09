import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from './components/Login';
import Recovery from "./components/Recovery";
import Register from './components/Register';
import Profile from "./components/Profile";
import Verify from "./components/Verify";
import ResetPassword from "./components/ResetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}