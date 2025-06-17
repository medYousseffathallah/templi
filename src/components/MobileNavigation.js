import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Home, Explore, Add, Favorite, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const NavContainer = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--background-paper);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: ${props => props.active ? 'var(--primary-main)' : 'var(--text-secondary)'};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-main);
  }
`;

const NavText = styled.span`
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

const AddButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-main);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
  position: relative;
  bottom: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
  }
`;

function MobileNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  return (
    <NavContainer>
      <NavItem to="/" active={isActive('/').toString()}>
        <Home fontSize="small" />
        <NavText>Home</NavText>
      </NavItem>
      
      <NavItem to="/explore" active={isActive('/explore').toString()}>
        <Explore fontSize="small" />
        <NavText>Explore</NavText>
      </NavItem>
      
      <AddButton to="/upload">
        <Add />
      </AddButton>
      
      <NavItem to="/favorites" active={isActive('/favorites').toString()}>
        <Favorite fontSize="small" />
        <NavText>Favorites</NavText>
      </NavItem>
      
      <NavItem 
        to={isAuthenticated ? "/profile" : "#"} 
        active={isActive('/profile').toString()} 
        onClick={!isAuthenticated ? () => document.dispatchEvent(new CustomEvent('openAuthModal')) : undefined}
      >
        <Person fontSize="small" />
        <NavText>{isAuthenticated ? 'Profile' : 'Login'}</NavText>
      </NavItem>
    </NavContainer>
  );
}

export default MobileNavigation;