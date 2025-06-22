import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { userApi, templateApi } from "../services/api";
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
  Timeline
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
  DialogActions
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
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    templatesUploaded: 0,
    totalFavorites: 0,
    totalDownloads: 0,
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

  // Mock data for demonstration
  const socialLinks = [
    {
      platform: 'GitHub',
      url: 'github.com/username',
      fullUrl: 'https://github.com/username',
      icon: GitHub,
      color: '#333',
      verified: true
    },
    {
      platform: 'LinkedIn',
      url: 'linkedin.com/in/username',
      fullUrl: 'https://linkedin.com/in/username',
      icon: LinkedIn,
      color: '#0077b5',
      verified: true
    },
    {
      platform: 'Portfolio',
      url: 'portfolio.com',
      fullUrl: 'https://portfolio.com',
      icon: Language,
      color: '#667eea',
      verified: false
    }
  ];

  const achievements = [
    { name: 'Top Creator', icon: EmojiEvents, color: '#ffd700' },
    { name: 'Trending Designer', icon: TrendingUp, color: '#ff6b6b' },
    { name: 'Community Favorite', icon: Favorite, color: '#e74c3c' }
  ];

  const activityTimeline = [
    {
      type: 'upload',
      title: 'Uploaded new template "Modern Dashboard"',
      date: '2 days ago',
      icon: Upload,
      color: '#28a745'
    },
    {
      type: 'achievement',
      title: 'Earned "Top Creator" badge',
      date: '1 week ago',
      icon: EmojiEvents,
      color: '#ffd700'
    },
    {
      type: 'milestone',
      title: 'Reached 1000 total downloads',
      date: '2 weeks ago',
      icon: Download,
      color: '#667eea'
    },
    {
      type: 'joined',
      title: 'Joined Templi community',
      date: '3 months ago',
      icon: CalendarToday,
      color: '#6c757d'
    }
  ];

  const reviews = [
    {
      reviewer: 'Sarah Johnson',
      avatar: '/api/placeholder/32/32',
      rating: 5,
      date: '1 week ago',
      text: 'Amazing templates! The quality and attention to detail is outstanding. Highly recommended for any project.'
    },
    {
      reviewer: 'Mike Chen',
      avatar: '/api/placeholder/32/32',
      rating: 5,
      date: '2 weeks ago',
      text: 'Professional work and great communication. The templates saved me hours of development time.'
    }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = currentUser?._id || currentUser?.id;
        if (!userId) {
          console.error('No user ID found');
          return;
        }
        
        console.log('Fetching profile for user ID:', userId);
        const profileResponse = await userApi.getProfile(userId);
        setProfile(profileResponse.data);
        
        // Initialize edit form with current data
        setEditForm({
          name: profileResponse.data.name || currentUser.name || currentUser.username || '',
          role: profileResponse.data.role || '',
          bio: profileResponse.data.bio || '',
          website: profileResponse.data.website || ''
        });
        
        // Fetch user's templates
        try {
          console.log('About to fetch templates for userId:', userId);
          console.log('Current user object:', currentUser);
          const templatesResponse = await userApi.getUserTemplates(userId);
          console.log('Templates response:', templatesResponse);
          const templatesData = templatesResponse.data || templatesResponse;
          setUserTemplates(templatesData);
          
          // Calculate real stats
          const totalFavorites = templatesData.reduce((sum, template) => sum + (template.favorites || 0), 0);
          const totalDownloads = templatesData.reduce((sum, template) => sum + (template.downloads || 0), 0);
          
          setStats({
            templatesUploaded: templatesData.length,
            totalFavorites: totalFavorites,
            totalDownloads: totalDownloads,
            profileCompletion: calculateProfileCompletion(profileResponse.data)
          });
        } catch (templatesError) {
          console.error('Error fetching templates:', templatesError);
          console.error('Templates error details:', {
            status: templatesError.response?.status,
            statusText: templatesError.response?.statusText,
            data: templatesError.response?.data,
            url: templatesError.config?.url
          });
          // Fallback to mock data if templates API fails
          setStats({
            templatesUploaded: 0,
            totalFavorites: 0,
            totalDownloads: 0,
            profileCompletion: calculateProfileCompletion(profileResponse.data)
          });
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to mock data if profile API fails
        setStats({
          templatesUploaded: 12,
          totalFavorites: 156,
          totalDownloads: 2340,
          profileCompletion: 75
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

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
          
          <IconButton 
            onClick={() => setEditDialog(true)}
            sx={{ color: 'white', alignSelf: 'flex-start' }}
          >
            <Edit />
          </IconButton>
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
              <StatValue>4.9</StatValue>
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
          <Button startIcon={<LinkIcon />} variant="outlined" size="small">
            Add Link
          </Button>
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
          <IconButton size="small" onClick={() => setEditMode(!editMode)}>
            <Edit />
          </IconButton>
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
          {activityTimeline.map((item, index) => (
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
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={4.9} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="textSecondary">
              4.9 (23 reviews)
            </Typography>
          </Box>
        </SectionHeader>
        <ReviewsSection>
          {reviews.map((review, index) => (
            <ReviewItem key={index}>
              <ReviewHeader>
                <ReviewerAvatar src={review.avatar} alt={review.reviewer} />
                <ReviewerInfo>
                  <ReviewerName>{review.reviewer}</ReviewerName>
                  <ReviewDate>{review.date}</ReviewDate>
                </ReviewerInfo>
                <Rating value={review.rating} readOnly size="small" />
              </ReviewHeader>
              <ReviewText>{review.text}</ReviewText>
            </ReviewItem>
          ))}
        </ReviewsSection>
      </SectionCard>

      {/* Edit Profile Dialog */}
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

      {/* Templates Dialog */}
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
    </ProfileContainer>
  );
}

export default ProfilePage;