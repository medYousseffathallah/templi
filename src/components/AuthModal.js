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
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? "var(--primary-main)" : "transparent")};
  color: ${(props) => (props.active ? "var(--primary-main)" : "var(--text-secondary)")};
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    color: var(--primary-main);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: var(--primary-main);
    box-shadow: 0 0 0 3px rgba(255, 88, 100, 0.1);
  }
`;

const Button = styled.button`
  padding: 14px 16px;
  background-color: var(--primary-main);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
  }
  &:disabled {
    background-color: #ffb3c0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: var(--status-error);
  margin-bottom: 16px;
  font-size: 14px;
  padding: 8px 12px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
`;

const SuccessMessage = styled.div`
  color: var(--status-success);
  margin-bottom: 16px;
  font-size: 14px;
  padding: 8px 12px;
  background-color: rgba(46, 204, 113, 0.1);
  border-radius: 6px;
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
