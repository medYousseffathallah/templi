import React, { useState } from "react";
import styled from "styled-components";
import { Person, Forum, ExitToApp } from "@mui/icons-material";
import { IconButton, Button } from "@mui/material";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f9f9f9;
  padding: 10px 20px;
  z-index: 100;
  background-color: white;
  margin-left: 80px; /* Space for sidebar */
`;

const AuthButton = styled(Button)`
  && {
    background-color: #fe2c55;
    color: white;
    font-weight: bold;
    border-radius: 4px;
    padding: 6px 16px;
    text-transform: none;
    &:hover {
      background-color: #e6264f;
    }
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Logo = styled.img`
  height: 40px;
  object-fit: contain;
`;

const LogoText = styled.h2`
  color: #fe2c55;
  font-weight: bold;
  margin: 0;
`;

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <HeaderContainer>
      {isAuthenticated ? (
        <ProfileSection>
          <IconButton>
            <Person fontSize="large" />
          </IconButton>
          <span>{currentUser?.username}</span>
        </ProfileSection>
      ) : (
        <AuthButton variant="contained" onClick={handleAuthClick}>
          Sign Up
        </AuthButton>
      )}

      <LogoText>Templi</LogoText>

      {isAuthenticated ? (
        <IconButton onClick={handleLogout} title="Logout">
          <ExitToApp fontSize="large" />
        </IconButton>
      ) : (
        <IconButton>
          <Forum fontSize="large" />
        </IconButton>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </HeaderContainer>
  );
}

export default Header;
