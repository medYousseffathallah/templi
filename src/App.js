import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import SwipeContainer from "./components/SwipeContainer";
import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import ExplorePage from "./pages/ExplorePage";
import UploadPage from "./pages/UploadPage";
import FavoritesPage from "./pages/FavoritesPage";
import TrendingPage from "./pages/TrendingPage";
import styled from "styled-components";
import { AuthProvider } from "./context/AuthContext";
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
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Sidebar />
          <Header />
          <MobileNavigation />
          <Routes>
            <Route path="/" element={<SwipeContainer />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route
              path="/favorites"
              element={<FavoritesPage />}
            />
            <Route
              path="/saved"
              element={<PageWrapper>Saved Templates</PageWrapper>}
            />
            <Route
              path="/trending"
              element={<TrendingPage />}
            />
            <Route
              path="/profile"
              element={<PageWrapper>Profile Page</PageWrapper>}
            />
            <Route
              path="/settings"
              element={<PageWrapper>Settings</PageWrapper>}
            />
          </Routes>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
