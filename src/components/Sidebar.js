import React from "react";
import styled from "styled-components";
import {
  Home,
  Explore,
  Add,
  Favorite,
  Person,
  MoreHoriz,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  z-index: 100;
  color: white;
`;

const Logo = styled.div`
  margin-bottom: 30px;
  color: #fe2c55;
  font-size: 24px;
  font-weight: bold;
`;

const SidebarOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
  cursor: pointer;
  width: 100%;
  color: ${(props) => (props.active ? "#fe2c55" : "white")};

  &:hover {
    background-color: #121212;
  }
`;

const SidebarText = styled.span`
  font-size: 12px;
  margin-top: 5px;
`;

const LoginButton = styled.button`
  margin-top: auto;
  background-color: transparent;
  border: 1px solid #fe2c55;
  color: #fe2c55;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: rgba(254, 44, 85, 0.1);
  }
`;

function Sidebar() {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarContainer>
      <Logo>TL</Logo>

      <Link to="/" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption active>
          <Home />
          <SidebarText>Pour toi</SidebarText>
        </SidebarOption>
      </Link>

      <Link to="/explore" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption>
          <Explore />
          <SidebarText>Explorer</SidebarText>
        </SidebarOption>
      </Link>

      <Link to="/upload" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption>
          <Add />
          <SidebarText>Importer</SidebarText>
        </SidebarOption>
      </Link>

      <Link to="/live" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption>
          <Favorite />
          <SidebarText>LIVE</SidebarText>
        </SidebarOption>
      </Link>

      <Link to="/profile" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption>
          <Person />
          <SidebarText>Profil</SidebarText>
        </SidebarOption>
      </Link>

      <Link to="/more" style={{ textDecoration: "none", width: "100%" }}>
        <SidebarOption>
          <MoreHoriz />
          <SidebarText>Plus</SidebarText>
        </SidebarOption>
      </Link>

      {!isAuthenticated && <LoginButton>Se connecter</LoginButton>}
    </SidebarContainer>
  );
}

export default Sidebar;
