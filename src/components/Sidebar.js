import React from "react";
import styled from "styled-components";
import {
  Home,
  Explore,
  Add,
  Favorite,
  Person,
  Settings,
  Bookmark,
  Lightbulb,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background-color: var(--background-sidebar);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  z-index: 100;
  color: var(--text-primary);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    display: none; /* Hide on mobile, will be replaced with bottom navigation */
  }
`;

const LogoContainer = styled.div`
  padding: 0 24px;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  color: var(--primary-main);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
`;

const LogoSubtitle = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 24px;
  margin-bottom: 12px;
`;

const SidebarOption = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  width: 100%;
  color: ${(props) => (props.active === "true" ? "var(--primary-main)" : "var(--text-primary)")};
  background-color: ${(props) => (props.active === "true" ? "rgba(255, 88, 100, 0.1)" : "transparent")};
  border-left: ${(props) => (props.active === "true" ? "3px solid var(--primary-main)" : "3px solid transparent")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active === "true" ? "rgba(255, 88, 100, 0.1)" : "rgba(0, 0, 0, 0.03)")};
    color: var(--primary-main);
  }
`;

const SidebarText = styled.span`
  font-size: 14px;
  font-weight: 500;
  margin-left: 16px;
`;

const LoginButton = styled.button`
  margin: 24px;
  margin-top: auto;
  background-color: var(--primary-main);
  border: none;
  color: white;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);

  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
  }
`;

const FooterText = styled.div`
  color: var(--text-secondary);
  font-size: 11px;
  text-align: center;
  padding: 16px 24px;
`;

function Sidebar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo>Templi</Logo>
        <LogoSubtitle>Template Explorer</LogoSubtitle>
      </LogoContainer>

      <SidebarSection>
        <SectionTitle>Discover</SectionTitle>
        
        <Link to="/" style={{ textDecoration: "none" }}>
          <SidebarOption active={isActive("/").toString()}>
            <Home />
            <SidebarText>For You</SidebarText>
          </SidebarOption>
        </Link>

        <Link to="/explore" style={{ textDecoration: "none" }}>
          <SidebarOption active={isActive("/explore").toString()}>
            <Explore />
            <SidebarText>Explore</SidebarText>
          </SidebarOption>
        </Link>
        
        <Link to="/trending" style={{ textDecoration: "none" }}>
          <SidebarOption active={isActive("/trending").toString()}>
            <Lightbulb />
            <SidebarText>Trending</SidebarText>
          </SidebarOption>
        </Link>
      </SidebarSection>
      
      {isAuthenticated && (
        <SidebarSection>
          <SectionTitle>Library</SectionTitle>
          
          <Link to="/saved" style={{ textDecoration: "none" }}>
            <SidebarOption active={isActive("/saved").toString()}>
              <Bookmark />
            <SidebarText>My Library</SidebarText>
            </SidebarOption>
          </Link>
        </SidebarSection>
      )}
      
      <SidebarSection>
        <SectionTitle>Create</SectionTitle>
        
        <Link to="/upload" style={{ textDecoration: "none" }}>
          <SidebarOption active={isActive("/upload").toString()}>
            <Add />
            <SidebarText>Upload</SidebarText>
          </SidebarOption>
        </Link>
      </SidebarSection>

      {isAuthenticated ? (
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <SidebarOption active={isActive("/profile").toString()}>
            <Person />
            <SidebarText>Profile</SidebarText>
          </SidebarOption>
        </Link>
      ) : (
        <LoginButton onClick={() => document.dispatchEvent(new CustomEvent('openAuthModal'))}>Sign In</LoginButton>
      )}
      
      <Link to="/settings" style={{ textDecoration: "none", marginTop: "auto" }}>
        <SidebarOption active={isActive("/settings").toString()}>
          <Settings />
          <SidebarText>Settings</SidebarText>
        </SidebarOption>
      </Link>
      
      <FooterText>© 2023 Templi</FooterText>
    </SidebarContainer>
  );
}

export default Sidebar;
