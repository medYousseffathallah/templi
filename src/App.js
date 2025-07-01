import React, { useEffect } from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import SwipeContainer from "./components/SwipeContainer";
import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import ExplorePage from "./pages/ExplorePage";
import UploadPage from "./pages/UploadPage";
import FavoritesPage from "./pages/FavoritesPage";
import LibraryPage from "./pages/LibraryPage";
import TrendingPage from "./pages/TrendingPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import styled from "styled-components";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

import theme from "./theme";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-default);
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
  margin-left: 240px;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 64px;
    padding: 16px;
  }
`;

function App() {
  // Register service worker for caching and offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates every 30 minutes
            setInterval(() => {
              registration.update();
            }, 30 * 60 * 1000);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContainer>
            <Sidebar />
            <Header />
            <MobileNavigation />
            <Routes>
              <Route path="/" element={<ExplorePage />} />
              <Route path="/for-you" element={<SwipeContainer />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route
                path="/favorites"
                element={<FavoritesPage />}
              />
              <Route
                path="/saved"
                element={<LibraryPage />}
              />
              <Route
                path="/trending"
                element={<TrendingPage />}
              />
              <Route
                path="/profile"
                element={<ProfilePage />}
              />
              <Route
                path="/profile/:userId"
                element={<ProfilePage />}
              />
              <Route
                path="/settings"
                element={<SettingsPage />}
              />
            </Routes>

          </AppContainer>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
