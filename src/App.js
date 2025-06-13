import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import SwipeContainer from "./components/SwipeContainer";
import Sidebar from "./components/Sidebar";
import ExplorePage from "./pages/ExplorePage";
import styled from "styled-components";
import { AuthProvider } from "./context/AuthContext";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fafafa;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Sidebar />
          <Header />
          <Routes>
            <Route path="/" element={<SwipeContainer />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route
              path="/upload"
              element={<div className="page-content">Upload Page</div>}
            />
            <Route
              path="/live"
              element={<div className="page-content">Live Page</div>}
            />
            <Route
              path="/profile"
              element={<div className="page-content">Profile Page</div>}
            />
            <Route
              path="/more"
              element={<div className="page-content">More Options</div>}
            />
          </Routes>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
