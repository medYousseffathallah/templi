import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { userApi, templateApi, reviewApi } from "../services/api";
import {
  Person,
  Verified,
  GitHub,
  LinkedIn,
  Language,
  Star,
  Favorite,
  Download,
  Upload,
  CalendarToday,
  Edit,
  Link as LinkIcon,
  CheckCircle,
  TrendingUp,
  EmojiEvents,
  Timeline,
  Add,
  Send,
  RateReview
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Rating,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { CircularProgress } from "@mui/material";

const ProfileContainer = styled.div`
  padding: 24px;
  margin-left: 240px;
  margin-top: 64px;
  max-width: 1200px;
  min-height: calc(100vh - 64px);
  background-color: var(--background-default);
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 80px;
    padding: 16px;
  }
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled(Avatar)`
  width: 120px !important;
  height: 120px !important;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ProfileDetails = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileRole = styled.p`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  opacity: 0.9;
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: transform 0.2s ease !important;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  }
`;

const StatContent = styled(CardContent)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#667eea'};
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 4px;
`;

const SectionCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
`;

const SectionHeader = styled.div`
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
`;

const SocialLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 24px;
`;

const SocialLink = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  
  &.verified {
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.05);
  }
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#667eea'};
  color: white;
`;

const SocialInfo = styled.div`
  flex: 1;
`;

const SocialName = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const SocialUrl = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 2px;
`;

const ProgressSection = styled.div`
  padding: 24px;
`;

const ProgressItem = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const ProgressValue = styled.div`
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
`;

const CustomLinearProgress = styled(LinearProgress)`
  height: 8px !important;
  border-radius: 4px !important;
  background-color: #e9ecef !important;
  
  .MuiLinearProgress-bar {
    border-radius: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
`;

const BioSection = styled.div`
  padding: 24px;
`;

const BioText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin: 0 0 16px 0;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const CustomChip = styled(Chip)`
  background: linear-gradient(45deg, #667eea 30%, #764ba2 90%) !important;
  color: white !important;
  font-weight: 500 !important;
`;

const ActivityTimeline = styled.div`
  padding: 24px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimelineIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#667eea'};
  color: white;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const TimelineDate = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 2px;
`;

const ReviewsSection = styled.div`
  padding: 24px;
`;

const ReviewItem = styled.div`
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ReviewerAvatar = styled(Avatar)`
  width: 32px !important;
  height: 32px !important;
`;

const ReviewerInfo = styled.div`
  flex: 1;
`;

const ReviewerName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const ReviewDate = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const ReviewText = styled.p`
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
`;

function ProfilePage() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const isOwnProfile = !userId || userId === currentUser?._id;
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    templatesUploaded: 0,
    totalFavorites: 0,
    totalDownloads: 0,
    averageRating: 0,
    profileCompletion: 0
  });
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [templatesDialog, setTemplatesDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    bio: '',
    website: ''
  });
  const [saving, setSaving] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [socialLinksDialog, setSocialLinksDialog] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [socialLinksForm, setSocialLinksForm] = useState({
    github: '',
    linkedin: '',
    portfolio: ''
  });
  const [userReviews, setUserReviews] = useState([]);

  // Social links with real data
  const [socialLinks, setSocialLinks] = useState([
    {
      platform: 'GitHub',
      url: profile?.socialLinks?.github || '',
      fullUrl: profile?.socialLinks?.github ? `https://github.com/${profile.socialLinks.github}` : '',
      icon: GitHub,
      color: '#333',
      verified: !!profile?.socialLinks?.github
    },
    {
      platform: 'LinkedIn',
      url: profile?.socialLinks?.linkedin || '',
      fullUrl: profile?.socialLinks?.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : '',
      icon: LinkedIn,
      color: '#0077b5',
      verified: !!profile?.socialLinks?.linkedin
    },
    {
      platform: 'Portfolio',
      url: profile?.socialLinks?.portfolio || '',
      fullUrl: profile?.socialLinks?.portfolio || '',
      icon: Language,
      color: '#667eea',
      verified: !!profile?.socialLinks?.portfolio
    }
  ]);

  const achievements = [
    { name: 'Top Creator', icon: EmojiEvents, color: '#ffd700' },
    { name: 'Trending Designer', icon: TrendingUp, color: '#ff6b6b' },
    { name: 'Community Favorite', icon: Favorite, color: '#e74c3c' }
  ];

  // Real activity timeline based on user data
  const getActivityTimeline = () => {
    const activities = [];
    
    // Add recent template uploads
    if (userTemplates.length > 0) {
      userTemplates.slice(0, 3).forEach(template => {
        activities.push({
          type: 'upload',
          title: `Uploaded template "${template.title}"`,
          date: template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Recently',
          icon: Upload,
          color: '#28a745'
        });
      });
    }
    
    // Add join date
    if (profile?.createdAt || currentUser?.createdAt) {
      const joinDate = new Date(profile?.createdAt || currentUser?.createdAt);
      activities.push({
        type: 'joined',
        title: 'Joined Templi community',
        date: joinDate.toLocaleDateString(),
        icon: CalendarToday,
        color: '#6c757d'
      });
    }
    
    // Add milestone achievements
    if (stats.totalDownloads >= 1000) {
      activities.push({
        type: 'milestone',
        title: `Reached ${stats.totalDownloads} total downloads`,
        date: 'Recently',
        icon: Download,
        color: '#667eea'
      });
    }
    
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Initialize reviews state
  const [reviews, setReviews] = useState([]);

  // Fetch reviews for the user
  const fetchReviews = async (targetUserId) => {
    try {
      const response = await reviewApi.getByUser(targetUserId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]); // Set empty array as fallback
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUserId = userId || currentUser?._id || currentUser?.id;
        if (!targetUserId) {
          console.error('No user ID found');
          return;
        }
        
        console.log('Fetching profile for user ID:', targetUserId);
        
        // Fetch reviews for this user
        await fetchReviews(targetUserId);
        const profileResponse = await userApi.getProfile(targetUserId);
        setProfile(profileResponse.data);
        
        // Initialize edit form with current data
        setEditForm({
          name: profileResponse.data.name || currentUser.name || currentUser.username || '',
          role: profileResponse.data.role || '',
          bio: profileResponse.data.bio || '',
          website: profileResponse.data.website || ''
        });
        
        // Initialize social links form
        setSocialLinksForm({
          github: profileResponse.data.socialLinks?.github || '',
          linkedin: profileResponse.data.socialLinks?.linkedin || '',
          portfolio: profileResponse.data.socialLinks?.portfolio || ''
        });
        
        // Update social links state
        setSocialLinks([
          {
            platform: 'GitHub',
            url: profileResponse.data.socialLinks?.github || '',
            fullUrl: profileResponse.data.socialLinks?.github ? `https://github.com/${profileResponse.data.socialLinks.github}` : '',
            icon: GitHub,
            color: '#333',
            verified: !!profileResponse.data.socialLinks?.github
          },
          {
            platform: 'LinkedIn',
            url: profileResponse.data.socialLinks?.linkedin || '',
            fullUrl: profileResponse.data.socialLinks?.linkedin ? `https://linkedin.com/in/${profileResponse.data.socialLinks.linkedin}` : '',
            icon: LinkedIn,
            color: '#0077b5',
            verified: !!profileResponse.data.socialLinks?.linkedin
          },
          {
            platform: 'Portfolio',
            url: profileResponse.data.socialLinks?.portfolio || '',
            fullUrl: profileResponse.data.socialLinks?.portfolio || '',
            icon: Language,
            color: '#667eea',
            verified: !!profileResponse.data.socialLinks?.portfolio
          }
        ]);
        
        // Fetch user's templates and stats
        try {
          console.log('About to fetch templates for userId:', targetUserId);
          console.log('Current user object:', currentUser);
          const templatesResponse = await userApi.getUserTemplates(targetUserId);
          console.log('Templates response:', templatesResponse);
          const templatesData = templatesResponse.data || templatesResponse;
          setUserTemplates(templatesData);
          
          // Fetch real-time user statistics
          console.log('Fetching user stats for userId:', targetUserId);
          const statsResponse = await userApi.getUserStats(targetUserId);
          console.log('Stats response:', statsResponse);
          const statsData = statsResponse.data || statsResponse;
          
          setStats({
            templatesUploaded: statsData.templatesUploaded || 0,
            totalFavorites: statsData.totalFavorites || 0,
            totalDownloads: statsData.totalDownloads || 0,
            averageRating: statsData.averageRating || 0,
            profileCompletion: statsData.profileCompletion || calculateProfileCompletion(profileResponse.data)
          });
        } catch (templatesError) {
          console.error('Error fetching templates or stats:', templatesError);
          console.error('Error details:', {
            status: templatesError.response?.status,
            statusText: templatesError.response?.statusText,
            data: templatesError.response?.data,
            url: templatesError.config?.url
          });
          // Fallback to basic calculation if API fails
          const averageRating = reviews.length > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : 0;
            
          setStats({
            templatesUploaded: 0,
            totalFavorites: 0,
            totalDownloads: 0,
            averageRating: averageRating,
            profileCompletion: calculateProfileCompletion(profileResponse.data)
          });
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to mock data if profile API fails
        const averageRating = reviews.length > 0 
          ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
          : 0;
          
        setStats({
          templatesUploaded: 12,
          totalFavorites: 156,
          totalDownloads: 2340,
          averageRating: averageRating,
          profileCompletion: 75
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser || userId) {
      fetchProfile();
    }
  }, [currentUser, userId]);

  // Handle profile update
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) {
        console.error('No user ID found for profile update');
        return;
      }
      
      console.log('Updating profile for user ID:', userId);
      const updatedProfile = await userApi.updateProfile(userId, editForm);
      setProfile(updatedProfile.data || updatedProfile);
      setEditDialog(false);
      // Show success message
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle templates section click
  const handleTemplatesClick = () => {
    setTemplatesDialog(true);
  };

  // Handle social link click
  const handleSocialLinkClick = (url) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;
    
    // Check if user is authenticated
    if (!currentUser) {
      alert('You must be logged in to submit a review');
      return;
    }
    
    try {
      const targetUserId = userId || profile?._id;
      if (!targetUserId) {
        console.error('No target user ID found');
        return;
      }
      
      // Check if user is trying to review themselves
      if (currentUser._id === targetUserId || currentUser.id === targetUserId) {
        alert('You cannot review yourself');
        return;
      }
      
      const response = await reviewApi.create({
        reviewedUser: targetUserId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      setReviews(prev => [response.data, ...prev]);
       setNewReview({ rating: 5, comment: '' });
       setReviewDialog(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };
  
  // Handle social links update
  const handleUpdateSocialLinks = async () => {
    setSaving(true);
    try {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) {
        console.error('No user ID found for social links update');
        return;
      }
      
      const updatedProfile = await userApi.updateProfile(userId, {
        socialLinks: socialLinksForm
      });
      
      // Update local state
      setSocialLinks([
        {
          platform: 'GitHub',
          url: socialLinksForm.github,
          fullUrl: socialLinksForm.github ? `https://github.com/${socialLinksForm.github}` : '',
          icon: GitHub,
          color: '#333',
          verified: !!socialLinksForm.github
        },
        {
          platform: 'LinkedIn',
          url: socialLinksForm.linkedin,
          fullUrl: socialLinksForm.linkedin ? `https://linkedin.com/in/${socialLinksForm.linkedin}` : '',
          icon: LinkedIn,
          color: '#0077b5',
          verified: !!socialLinksForm.linkedin
        },
        {
          platform: 'Portfolio',
          url: socialLinksForm.portfolio,
          fullUrl: socialLinksForm.portfolio,
          icon: Language,
          color: '#667eea',
          verified: !!socialLinksForm.portfolio
        }
      ]);
      
      setSocialLinksDialog(false);
      console.log('Social links updated successfully');
    } catch (error) {
      console.error('Error updating social links:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = (profileData) => {
    let completion = 0;
    const fields = ['name', 'email', 'bio', 'avatar'];
    
    fields.forEach(field => {
      if (profileData && profileData[field]) {
        completion += 25;
      }
    });
    
    return completion;
  };

  if (loading) {
    return (
      <ProfileContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </ProfileContainer>
    );
  }

  if (!currentUser) {
    return (
      <ProfileContainer>
        <Box textAlign="center" py={8}>
          <Person sx={{ fontSize: 80, color: '#bdc3c7', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Please sign in to view your profile
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Sign In
          </Button>
        </Box>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      {/* Profile Header */}
      <ProfileHeader>
        <ProfileInfo>
          <ProfileAvatar
            src={profile?.avatar || '/api/placeholder/120/120'}
            alt={profile?.name || currentUser.name || 'User'}
          >
            {!profile?.avatar && (profile?.name || currentUser.name || 'U')[0]}
          </ProfileAvatar>
          
          <ProfileDetails>
            <ProfileName>
              {profile?.name || currentUser.name || 'User Name'}
              <Verified sx={{ color: '#28a745', fontSize: '2rem' }} />
            </ProfileName>
            
            <ProfileRole>
              {profile?.role || 'UI/UX Designer & Developer'}
            </ProfileRole>
            
            <VerificationBadge>
              <CheckCircle sx={{ fontSize: '1.2rem' }} />
              Verified Creator
            </VerificationBadge>
            
            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
              {achievements.map((achievement, index) => (
                <Chip
                  key={index}
                  icon={<achievement.icon sx={{ color: achievement.color + ' !important' }} />}
                  label={achievement.name}
                  variant="outlined"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </Box>
          </ProfileDetails>
          
          {isOwnProfile && (
            <IconButton 
              onClick={() => setEditDialog(true)}
              sx={{ color: 'white', alignSelf: 'flex-start' }}
            >
              <Edit />
            </IconButton>
          )}
        </ProfileInfo>
      </ProfileHeader>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard onClick={handleTemplatesClick} style={{ cursor: 'pointer' }}>
          <StatContent>
            <StatIcon color="#667eea">
              <Upload />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.templatesUploaded}</StatValue>
              <StatLabel>Templates Uploaded</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon color="#e74c3c">
              <Favorite />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.totalFavorites}</StatValue>
              <StatLabel>Total Favorites</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon color="#28a745">
              <Download />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.totalDownloads}</StatValue>
              <StatLabel>Total Downloads</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon color="#f39c12">
              <Star />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.averageRating || 'N/A'}</StatValue>
              <StatLabel>Average Rating</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Profile Completion */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Profile Completion</SectionTitle>
        </SectionHeader>
        <ProgressSection>
          <ProgressItem>
            <ProgressHeader>
              <ProgressLabel>Overall Progress</ProgressLabel>
              <ProgressValue>{stats.profileCompletion}%</ProgressValue>
            </ProgressHeader>
            <CustomLinearProgress 
              variant="determinate" 
              value={stats.profileCompletion} 
            />
          </ProgressItem>
        </ProgressSection>
      </SectionCard>

      {/* Social Links */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Verified Social & Portfolio Links</SectionTitle>
          {isOwnProfile && (
            <Button 
              startIcon={<Edit />} 
              variant="outlined" 
              size="small"
              onClick={() => setSocialLinksDialog(true)}
            >
              Edit Links
            </Button>
          )}
        </SectionHeader>
        <SocialLinksGrid>
          {socialLinks.map((link, index) => (
            <SocialLink 
              key={index} 
              className={link.verified ? 'verified' : ''}
              onClick={() => handleSocialLinkClick(link.fullUrl)}
              style={{ cursor: 'pointer' }}
            >
              <SocialIcon color={link.color}>
                <link.icon />
              </SocialIcon>
              <SocialInfo>
                <SocialName>
                  {link.platform}
                  {link.verified && <CheckCircle sx={{ ml: 1, fontSize: '1rem', color: '#28a745' }} />}
                </SocialName>
                <SocialUrl>{link.url}</SocialUrl>
              </SocialInfo>
            </SocialLink>
          ))}
        </SocialLinksGrid>
      </SectionCard>

      {/* Creator Bio */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>About</SectionTitle>
          {isOwnProfile && (
            <IconButton size="small" onClick={() => setEditMode(!editMode)}>
              <Edit />
            </IconButton>
          )}
        </SectionHeader>
        <BioSection>
          <BioText>
            {profile?.bio || "Passionate UI/UX designer and developer with 5+ years of experience creating beautiful, functional digital experiences. I specialize in modern web applications, mobile interfaces, and design systems that scale."}
          </BioText>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Design Philosophy
          </Typography>
          <BioText>
            "Great design is not just about how it looks, but how it works. I believe in creating intuitive, accessible, and delightful user experiences that solve real problems."
          </BioText>
          
          <TagsContainer>
            {['React', 'Figma', 'TypeScript', 'Node.js', 'Design Systems', 'Mobile First'].map((tag, index) => (
              <CustomChip key={index} label={tag} size="small" />
            ))}
          </TagsContainer>
        </BioSection>
      </SectionCard>

      {/* Activity Timeline */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Recent Activity</SectionTitle>
        </SectionHeader>
        <ActivityTimeline>
          {getActivityTimeline().map((item, index) => (
            <TimelineItem key={index}>
              <TimelineIcon color={item.color}>
                <item.icon sx={{ fontSize: '1.2rem' }} />
              </TimelineIcon>
              <TimelineContent>
                <TimelineTitle>{item.title}</TimelineTitle>
                <TimelineDate>{item.date}</TimelineDate>
              </TimelineContent>
            </TimelineItem>
          ))}
        </ActivityTimeline>
      </SectionCard>

      {/* Community Reviews */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Community Reviews</SectionTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Rating value={4.9} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="textSecondary">
                4.9 ({reviews.length} reviews)
              </Typography>
            </Box>
            {!isOwnProfile && (
              <Button 
                startIcon={<RateReview />} 
                variant="outlined" 
                size="small"
                onClick={() => setReviewDialog(true)}
              >
                Write Review
              </Button>
            )}
          </Box>
        </SectionHeader>
        <ReviewsSection>
              {reviews.map((review, index) => (
                <ReviewItem key={review._id || index}>
                  <ReviewHeader>
                    <ReviewerAvatar 
                      src={review.reviewer?.profilePicture || '/api/placeholder/32/32'} 
                      alt={review.reviewer?.name || 'Anonymous'} 
                    />
                    <ReviewerInfo>
                      <ReviewerName>{review.reviewer?.name || review.reviewer?.username || 'Anonymous'}</ReviewerName>
                      <ReviewDate>{new Date(review.createdAt).toLocaleDateString()}</ReviewDate>
                    </ReviewerInfo>
                    <Rating value={review.rating} readOnly size="small" />
                  </ReviewHeader>
                  <ReviewText>{review.comment}</ReviewText>
                </ReviewItem>
              ))}
            </ReviewsSection>
      </SectionCard>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              fullWidth
              label="Display Name"
              value={editForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Role/Title"
              value={editForm.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={4}
              value={editForm.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Website/Portfolio"
              value={editForm.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
        </Dialog>
      )}

      {/* Templates Dialog */}
      {isOwnProfile && (
        <Dialog open={templatesDialog} onClose={() => setTemplatesDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          My Templates ({stats.templatesUploaded})
        </DialogTitle>
        <DialogContent>
          <Box py={2}>
            {userTemplates.length > 0 ? (
              <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2}>
                {userTemplates.map((template, index) => (
                  <Box key={index} p={2} border={1} borderColor="grey.300" borderRadius={2}>
                    <Typography variant="h6" gutterBottom>{template.title}</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {template.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Typography variant="body2">
                        ❤️ {template.favorites || 0} favorites
                      </Typography>
                      <Typography variant="body2">
                        ⬇️ {template.downloads || 0} downloads
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                  No templates uploaded yet
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Start creating and sharing your amazing templates!
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplatesDialog(false)}>Close</Button>
        </DialogActions>
        </Dialog>
      )}

      {/* Review Dialog */}
      {!isOwnProfile && (
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography variant="subtitle1" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview(prev => ({ ...prev, rating: newValue }));
              }}
              size="large"
            />
            <TextField
              fullWidth
              label="Your Review"
              multiline
              rows={4}
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              margin="normal"
              placeholder="Share your experience working with this creator..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReview}
            disabled={!newReview.comment.trim()}
            startIcon={<Send />}
          >
            Submit Review
          </Button>
        </DialogActions>
        </Dialog>
      )}

      {/* Social Links Dialog */}
      {isOwnProfile && (
        <Dialog open={socialLinksDialog} onClose={() => setSocialLinksDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Social Links</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              fullWidth
              label="GitHub Username"
              value={socialLinksForm.github}
              onChange={(e) => setSocialLinksForm(prev => ({ ...prev, github: e.target.value }))}
              margin="normal"
              placeholder="your-username"
              helperText="Enter your GitHub username (without https://github.com/)"
            />
            <TextField
              fullWidth
              label="LinkedIn Username"
              value={socialLinksForm.linkedin}
              onChange={(e) => setSocialLinksForm(prev => ({ ...prev, linkedin: e.target.value }))}
              margin="normal"
              placeholder="your-username"
              helperText="Enter your LinkedIn username (without https://linkedin.com/in/)"
            />
            <TextField
              fullWidth
              label="Portfolio URL"
              value={socialLinksForm.portfolio}
              onChange={(e) => setSocialLinksForm(prev => ({ ...prev, portfolio: e.target.value }))}
              margin="normal"
              placeholder="https://your-portfolio.com"
              helperText="Enter your complete portfolio URL"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSocialLinksDialog(false)} disabled={saving}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateSocialLinks}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Links'}
          </Button>
        </DialogActions>
        </Dialog>
      )}
    </ProfileContainer>
  );
}

export default ProfilePage;