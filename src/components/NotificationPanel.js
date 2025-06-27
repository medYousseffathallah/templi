import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Close,
  Visibility,
  Favorite,
  Download,
  Star,
  RateReview,
  Person,
  Description
} from '@mui/icons-material';
import {
  IconButton,
  Typography,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { interactionApi } from '../services/api';

const NotificationContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 500px;
  background-color: var(--background-paper);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 320px;
    right: -20px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: var(--background-paper);
`;

const NotificationTitle = styled(Typography)`
  && {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 88, 100, 0.04);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  
  &.view {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }
  
  &.like {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  &.download {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
  
  &.review {
    background-color: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }
  
  &.profile {
    background-color: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationText = styled(Typography)`
  && {
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.4;
  }
`;

const NotificationTime = styled(Typography)`
  && {
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--text-secondary);
`;

function NotificationPanel({ isOpen, onClose, onNotificationCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchNotifications();
    }
  }, [isOpen, currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await interactionApi.getNotifications(currentUser._id || currentUser.id);
      const notificationsData = response.data || [];
      
      // Convert timestamp strings to Date objects
      const formattedNotifications = notificationsData.map(notification => ({
        ...notification,
        timestamp: new Date(notification.timestamp)
      }));
      
      setNotifications(formattedNotifications);
       
       // Update notification count in parent component
       if (onNotificationCountChange) {
         const unreadCount = formattedNotifications.filter(n => !n.read).length;
         onNotificationCountChange(unreadCount);
       }
     } catch (error) {
       console.error('Error fetching notifications:', error);
       if (onNotificationCountChange) {
         onNotificationCountChange(0);
       }
     } finally {
       setLoading(false);
     }
   };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Favorite fontSize="small" />;
      case 'view':
        return <Visibility fontSize="small" />;
      case 'download':
        return <Download fontSize="small" />;
      case 'review':
        return <RateReview fontSize="small" />;
      case 'profile':
        return <Person fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  if (!isOpen) return null;

  return (
    <NotificationContainer>
      <NotificationHeader>
        <NotificationTitle>Notifications</NotificationTitle>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </NotificationHeader>
      
      <NotificationList>
        {loading ? (
          <EmptyState>
            <EmptyIcon>
              <Description fontSize="large" />
            </EmptyIcon>
            <Typography variant="body2" color="textSecondary">
              Loading notifications...
            </Typography>
          </EmptyState>
        ) : notifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Description fontSize="large" />
            </EmptyIcon>
            <Typography variant="body2" color="textSecondary">
              No notifications yet
            </Typography>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
              You'll see interactions with your templates here
            </Typography>
          </EmptyState>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id}>
              <NotificationIcon className={notification.type}>
                {getNotificationIcon(notification.type)}
              </NotificationIcon>
              <NotificationContent>
                <NotificationText>
                  {notification.message}
                </NotificationText>
                <NotificationTime>
                  {formatTimeAgo(notification.timestamp)}
                </NotificationTime>
              </NotificationContent>
            </NotificationItem>
          ))
        )}
      </NotificationList>
    </NotificationContainer>
  );
}

export default NotificationPanel;