import { useState } from 'react'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainScreen from './pages/MainScreen'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        {/* pages after tested */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/main" element={<MainScreen />} />
      </Route>
    </Routes>
    </>
  )
}

export default App

