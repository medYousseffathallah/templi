import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { Close } from "@mui/icons-material";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  &:hover {
    color: #333;
  }
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#fe2c55" : "transparent")};
  color: ${(props) => (props.active ? "#fe2c55" : "#888")};
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    color: #fe2c55;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #fe2c55;
  }
`;

const Button = styled.button`
  padding: 12px 15px;
  background-color: #fe2c55;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #e6264f;
  }
  &:disabled {
    background-color: #ffb3c0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e6264f;
  margin-bottom: 15px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-bottom: 15px;
  font-size: 14px;
`;

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setFormError("");
      setSuccess("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear success message when user starts typing
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (activeTab === "signup") {
      if (!formData.username.trim()) {
        setFormError("Username is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        return false;
      }
    }

    if (!formData.email.trim()) {
      setFormError("Email is required");
      return false;
    }

    if (!formData.password) {
      setFormError("Password is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (activeTab === "login") {
        await login(formData.email, formData.password);
        setSuccess("Login successful!");
        setTimeout(() => onClose(), 1000);
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setSuccess("Registration successful!");
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          (activeTab === "login" ? "Login failed" : "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <Close />
        </CloseButton>

        <Tabs>
          <Tab
            active={activeTab === "login"}
            onClick={() => {
              setActiveTab("login");
              setFormError("");
              setSuccess("");
            }}
          >
            Login
          </Tab>
          <Tab
            active={activeTab === "signup"}
            onClick={() => {
              setActiveTab("signup");
              setFormError("");
              setSuccess("");
            }}
          >
            Sign Up
          </Tab>
        </Tabs>

        {formError && <ErrorMessage>{formError}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          )}

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          {activeTab === "signup" && (
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          )}

          <Button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : activeTab === "login"
              ? "Login"
              : "Sign Up"}
          </Button>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AuthModal;
