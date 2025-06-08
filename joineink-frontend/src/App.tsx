import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import './styles/custom-inputs.css';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/organizer/DashboardPage';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { EventDetailsPage } from './pages/organizer/EventDetailsPage';
import { ContributorPage } from './pages/contributor/ContributorPage';
import { CircleJoinPage } from './pages/contributor/CircleJoinPage';
import { KeepsakeBookPage } from './pages/recipient/KeepsakeBookPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Organizer routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/create-event" element={<CreateEventPage />} />
              <Route path="/event/:eventId" element={<EventDetailsPage />} />
              
              {/* Contributor routes */}
              <Route path="/contribute/:token" element={<ContributorPage />} />
              <Route path="/contributor" element={<ContributorPage />} /> {/* For testing */}
              <Route path="/join-circle/:token" element={<CircleJoinPage />} />
              
              {/* Recipient routes */}
              <Route path="/keepsake/:accessToken" element={<KeepsakeBookPage />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 