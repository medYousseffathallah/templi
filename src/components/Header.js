import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { Person, Forum, ExitToApp, Search, Notifications } from "@mui/icons-material";
import { IconButton, Button, Avatar, Badge, InputBase } from "@mui/material";
import AuthModal from "./AuthModal";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "../context/AuthContext";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 24px;
  height: 64px;
  z-index: 100;
  background-color: var(--background-paper);
  margin-left: 240px; /* Space for sidebar */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 12px 16px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-default);
  border-radius: 24px;
  padding: 4px 16px;
  width: 300px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  
  @media (max-width: 1024px) {
    width: 200px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled(InputBase)`
  && {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    margin-left: 8px;
  }
`;

const SearchForm = styled.form`
  display: contents;
`;

const AuthButton = styled(Button)`
  && {
    background-color: var(--primary-main);
    color: white;
    font-weight: 600;
    border-radius: 8px;
    padding: 8px 20px;
    text-transform: none;
    box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
    }
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserAvatar = styled(Avatar)`
  && {
    width: 36px;
    height: 36px;
    background-color: var(--primary-light);
  }
`;

const StyledIconButton = styled(IconButton)`
  && {
    color: var(--text-secondary);
    &:hover {
      color: var(--primary-main);
      background-color: rgba(255, 88, 100, 0.08);
    }
  }
`;

const LogoText = styled.h2`
  color: var(--primary-main);
  font-weight: 700;
  margin: 0;
  font-size: 24px;
  
  @media (min-width: 769px) {
    display: none; /* Hide on desktop as it's shown in sidebar */
  }
`;

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to explore page with search query
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Listen for openAuthModal event from Sidebar or MobileNavigation
  React.useEffect(() => {
    const handleOpenAuthModal = () => setShowAuthModal(true);
    document.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => document.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, []);

  return (
    <HeaderContainer>
      <LogoText>Templi</LogoText>
      
      <SearchBar>
        <Search fontSize="small" style={{ color: 'var(--text-secondary)' }} />
        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInput 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchForm>
      </SearchBar>
      
      <HeaderSection>
        {isAuthenticated ? (
          <>
            <StyledIconButton size="medium" onClick={handleNotificationClick}>
              <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                <Notifications />
              </Badge>
            </StyledIconButton>
            
            <ProfileSection>
              <UserName>{currentUser?.username || 'User'}</UserName>
              <UserAvatar 
                onClick={handleProfileClick} 
                style={{ cursor: 'pointer' }}
                title="Go to Profile"
              >
                {currentUser?.username?.[0]?.toUpperCase() || 'U'}
              </UserAvatar>
              <StyledIconButton onClick={handleLogout} title="Logout" size="small">
                <ExitToApp />
              </StyledIconButton>
            </ProfileSection>
            
            {showNotifications && (
              <NotificationPanel 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onNotificationCountChange={setNotificationCount}
              />
            )}
          </>
        ) : (
          <AuthButton variant="contained" onClick={handleAuthClick}>
            Sign Up
          </AuthButton>
        )}
      </HeaderSection>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </HeaderContainer>
  );
}

export default Header;
