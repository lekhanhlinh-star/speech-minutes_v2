import './App.css'
import { Header } from './components/Header'


// import RecordingPage from "./components/RecordingPage"
import { Toaster } from "./components/ui/toaster"
import { Box } from '@chakra-ui/react'
import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import UploadPage from './page/UploadPage'
import MeetingStatusPage from './page/MeetingStatusPage'
import MeetingDetailPage from './page/MeetingDetailPage'
import RecordingPage from './page/RecordingPage'
import HomePage from './page/HomePage'


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
        width="100%"
        minH="100vh"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/record" element={<RecordingPage />} />
            <Route path="/uploads" element={<UploadPage />} />
            <Route path="/meeting-status" element={<MeetingStatusPage />} />
            {/* <Route path="/meetings" element={<MeetingStatusPage />} /> */}
            <Route path="/meeting/:meetingId" element={<MeetingDetailPage />} />
          </Route>

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
