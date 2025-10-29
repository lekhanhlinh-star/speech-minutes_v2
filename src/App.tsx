import './App.css'
import { Header } from './components/Header'


import RecordingPage from "./components/RecordingPage"
import { Toaster } from "./components/ui/toaster"
import { Box } from '@chakra-ui/react'
import AudioDetailPage from './components/AudioDetailPage'
import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';


function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <>
      {!hideHeader && <Header />}
      <Box
        flex="1"
        display="flex"
        flexDir="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/record" element={
            <ProtectedRoute>
              <RecordingPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <RecordingPage />
            </ProtectedRoute>
          } />
          <Route path="/audio-detail/:audio_id" element={
            <ProtectedRoute>
              <AudioDetailPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute>
              <RecordingPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  );
}

export default App
