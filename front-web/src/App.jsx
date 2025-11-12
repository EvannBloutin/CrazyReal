import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateMission from './pages/CreateMission'
import MissionChallenge from './pages/MissionChallenge'
import NavBar from './components/NavBar'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <div>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={isAuthenticated ? <CreateMission /> : <Navigate to="/login" />} />
          <Route path="/challenge" element={isAuthenticated ? <MissionChallenge /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
