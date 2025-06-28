import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { templateApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  ListItemText,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Divider,
  LinearProgress,
  Fade,
  Zoom,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  Add,
  Close,
  HelpOutline,
  CloudUpload,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Save,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility,
  Link as LinkIcon,
  Star,
  AttachMoney,
  Devices,
  Palette,
  Language,
  AccessibilityNew,
  GitHub,
  Celebration,
  Info,
  Warning,
  Error,
  AutoAwesome,
  Image,
  Delete,
  Edit,
  TrendingUp,
  People,
  Schedule,
  CheckBox,
  CheckBoxOutlineBlank,
  RadioButtonUnchecked,
  ErrorOutline,
  Settings,
} from "@mui/icons-material";

const PageContainer = styled.div`
  padding: 24px;
  margin-left: 240px;
  margin-top: 64px;
  width: 100%;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 64px;
    padding: 16px;
  }
`;

const FormContainer = styled(Paper)`
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  }
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, var(--primary-main) 0%, #ff8a9d 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255, 88, 100, 0.2);
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    opacity: 0.6;
    animation: pulse 15s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const HeaderTitle = styled(Typography)`
  font-weight: 700;
  margin-bottom: 16px;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const HeaderSubtitle = styled(Typography)`
  font-weight: 400;
  font-size: 1.2rem;
  margin-bottom: 24px;
  opacity: 0.9;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled(Typography)`
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 4px;
`;

const StatLabel = styled(Typography)`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const FormSection = styled(Card)`
  margin-bottom: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: visible;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: var(--primary-main);
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const TagChip = styled(Chip)`
  background-color: var(--background-paper);
  border: 1px solid var(--divider);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const ActionButton = styled(Button)`
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  text-transform: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.Mui-disabled {
    background-color: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.26);
  }
`;

const PrimaryButton = styled(ActionButton)`
  background-color: var(--primary-main);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
  
  &:hover {
    background-color: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: white;
  color: var(--text-primary);
  border: 1px solid var(--divider);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

const SubmitButton = styled(PrimaryButton)`
  margin-top: 24px;
  font-size: 1.1rem;
  padding: 16px 32px;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid var(--divider);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;

const UploadZone = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver'].includes(prop),
})`
  border: 2px dashed ${props => props.isDragOver ? 'var(--primary-main)' : 'var(--divider)'};
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.isDragOver ? 'rgba(255, 88, 100, 0.05)' : 'rgba(0, 0, 0, 0.01)'};
  
  &:hover {
    border-color: var(--primary-main);
    background-color: rgba(255, 88, 100, 0.02);
  }
`;

const UploadIcon = styled(CloudUpload)`
  font-size: 48px;
  color: var(--primary-main);
  margin-bottom: 16px;
  opacity: 0.8;
`;

const StepperContainer = styled.div`
  margin-bottom: 32px;
`;

const StepContent = styled.div`
  padding: 24px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`;

const QualityScoreContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
`;

const QualityScoreLabel = styled(Typography)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
`;

const QualityScoreValue = styled(Typography)`
  font-weight: 700;
  color: ${props => {
    if (props.score >= 80) return 'var(--status-success)';
    if (props.score >= 50) return 'orange';
    return 'var(--status-error)';
  }};
`;

const BenefitsCard = styled(Card)`
  background-color: #f8f9fa;
  margin-top: 32px;
  border-radius: 12px;
  overflow: hidden;
`;

const BenefitsHeader = styled(CardContent)`
  background-color: var(--primary-light);
  padding: 16px;
`;

const BenefitsList = styled.ul`
  padding: 16px 32px;
  margin: 0;
`;

const BenefitItem = styled.li`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BenefitIcon = styled(CheckCircle)`
  color: var(--primary-main);
  font-size: 20px;
`;

// New styled components for improved UX
const ProgressHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-main) 0%, #ff8a9d 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  color: white;
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const QualityScoreCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.score >= 80) return 'var(--status-success)';
    if (props.score >= 50) return 'orange';
    return 'var(--status-error)';
  }};
  background: ${props => {
    if (props.score >= 80) return 'rgba(76, 175, 80, 0.05)';
    if (props.score >= 50) return 'rgba(255, 152, 0, 0.05)';
    return 'rgba(244, 67, 54, 0.05)';
  }};
`;

const QualityScoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider);
`;

const QualityScoreProgress = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
  margin: 8px 0;
  
  .MuiLinearProgress-bar {
    background-color: ${props => {
      if (props.score >= 80) return 'var(--status-success)';
      if (props.score >= 50) return 'orange';
      return 'var(--status-error)';
    }};
  }
`;

const RequirementsList = styled.div`
  padding: 16px 20px;
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: ${props => props.completed ? 'var(--status-success)' : 'var(--text-secondary)'};
`;

const ImageUploadZone = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver'].includes(prop),
})`
  border: 2px dashed ${props => props.isDragOver ? 'var(--primary-main)' : 'var(--divider)'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragOver ? 'rgba(255, 88, 100, 0.05)' : 'rgba(0, 0, 0, 0.01)'};
  margin-bottom: 16px;
  
  &:hover {
    border-color: var(--primary-main);
    background-color: rgba(255, 88, 100, 0.02);
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--divider);
  transition: all 0.3s ease;
  aspect-ratio: 1;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ImageActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
`;

const ImageActionButton = styled(IconButton)`
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const PricingToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
`;

const PricingInfo = styled.div`
  margin-top: 8px;
  padding: 12px;
  border-radius: 6px;
  background-color: rgba(255, 88, 100, 0.05);
  border: 1px solid rgba(255, 88, 100, 0.2);
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ValidationError = styled.div`
  color: var(--status-error);
  font-size: 0.8rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CharacterCounter = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOver'].includes(prop),
})`
  font-size: 0.8rem;
  color: ${props => props.isOver ? 'var(--status-error)' : 'var(--text-secondary)'};
  text-align: right;
  margin-top: 4px;
`;

const SaveIndicator = styled(Badge)`
  .MuiBadge-badge {
    background-color: var(--status-success);
    color: white;
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 12px;
  }
`;

const PreviewDialog = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 800px;
    width: 90vw;
  }
`;

const PublishChecklist = styled.div`
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: ${props => props.completed ? 'var(--status-success)' : 'var(--text-secondary)'};
`;

const ConfidenceBooster = styled.div`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 24px;
`;

const GenerateButton = styled(Button)`
  margin-left: 8px;
  background-color: var(--primary-light);
  color: var(--primary-main);
  
  &:hover {
    background-color: var(--primary-main);
    color: white;
  }
`;

const FullPreviewWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 70vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PreviewMedia = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img, video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  z-index: 1000;
  width: 50px;
  height: 50px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9) !important;
  }
  
  &.left {
    left: 20px;
  }
  
  &.right {
    right: 20px;
  }
`;

const MediaCounter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
`;

// Full Preview Container Component
const FullPreviewContainer = ({ uploadedFiles, open, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  console.log('FullPreviewContainer rendered:', { uploadedFiles: uploadedFiles?.length, open, filesLength: uploadedFiles?.length });
  
  useEffect(() => {
    console.log('FullPreviewContainer open state changed:', open);
  }, [open]);
  
  const handlePrevious = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setCurrentIndex(prev => prev > 0 ? prev - 1 : uploadedFiles.length - 1);
  };
  
  const handleNext = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setCurrentIndex(prev => prev < uploadedFiles.length - 1 ? prev + 1 : 0);
  };
  
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [handleKeyPress, open]);
  
  // Reset to first image when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open]);
  
  // Don't render anything if dialog is not open
  if (!open) {
    return null;
  }
  
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#000',
            color: 'white'
          }
        }}
      >
        <DialogContent>
          <FullPreviewWrapper>
            <Typography color="white" variant="h6">
              No files to preview
            </Typography>
          </FullPreviewWrapper>
        </DialogContent>
      </Dialog>
    );
  }
  
  const currentFile = uploadedFiles[currentIndex];
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: '#000',
          margin: 0,
          maxHeight: '100vh',
          maxWidth: '100vw'
        }
      }}
    >
      <DialogContent style={{ padding: 0, position: 'relative' }}>
        <FullPreviewWrapper>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              zIndex: 1001
            }}
          >
            <Close />
          </IconButton>
          
          <PreviewMedia>
            {currentFile.file.type.startsWith('video/') ? (
              <video
                key={currentIndex} // Force re-render for autoplay
                src={currentFile.preview}
                autoPlay
                muted
                controls
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={currentFile.preview}
                alt={`Preview ${currentIndex + 1}`}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
          </PreviewMedia>
          
          {uploadedFiles.length > 1 && (
            <>
              <NavigationButton className="left" onClick={handlePrevious}>
                <NavigateBefore />
              </NavigationButton>
              
              <NavigationButton className="right" onClick={handleNext}>
                <NavigateNext />
              </NavigationButton>
              
              <MediaCounter>
                {currentIndex + 1} / {uploadedFiles.length}
              </MediaCounter>
            </>
          )}
          
          {/* File Info */}
          <Box
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              zIndex: 1000
            }}
          >
            <Typography variant="body2">
              {currentFile.name}
            </Typography>
            <Typography variant="caption">
              {currentFile.file.type.startsWith('video/') ? 'Video' : 'Image'} • {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        </FullPreviewWrapper>
      </DialogContent>
    </Dialog>
  );
};

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const BenefitCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--divider);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 88, 100, 0.05);
    border-color: var(--primary-light);
  }
`;

const BenefitIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: var(--primary-main);
`;

const InspirationSection = styled.div`
  margin-top: 24px;
`;

const InspirationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const TemplateCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const StickyNavigation = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid var(--divider);
  padding: 16px 0;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 64px;
    left: 0;
    right: 0;
    padding: 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
`;

const MobileOptimizedField = styled(TextField)`
  .MuiInputBase-root {
    @media (max-width: 768px) {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
`;

const CompressedImageIndicator = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
`;

const BenefitsContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
  border: 1px solid var(--divider);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const ExampleCard = styled(Card)`
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ExampleImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const ExampleContent = styled(CardContent)`
  padding: 16px;
`;

const ExampleTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
`;

const ExampleStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ExampleStat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TooltipContent = styled.div`
  padding: 8px;
  max-width: 300px;
`;

const TooltipTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
`;

const TooltipText = styled(Typography)`
  font-size: 0.9rem;
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Example templates for inspiration
const exampleTemplates = [
  {
    id: 1,
    title: "Modern Dashboard UI Kit",
    category: "Dashboard UI",
    image: "https://cdn.dribbble.com/users/1615584/screenshots/15467705/media/9f9d5d54c1c3329c7f9f0f3f9f9c8e8a.jpg",
    likes: 245,
    downloads: 1200,
  },
  {
    id: 2,
    title: "E-commerce Mobile App Template",
    category: "Mobile App UI",
    image: "https://cdn.dribbble.com/users/1126935/screenshots/15463811/media/8db76c7ce48c4c2b3f002a876b8c0b0f.png",
    likes: 189,
    downloads: 850,
  },
  {
    id: 3,
    title: "Creative Portfolio Website",
    category: "Web UI",
    image: "https://cdn.dribbble.com/users/1615584/screenshots/15467705/media/9f9d5d54c1c3329c7f9f0f3f9f9c8e8a.jpg",
    likes: 312,
    downloads: 1500,
  },
];

const UploadPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Info', 'Preview', 'Details', 'Publish'];
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [frameworkTools, setFrameworkTools] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);


  
  // Design specifications
  const [colorScheme, setColorScheme] = useState("Light");
  const [responsive, setResponsive] = useState(true);
  const [accessibilityLevel, setAccessibilityLevel] = useState("Not Tested");
  const [languageSupport, setLanguageSupport] = useState("English");
  
  // Style attributes
  const [visualStyle, setVisualStyle] = useState([]);
  const [layoutStructure, setLayoutStructure] = useState("");
  const [complexityLevel, setComplexityLevel] = useState("");
  const [responsiveness, setResponsiveness] = useState("");
  const [performance, setPerformance] = useState("");
  
  // Pricing
  const [pricingTier, setPricingTier] = useState("Free");
  const [price, setPrice] = useState(0);
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);
  
  // Autosave
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Quality score
  const [qualityScore, setQualityScore] = useState(0);
  
  // New state for improved UX
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  
  // Category options
  const categoryOptions = [
    'Web UI',
    'Mobile App UI',
    'Dashboard UI',
    'Marketing Materials',
    'Presentation UI',
    'CV/Resume UI',
    'Brand Identity',
    'Authentication UI',
    'Component Libraries',
    'Design Systems',
    'Custom Category'
  ];

  // State for custom inputs
  const [customCategory, setCustomCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [customFramework, setCustomFramework] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);
  const [showCustomFramework, setShowCustomFramework] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  
  // Framework/Tools options
  const frameworkToolsOptions = [
    // Design Tools
    'Figma',
    'Sketch',
    'Adobe XD',
    'Photoshop',
    'Illustrator',
    'InVision',
    'Framer',
    'Canva',
    'Affinity Designer',
    // Frontend Frameworks
    'React',
    'Vue',
    'Angular',
    'Svelte',
    'Next.js',
    'Nuxt.js',
    'Remix',
    'HTML/CSS/JS (Vanilla)',
    // CSS Frameworks
    'Tailwind CSS',
    'Bootstrap',
    'Material UI',
    'Chakra UI',
    'Bulma',
    'Foundation',
    'Semantic UI',
    'Ant Design',
    // No-Code/Low-Code
    'Webflow',
    'Wix',
    'Squarespace',
    'WordPress',
    'Shopify',
    'Bubble',
    'Elementor',
    'Notion',
    // Presentation Tools
    'PowerPoint',
    'Keynote',
    'Google Slides',
    'Prezi',
    // Mobile Frameworks
    'React Native',
    'Flutter',
    'Swift UI',
    'Kotlin',
    'Xamarin',
    'Custom Framework'
  ];
  
  // Sub-category options based on main category
  const getSubCategoryOptions = () => {
    let options = [];
    switch (category) {
      case 'Web UI':
        options = ['Landing Pages', 'Corporate Websites', 'Portfolios', 'Blogs/Magazine', 'E-commerce Stores', 'SaaS Platforms', 'Marketplaces', 'Community/Forum'];
        break;
      case 'Mobile App UI':
        options = ['Social Apps', 'E-commerce Apps', 'Food/Delivery', 'Finance/Banking', 'Health/Fitness', 'Travel/Transportation', 'Entertainment/Media', 'Productivity/Tools', 'Education/Learning'];
        break;
      case 'Dashboard UI':
        options = ['Analytics Dashboards', 'Admin Panels', 'CRM Interfaces', 'Project Management', 'Financial Dashboards', 'IoT/Smart Home Controls', 'Health Monitoring', 'Data Visualization'];
        break;
      case 'Marketing Materials':
        options = ['Social Media Posts', 'Banners/Ads', 'Email Templates', 'Infographics', 'Brochures/Flyers'];
        break;
      case 'Presentation UI':
        options = ['Business Presentations', 'Pitch Decks', 'Educational Slides', 'Portfolio Presentations', 'Conference Templates'];
        break;
      case 'CV/Resume UI':
        options = ['Professional/Corporate', 'Creative/Design', 'Academic/Research', 'Technical/Engineering', 'Entry-Level/Student'];
        break;
      case 'Brand Identity':
        options = ['Logo Templates', 'Brand Guidelines', 'Business Cards', 'Letterheads', 'Social Media Kits'];
        break;
      case 'Authentication UI':
        options = ['Login/Signup Pages', 'User Profiles', 'Password Recovery', 'Two-Factor Authentication', 'Permission Management'];
        break;
      case 'Component Libraries':
        options = ['Navigation Systems', 'Form Elements', 'Card Designs', 'Modal/Dialog Systems', 'Button Collections', 'Data Tables'];
        break;
      case 'Design Systems':
        options = ['Complete UI Kits', 'Icon Sets', 'Typography Systems', 'Color Palettes'];
        break;
      default:
        options = [];
    }
    
    // Add custom option if there are subcategories available
    if (options.length > 0) {
      options.push('Custom Sub-Category');
    }
    
    return options;
  };

  // Function to fetch similar titles
  const fetchSimilarTitles = async (searchTitle) => {
    if (!searchTitle || searchTitle.length < 3) {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/templates/discover?search=${encodeURIComponent(searchTitle)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Response is not JSON, skipping title suggestions');
        setTitleSuggestions([]);
        setShowTitleSuggestions(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.templates && data.templates.length > 0) {
        const suggestions = data.templates
          .filter(template => template.title.toLowerCase().includes(searchTitle.toLowerCase()))
          .map(template => template.title)
          .slice(0, 3);
        
        setTitleSuggestions(suggestions);
        setShowTitleSuggestions(suggestions.length > 0);
      } else {
        setTitleSuggestions([]);
        setShowTitleSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching similar titles:', error);
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
    }
  };

  // Debounced title search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSimilarTitles(title);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title]);
  
  // Reset sub-category when category changes
  useEffect(() => {
    setSubCategory("");
    updateFormDirty();
  }, [category]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Dispatch event to open auth modal
      document.dispatchEvent(new CustomEvent('openAuthModal'));
    }
  }, [isAuthenticated]);
  
  // Load draft from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const savedDraft = localStorage.getItem(`template_draft_${currentUser?._id}`);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || "");
          setDescription(draft.description || "");
          setCategory(draft.category || "");
          setSubCategory(draft.subCategory || "");
          setFrameworkTools(draft.frameworkTools || []);
          setTags(draft.tags || []);
          setGithubLink(draft.githubLink || "");
          setIsPrivateRepo(draft.isPrivateRepo || false);
    

          setColorScheme(draft.colorScheme || "Light");
        setResponsive(draft.responsive !== undefined ? draft.responsive : true);
        setAccessibilityLevel(draft.accessibilityLevel || "Not Tested");
        setLanguageSupport(draft.languageSupport || "English");
        setVisualStyle(draft.visualStyle || []);
        setLayoutStructure(draft.layoutStructure || "");
        setComplexityLevel(draft.complexityLevel || "");
        setResponsiveness(draft.responsiveness || "");
        setPerformance(draft.performance || "");
          setPricingTier(draft.pricingTier || "Free");
          setPrice(draft.price || 0);
          
          setLastSaved(new Date(draft.savedAt));
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [isAuthenticated, currentUser]);
  
  // Autosave draft
  useEffect(() => {
    if (isAuthenticated && formIsDirty && !isSubmitting) {
      const autosaveTimer = setTimeout(() => {
        saveDraft();
      }, 5000); // Autosave after 5 seconds of inactivity
      
      return () => clearTimeout(autosaveTimer);
    }
  }, [title, description, category, subCategory, frameworkTools, tags, githubLink, isPrivateRepo, 
      colorScheme, responsive, accessibilityLevel, languageSupport, visualStyle, layoutStructure,
      complexityLevel, responsiveness, performance, pricingTier, price, formIsDirty, isAuthenticated, isSubmitting]);
  
  // Calculate quality score with detailed requirements
  const calculateQualityScore = useCallback(() => {
    let score = 0;
    
    // Basic info completeness (40%)
    if (title) score += 5;
    if (title.length >= 20) score += 5;
    if (description) score += 5;
    if (description.length >= 200) score += 10;
    if (category) score += 5;
    if (subCategory) score += 5;
    if (frameworkTools.length > 0) score += 5;
    
    // Visual assets (30%)
    if (uploadedFiles.length > 0) score += 10;
    if (uploadedFiles.length >= 3) score += 10;

    
    // Additional details (20%)
    if (tags.length > 0) score += 5;
    if (tags.length >= 3) score += 5;
    if (githubLink) score += 5;
    if (responsive) score += 5;
    
    // Design specs (10%)
    if (accessibilityLevel !== "Not Tested") score += 2;
    if (languageSupport !== "English") score += 2;
    if (visualStyle.length > 0) score += 2;
    if (layoutStructure) score += 2;
    if (complexityLevel) score += 1;
    if (performance) score += 1;
    
    return score;
  }, [title, description, category, frameworkTools, tags, githubLink, 
      uploadedFiles, responsive, accessibilityLevel, languageSupport, visualStyle, 
      layoutStructure, complexityLevel, responsiveness, performance]);
  
  // Get missing requirements for quality score
  const getMissingRequirements = useCallback(() => {
    const requirements = [];
    
    if (!title) requirements.push({ text: "Add a title", completed: false });
    else if (title.length < 20) requirements.push({ text: "Make title at least 20 characters", completed: false });
    else requirements.push({ text: "Title added", completed: true });
    
    if (!description) requirements.push({ text: "Add a description", completed: false });
    else if (description.length < 200) requirements.push({ text: "Write 200+ character description", completed: false });
    else requirements.push({ text: "Description complete", completed: true });
    
    if (!category) requirements.push({ text: "Select a category", completed: false });
    else requirements.push({ text: "Category selected", completed: true });
    
    if (uploadedFiles.length === 0) requirements.push({ text: "Add 3+ preview files", completed: false });
    else if (uploadedFiles.length < 3) requirements.push({ text: `Add ${3 - uploadedFiles.length} more files`, completed: false });
     else requirements.push({ text: "Preview images added", completed: true });
     
     if (tags.length === 0) requirements.push({ text: "Add relevant tags", completed: false });
     else if (tags.length < 3) requirements.push({ text: `Add ${3 - tags.length} more tags`, completed: false });
     else requirements.push({ text: "Tags added", completed: true });
    
    if (frameworkTools.length === 0) requirements.push({ text: "Select framework/tools", completed: false });
    else requirements.push({ text: "Framework/tools selected", completed: true });
    
    return requirements;
  }, [title, description, category, uploadedFiles.length, tags.length, frameworkTools.length]);
  
  useEffect(() => {
    setQualityScore(calculateQualityScore());
  }, [calculateQualityScore]);
  
  const updateFormDirty = () => {
    setFormIsDirty(true);
  };
  
  // Save draft to localStorage
  const saveDraft = () => {
    if (!isAuthenticated || !currentUser) return;
    
    setIsSaving(true);
    
    const draft = {
      title,
      description,
      category,
      subCategory,
      frameworkTools,
      tags,
      githubLink,
      isPrivateRepo,


      colorScheme,
      responsive,
      accessibilityLevel,
      languageSupport,
      visualStyle,
      layoutStructure,
      complexityLevel,
      responsiveness,
      performance,
      pricingTier,
      price,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`template_draft_${currentUser._id}`, JSON.stringify(draft));
    setLastSaved(new Date());
    setFormIsDirty(false);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 5) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
      updateFormDirty();
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    updateFormDirty();
  };
  

  
  // Handle file upload with compression
  const handleFileUpload = async (files) => {
    for (const file of files) {
      try {
        // Simulate image compression for mobile
        let processedFile = file;
        if (compressionEnabled && file.size > 1024 * 1024) { // > 1MB
          // In a real implementation, you would compress the image here
          console.log('Compressing file:', file.name);
        }
        
        // Create preview URL for the file
        const previewUrl = URL.createObjectURL(processedFile);
        
        // Store file info for later reference
        setUploadedFiles(prev => [...prev, {
          file: processedFile,
          name: processedFile.name,
          preview: previewUrl,
          compressed: compressionEnabled && file.size > 1024 * 1024
        }]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    updateFormDirty();
  };
  
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title) newErrors.title = "Title is required";
    else if (title.length > 60) newErrors.title = "Title must be 60 characters or less";
    
    if (!description) newErrors.description = "Description is required";
    else if (description.length < 100) newErrors.description = "Description must be at least 100 characters";
    else if (description.length > 500) newErrors.description = "Description must be 500 characters or less";
    
    if (!category) newErrors.category = "Category is required";
    if (!subCategory && getSubCategoryOptions().length > 0) newErrors.subCategory = "Sub-category is required";
    
    if (frameworkTools.length === 0) newErrors.frameworkTools = "At least one framework/tool is required";
    
    if (uploadedFiles.length === 0) {
      newErrors.visualPreview = "At least one file is required";
    }
    
    if (tags.length > 5) newErrors.tags = "Maximum of 5 tags allowed";
    
    if (pricingTier === "Premium" && (!price || price <= 0)) {
      newErrors.price = "Price must be greater than 0 for Premium templates";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Upload files to Supabase Storage
  const uploadFilesToSupabase = async (files) => {
    const imageUrls = [];
    let videoUrl = null;
    
    for (const fileObj of files) {
      const file = fileObj.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `templates/${fileName}`;
      
      try {
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);
        
        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);
        
        // Categorize by file type
        if (file.type.startsWith('video/')) {
          videoUrl = publicUrl;
        } else if (file.type.startsWith('image/')) {
          imageUrls.push(publicUrl);
        }
        
      } catch (error) {
        console.error('Failed to upload file:', file.name, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }
    
    return { imageUrls, videoUrl };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    if (!validateForm()) {
      // Find the step with errors and navigate to it
      if (errors.title || errors.category || errors.subCategory || errors.frameworkTools || errors.description) {
        setActiveStep(0);
      } else if (errors.visualPreview) {
        setActiveStep(1);
      } else if (errors.tags) {
        setActiveStep(2);
      } else if (errors.price) {
        setActiveStep(3);
      }
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // Upload files to Supabase Storage first
      const { imageUrls, videoUrl } = await uploadFilesToSupabase(uploadedFiles);
      
      const templateData = {
        title,
        description,
        imageUrls, // Now includes actual URLs from Supabase
        videoUrl,  // Now includes actual URL from Supabase
        tags,
        category,
        subCategory,
        frameworkTools,
        githubLink,
        isPrivateRepo,
        designSpecs: {
          colorScheme,
          responsive,
          accessibilityLevel,
          languageSupport,
          visualStyle,
          layoutStructure,
          complexityLevel,
          responsiveness,
          performance,
        },
        pricingTier,
        price: pricingTier === "Premium" ? price : 0,
        creator: currentUser._id,
      };
      
      await templateApi.create(templateData);
      
      setSubmitSuccess(true);
      
      // Clear draft after successful submission
      if (currentUser) {
        localStorage.removeItem(`template_draft_${currentUser._id}`);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting template:", error);
      setSubmitError(error.message || "Failed to submit template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle next step with improved validation
  const handleNext = () => {
    console.log('handleNext called, activeStep:', activeStep);
    console.log('Current form state:', { title, category, description, frameworkTools, uploadedFiles, tags, pricingTier, price, githubLink, qualityScore });
    
    // Clear previous errors
    setErrors({});
    let canProceed = true;
    const newErrors = {};
    
    if (activeStep === 0) {
      // Validate basic info step
      if (!title) {
        newErrors.title = "Title is required";
        canProceed = false;
      } else if (title.length < 10) {
        newErrors.title = "Title must be at least 10 characters";
        canProceed = false;
      } else if (title.length > 60) {
        newErrors.title = "Title must be 60 characters or less";
        canProceed = false;
      }
      
      if (!category) {
        newErrors.category = "Category is required";
        canProceed = false;
      }
      
      if (!description) {
        newErrors.description = "Description is required";
        canProceed = false;
      } else if (description.length < 100) {
        newErrors.description = "Description must be at least 100 characters";
        canProceed = false;
      } else if (description.length > 500) {
        newErrors.description = "Description must be 500 characters or less";
        canProceed = false;
      }
      
      if (frameworkTools.length === 0) {
        newErrors.frameworkTools = "At least one framework/tool is required";
        canProceed = false;
      }
    } else if (activeStep === 1) {
      // Validate preview step
      if (uploadedFiles.length === 0) {
        newErrors.images = "At least one file is required before publishing";
        canProceed = false;
      }
    } else if (activeStep === 2) {
      // Validate details step
      if (tags.length === 0) {
        newErrors.tags = "At least one tag is required";
        canProceed = false;
      } else if (tags.length > 5) {
        newErrors.tags = "Maximum of 5 tags allowed";
        canProceed = false;
      }
      
      if (!pricingTier) {
        newErrors.pricingTier = "Please select a pricing model";
        canProceed = false;
      }
      
      if (pricingTier === 'Premium' && (!price || price <= 0)) {
        newErrors.price = "Price must be greater than 0 for premium templates";
        canProceed = false;
      }
      
      if (githubLink && !githubLink.match(/^https?:\/\/(www\.)?github\.com\/.+\/.+/)) {
        newErrors.githubLink = "Please enter a valid GitHub repository URL";
        canProceed = false;
      }
    } else if (activeStep === 3) {
      // Validate final publish step
      if (qualityScore < 50) {
        newErrors.general = "Please complete more requirements to reach minimum quality score (50%)";
        canProceed = false;
      }
    }
    
    if (!canProceed) {
      console.log('Validation failed, errors:', newErrors);
      console.log('Detailed validation check:');
      console.log('- uploadedFiles.length:', uploadedFiles.length);
      console.log('- tags.length:', tags.length);
      console.log('- tags:', tags);
      setErrors(newErrors);
      return;
    }
    
    console.log('Validation passed, moving to next step');
    setActiveStep((prevActiveStep) => {
      console.log('Previous step:', prevActiveStep, 'Next step:', prevActiveStep + 1);
      return prevActiveStep + 1;
    });
    // Auto-save when moving to next step
    saveDraft();
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Generate description with AI (improved UX)
  const generateDescription = async () => {
    if (!category) {
      setErrors(prev => ({ ...prev, category: "Please select a category first" }));
      return;
    }
    
    setIsGeneratingDescription(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an AI service
      const placeholderDescriptions = [
        `A modern and clean ${category} template designed for ${subCategory || 'various'} applications. This template features a responsive design, intuitive user interface, and customizable components that can be easily adapted to your specific needs. Built with ${frameworkTools.join(', ') || 'modern technologies'}, it ensures optimal performance and maintainability.`,
        `Elevate your ${category} project with this professional template. Carefully crafted with attention to detail, this template offers a seamless user experience across all devices and screen sizes. Perfect for ${subCategory || 'various applications'}, it includes comprehensive documentation and easy customization options.`,
        `This ${category} template is perfect for ${subCategory || 'various'} projects. It includes all the essential components and features needed to create a stunning user interface that will impress your clients and users. Developed using ${frameworkTools.join(', ') || 'industry-standard tools'}, it follows best practices for accessibility and performance.`
      ];
      
      const randomDescription = placeholderDescriptions[Math.floor(Math.random() * placeholderDescriptions.length)];
      setDescription(randomDescription);
      updateFormDirty();
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, description: undefined }));
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  
  // Test GitHub link
  const testGitHubLink = () => {
    if (githubLink) {
      window.open(githubLink, '_blank');
    }
  };
  
  // Render step content with improved UX
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Fade in={activeStep === 0}>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="h6">
                    <SectionIcon><Palette /></SectionIcon>
                    Basic Information
                  </SectionTitle>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <MobileOptimizedField
                      label="Template Title"
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        updateFormDirty();
                        // Clear error when user starts typing
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: undefined }));
                        }
                      }}
                      error={!!errors.title}
                      helperText={errors.title}
                      disabled={isSubmitting}
                      required
                      InputProps={{
                        endAdornment: (
                          <Tooltip title={
                            <TooltipContent>
                              <TooltipTitle>Creating an Effective Title</TooltipTitle>
                              <TooltipText>
                                A good title is clear, specific, and includes keywords users might search for. 
                                Aim for 30-50 characters that accurately describe your template.
                              </TooltipText>
                            </TooltipContent>
                          }>
                            <HelpOutline color="action" style={{ cursor: 'pointer' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                    
                    {/* Title Suggestions */}
                    {showTitleSuggestions && titleSuggestions.length > 0 && (
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: 0, 
                          right: 0, 
                          zIndex: 1000,
                          mt: 1,
                          border: '1px solid #ff9800',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ p: 2, bgcolor: '#fff3e0' }}>
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                            ⚠️ Similar titles found - Consider making yours unique:
                          </Typography>
                          {titleSuggestions.map((suggestion, index) => (
                            <Typography key={index} variant="body2" sx={{ color: '#f57c00', ml: 1 }}>
                              • {suggestion}
                            </Typography>
                          ))}
                        </Box>
                      </Paper>
                    )}
                  </Box>
                  
                  <CharacterCounter isOver={title.length > 60}>
                    {title.length}/60 characters
                  </CharacterCounter>
                  {errors.title && (
                    <ValidationError>
                      <ErrorOutline fontSize="small" />
                      {errors.title}
                    </ValidationError>
                  )}
        
        {/* Full Preview Dialog */}
        <FullPreviewContainer 
          uploadedFiles={uploadedFiles} 
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
        />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.category} required>
                    <InputLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🧱 Category
                        <Tooltip title="Choose the main category that best describes your template type">
                          <HelpOutline fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    </InputLabel>
                    <Select
                      value={showCustomCategory ? 'Custom Category' : category}
                      onChange={(e) => {
                        if (e.target.value === 'Custom Category') {
                          setShowCustomCategory(true);
                          setCategory('');
                        } else {
                          setShowCustomCategory(false);
                          setCategory(e.target.value);
                        }
                        updateFormDirty();
                        // Clear error when user selects
                        if (errors.category) {
                          setErrors(prev => ({ ...prev, category: undefined }));
                        }
                      }}
                      label="🧱 Category"
                      disabled={isSubmitting}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option === 'Custom Category' ? '✏️ ' + option : option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                  </FormControl>
                  
                  {/* Custom Category Input */}
                  {showCustomCategory && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Enter Custom Category"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setCategory(e.target.value);
                          updateFormDirty();
                        }}
                        placeholder="e.g., Game UI, AR/VR Interface, etc."
                        disabled={isSubmitting}
                        InputProps={{
                          endAdornment: (
                            <IconButton 
                              onClick={() => {
                                setShowCustomCategory(false);
                                setCustomCategory('');
                                setCategory('');
                              }}
                              size="small"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )
                        }}
                      />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.subCategory} disabled={!category || getSubCategoryOptions().length === 0} required={getSubCategoryOptions().length > 0}>
                    <InputLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📂 Sub-Category
                        <Tooltip title="Select a specific subcategory to help users find your template more easily">
                          <HelpOutline fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    </InputLabel>
                    <Select
                      value={showCustomSubCategory ? 'Custom Sub-Category' : subCategory}
                      onChange={(e) => {
                        if (e.target.value === 'Custom Sub-Category') {
                          setShowCustomSubCategory(true);
                          setSubCategory('');
                        } else {
                          setShowCustomSubCategory(false);
                          setSubCategory(e.target.value);
                        }
                        updateFormDirty();
                      }}
                      label="📂 Sub-Category"
                      disabled={isSubmitting || !category || getSubCategoryOptions().length === 0}
                    >
                      {getSubCategoryOptions().map((option) => (
                        <MenuItem key={option} value={option}>
                          {option === 'Custom Sub-Category' ? '✏️ ' + option : option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.subCategory && <FormHelperText>{errors.subCategory}</FormHelperText>}
                  </FormControl>
                  
                  {/* Custom Sub-Category Input */}
                  {showCustomSubCategory && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Enter Custom Sub-Category"
                        value={customSubCategory}
                        onChange={(e) => {
                          setCustomSubCategory(e.target.value);
                          setSubCategory(e.target.value);
                          updateFormDirty();
                        }}
                        placeholder="e.g., Gaming, Educational, Medical, etc."
                        disabled={isSubmitting}
                        InputProps={{
                          endAdornment: (
                            <IconButton 
                              onClick={() => {
                                setShowCustomSubCategory(false);
                                setCustomSubCategory('');
                                setSubCategory('');
                              }}
                              size="small"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )
                        }}
                      />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.frameworkTools} required>
                    <InputLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⚙️ Framework/Tools
                        <Tooltip title="Select the frameworks, tools, or technologies used to create this template">
                          <HelpOutline fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    </InputLabel>
                    <Select
                      multiple
                      value={frameworkTools.filter(tool => tool !== 'Custom Framework')}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes('Custom Framework')) {
                          setShowCustomFramework(true);
                          setFrameworkTools(value.filter(tool => tool !== 'Custom Framework'));
                        } else {
                          setFrameworkTools(value);
                        }
                        updateFormDirty();
                        // Clear error when user selects
                        if (errors.frameworkTools) {
                          setErrors(prev => ({ ...prev, frameworkTools: undefined }));
                        }
                      }}
                      input={<OutlinedInput label="⚙️ Framework/Tools" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                          {customFramework && (
                            <Chip 
                              key={customFramework} 
                              label={customFramework}
                              onDelete={() => {
                                setCustomFramework('');
                                setFrameworkTools(prev => prev.filter(tool => tool !== customFramework));
                              }}
                            />
                          )}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                      disabled={isSubmitting}
                    >
                      {frameworkToolsOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox checked={frameworkTools.indexOf(option) > -1} />
                          <ListItemText primary={option === 'Custom Framework' ? '✏️ ' + option : option} />
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.frameworkTools && <FormHelperText>{errors.frameworkTools}</FormHelperText>}
                  </FormControl>
                  
                  {/* Custom Framework Input */}
                  {showCustomFramework && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Enter Custom Framework/Tool"
                        value={customFramework}
                        onChange={(e) => {
                          setCustomFramework(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && customFramework.trim()) {
                            if (!frameworkTools.includes(customFramework.trim())) {
                              setFrameworkTools(prev => [...prev, customFramework.trim()]);
                            }
                            setCustomFramework('');
                            setShowCustomFramework(false);
                          }
                        }}
                        placeholder="e.g., Unity, Unreal Engine, Three.js, etc."
                        disabled={isSubmitting}
                        InputProps={{
                          endAdornment: (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                onClick={() => {
                                  if (customFramework.trim() && !frameworkTools.includes(customFramework.trim())) {
                                    setFrameworkTools(prev => [...prev, customFramework.trim()]);
                                  }
                                  setCustomFramework('');
                                  setShowCustomFramework(false);
                                }}
                                size="small"
                                color="primary"
                                disabled={!customFramework.trim()}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={() => {
                                  setShowCustomFramework(false);
                                  setCustomFramework('');
                                }}
                                size="small"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Press Enter or click ✓ to add the custom framework
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        updateFormDirty();
                        // Clear error when user types
                        if (errors.description) {
                          setErrors(prev => ({ ...prev, description: undefined }));
                        }
                      }}
                      error={!!errors.description}
                      disabled={isSubmitting}
                      required
                      InputProps={{
                        endAdornment: (
                          <Tooltip title={
                            <TooltipContent>
                              <TooltipTitle>Writing an Effective Description</TooltipTitle>
                              <TooltipText>
                                A good description explains what the template is for, its key features, and why someone should use it.
                                Include details about functionality, customization options, and technical requirements.
                              </TooltipText>
                            </TooltipContent>
                          }>
                            <HelpOutline color="action" style={{ cursor: 'pointer', position: 'absolute', top: '12px', right: '12px' }} />
                          </Tooltip>
                        ),
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <CharacterCounter 
                        current={description.length} 
                        min={100} 
                        max={500} 
                      />
                      <Button
                        variant="outlined"
                        onClick={generateDescription}
                        disabled={!category || isGeneratingDescription}
                        startIcon={isGeneratingDescription ? <CircularProgress size={16} /> : null}
                        sx={{ minWidth: '160px' }}
                      >
                        {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                      </Button>
                    </Box>
                    {errors.description && (
                      <ValidationError message={errors.description} />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : ''}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Save />}
                      onClick={saveDraft}
                      disabled={isSubmitting || isSaving || !formIsDirty}
                    >
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </StepContent>
          </Fade>
        );
        
      case 1: // Preview
        return (
          <Fade in={activeStep === 1}>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="h6">
                    <SectionIcon><Visibility /></SectionIcon>
                    Preview & Images
                  </SectionTitle>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Recommended: 3-5 screenshots showing different views/states
                  </Typography>
                </Grid>
                
                {errors.images && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      {errors.images}
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <UploadZone 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    isDragOver={isDragOver}
                  >
                    <UploadIcon />
                    <Typography variant="h6" gutterBottom>
                      {isDragOver ? 'Drop files here' : 'Drag & Drop Images or Videos Here'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Or click to browse your files (Images: PNG, JPG, GIF | Videos: MP4, MOV up to 5MB each)
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{ mt: 2 }}
                      disabled={isSubmitting}
                    >
                      Upload Files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileInputChange}
                    />
                  </UploadZone>
                </Grid>
                
                {uploadedFiles.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Uploaded Files ({uploadedFiles.length}):
                    </Typography>
                    <ImagePreviewContainer>
                      {uploadedFiles.map((file, index) => (
                        <Zoom in={true} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                          <ImagePreview>
                            {file.file.type.startsWith('video/') ? (
                              <video 
                                src={file.preview} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                muted
                                controls={false}
                              />
                            ) : (
                              <PreviewImage src={file.preview} alt={`Preview ${index + 1}`} style={{ borderRadius: '8px' }} />
                            )}
                            <RemoveImageButton
                              size="small"
                              onClick={() => {
                                setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                updateFormDirty();
                              }}
                              disabled={isSubmitting}
                            >
                              <Close fontSize="small" />
                            </RemoveImageButton>
                            <Box sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              bgcolor: 'rgba(0,0,0,0.7)', 
                              color: 'white', 
                              p: 0.5, 
                              fontSize: '0.75rem' 
                            }}>
                              {file.name}
                              {file.compressed && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'lightgreen' }}>
                                  ✓ Compressed
                                </Typography>
                              )}
                            </Box>
                          </ImagePreview>
                        </Zoom>
                      ))}
                    </ImagePreviewContainer>
                  </Grid>
                )}
                

                

                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Template Preview:</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        console.log('Full Preview clicked, uploadedFiles:', uploadedFiles);
                        console.log('Setting showPreviewDialog to true');
                        setShowPreviewDialog(true);
                        console.log('showPreviewDialog state should now be true');
                      }}
                      startIcon={<Visibility />}
                      disabled={!uploadedFiles || uploadedFiles.length === 0}
                    >
                      Full Preview
                    </Button>
                  </Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This is how your template will appear in search results and the explore page.
                  </Alert>
                  <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ 
                          height: '160px', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          bgcolor: uploadedFiles.length ? 'transparent' : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {uploadedFiles.length ? (
                            uploadedFiles[0].file.type.startsWith('video/') ? (
                              <video 
                                src={uploadedFiles[0].preview} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                muted
                                controls={false}
                              />
                            ) : (
                              <img 
                                src={uploadedFiles[0].preview} 
                                alt="Template Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            )
                          ) : (
                            <Typography variant="body2" color="textSecondary">No preview file</Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6" noWrap>
                          {title || "Your Template Title"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {category} {subCategory ? `• ${subCategory}` : ''}
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {description || "Your template description will appear here..."}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          {frameworkTools.slice(0, 3).map((tool, index) => (
                            <Chip key={index} label={tool} size="small" />
                          ))}
                          {frameworkTools.length > 3 && (
                            <Chip label={`+${frameworkTools.length - 3}`} size="small" />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </StepContent>
          </Fade>
        );
        
      case 2: // Details
        return (
          <Fade in={activeStep === 2}>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="h6">
                    <SectionIcon><Settings /></SectionIcon>
                    Template Details
                  </SectionTitle>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Add tags, pricing, and additional information
                  </Typography>
                </Grid>
                
                {/* Tags Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags & Keywords
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Add relevant tags to help users find your template (max 5 tags)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => {
                            setTags(tags.filter((_, i) => i !== index));
                            updateFormDirty();
                          }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <TextField
                      fullWidth
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
                          e.preventDefault();
                          const newTag = tagInput.trim().toLowerCase();
                          if (!tags.includes(newTag)) {
                            setTags([...tags, newTag]);
                            setTagInput('');
                            updateFormDirty();
                          }
                        }
                      }}
                      disabled={tags.length >= 5 || isSubmitting}
                      error={!!errors.tags}
                      helperText={errors.tags || `${tags.length}/5 tags`}
                    />
                  </Box>
                </Grid>
                
                {/* GitHub Repository Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      GitHub Repository (Optional)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Link to your GitHub repository for additional credibility
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <TextField
                        fullWidth
                        placeholder="https://github.com/username/repository"
                        value={githubLink}
                        onChange={(e) => {
                          setGithubLink(e.target.value);
                          updateFormDirty();
                        }}
                        disabled={isSubmitting}
                        error={!!errors.githubLink}
                        helperText={errors.githubLink}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GitHub />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={testGitHubLink}
                        disabled={!githubLink || isSubmitting}
                        sx={{ minWidth: '100px' }}
                      >
                        Test
                      </Button>
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isPrivateRepo}
                          onChange={(e) => {
                            setIsPrivateRepo(e.target.checked);
                            updateFormDirty();
                          }}
                          disabled={isSubmitting}
                        />
                      }
                      label="This is a private repository"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                
                {/* Style Attributes Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Style & Design Attributes
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Help users find templates that match their design preferences
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Visual Style */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Visual Style</InputLabel>
                          <Select
                            multiple
                            value={visualStyle}
                            onChange={(e) => {
                              setVisualStyle(e.target.value);
                              updateFormDirty();
                            }}
                            input={<OutlinedInput label="Visual Style" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {['Minimalist', 'Colorful', 'Dark Mode', 'Light Mode', 'Gradient', 'Flat Design', 'Neumorphic', 'Glassmorphic', '3D Elements', 'Illustrated', 'Photographic', 'Retro/Vintage', 'Futuristic', 'Playful', 'Corporate', 'Luxury'].map((style) => (
                              <MenuItem key={style} value={style}>
                                <Checkbox checked={visualStyle.indexOf(style) > -1} />
                                <ListItemText primary={style} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Layout Structure */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Layout Structure</InputLabel>
                          <Select
                            value={layoutStructure}
                            onChange={(e) => {
                              setLayoutStructure(e.target.value);
                              updateFormDirty();
                            }}
                            label="Layout Structure"
                          >
                            {['Grid-based', 'Asymmetrical', 'Single Page', 'Multi-page', 'Card-based', 'Timeline', 'Magazine', 'Dashboard', 'Portfolio Grid'].map((layout) => (
                              <MenuItem key={layout} value={layout}>{layout}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Complexity Level */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Complexity Level</InputLabel>
                          <Select
                            value={complexityLevel}
                            onChange={(e) => {
                              setComplexityLevel(e.target.value);
                              updateFormDirty();
                            }}
                            label="Complexity Level"
                          >
                            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                              <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Responsiveness */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Responsiveness</InputLabel>
                          <Select
                            value={responsiveness}
                            onChange={(e) => {
                              setResponsiveness(e.target.value);
                              updateFormDirty();
                            }}
                            label="Responsiveness"
                          >
                            {['Mobile-First', 'Responsive', 'Desktop-Only', 'Mobile-Only', 'Tablet-Optimized'].map((resp) => (
                              <MenuItem key={resp} value={resp}>{resp}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Performance */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Performance</InputLabel>
                          <Select
                            value={performance}
                            onChange={(e) => {
                              setPerformance(e.target.value);
                              updateFormDirty();
                            }}
                            label="Performance"
                          >
                            {['Lightweight', 'Animation-Heavy', 'Optimized for Speed'].map((perf) => (
                              <MenuItem key={perf} value={perf}>{perf}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Accessibility Level */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Accessibility Level</InputLabel>
                          <Select
                            value={accessibilityLevel}
                            onChange={(e) => {
                              setAccessibilityLevel(e.target.value);
                              updateFormDirty();
                            }}
                            label="Accessibility Level"
                          >
                            {['Not Tested', 'WCAG AA Compliant', 'WCAG AAA Compliant', 'Screen Reader Friendly', 'High Contrast'].map((level) => (
                              <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Language Support */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Language Support</InputLabel>
                          <Select
                            value={languageSupport}
                            onChange={(e) => {
                              setLanguageSupport(e.target.value);
                              updateFormDirty();
                            }}
                            label="Language Support"
                          >
                            {['English', 'Multi-language', 'RTL Support', 'Localization Ready'].map((lang) => (
                              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                
                {/* Basic Pricing Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Pricing Model
                    </Typography>
                    <FormControl fullWidth disabled={isSubmitting} error={!!errors.pricingTier}>
                      <RadioGroup
                        value={pricingTier}
                        onChange={(e) => {
                          setPricingTier(e.target.value);
                          updateFormDirty();
                          setErrors(prev => ({ ...prev, pricingTier: undefined }));
                        }}
                      >
                        <FormControlLabel
                          value="Free"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">Free Template</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Share your template for free and build your reputation
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="Premium"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">Premium Template</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Set a price and earn revenue from your template
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                      {errors.pricingTier && (
                        <FormHelperText>{errors.pricingTier}</FormHelperText>
                      )}
                    </FormControl>
                    
                    {pricingTier === 'Premium' && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          type="number"
                          label="Price (USD)"
                          value={price}
                          onChange={(e) => {
                            setPrice(Number(e.target.value));
                            updateFormDirty();
                          }}
                          disabled={isSubmitting}
                          error={!!errors.price}
                          helperText={errors.price || `You'll earn $${(price * 0.7).toFixed(2)} per sale (70% revenue share)`}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          sx={{ maxWidth: '200px' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </StepContent>
          </Fade>
        );
        
      case 3: // Publish
        return (
          <Fade in={activeStep === 3}>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SectionTitle variant="h6">
                    <SectionIcon><AttachMoney /></SectionIcon>
                    Pricing & Publishing
                  </SectionTitle>
                  {errors.general && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.general}
                    </Alert>
                  )}
                </Grid>
                
                {/* Pricing Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Choose Your Pricing Model
                    </Typography>
                    <FormControl fullWidth disabled={isSubmitting} error={!!errors.pricingTier}>
                      <RadioGroup
                        value={pricingTier}
                        onChange={(e) => {
                          setPricingTier(e.target.value);
                          updateFormDirty();
                          // Clear error when user selects
                          if (errors.pricingTier) {
                            setErrors(prev => ({ ...prev, pricingTier: undefined }));
                          }
                        }}
                        row
                      >
                        <FormControlLabel 
                          value="Free" 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="body1">Free</Typography>
                              <Typography variant="caption" color="textSecondary">
                                Share with the community
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel 
                          value="Premium" 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="body1">Premium</Typography>
                              <Typography variant="caption" color="textSecondary">
                                Earn 70% of sales revenue
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                      {errors.pricingTier && <FormHelperText>{errors.pricingTier}</FormHelperText>}
                    </FormControl>
                  </Box>
                </Grid>
                
                {pricingTier === 'Premium' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Price (USD)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={price}
                      onChange={(e) => {
                        setPrice(Number(e.target.value));
                        updateFormDirty();
                      }}
                      disabled={isSubmitting}
                      error={!!errors.price}
                      helperText={errors.price || "You earn 70% of each sale"}
                      InputProps={{ 
                        inputProps: { min: 1, max: 999 },
                        startAdornment: <AttachMoney fontSize="small" />
                      }}
                    />
                  </Grid>
                )}
                
                {pricingTier === 'Premium' && price > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">💰 Earnings Calculator</Typography>
                      <Typography variant="body2">
                        At ${price} per download:
                        <br />• 10 downloads/month = ${(price * 10 * 0.7).toFixed(2)} earnings
                        <br />• 50 downloads/month = ${(price * 50 * 0.7).toFixed(2)} earnings
                        <br />• Premium templates average 30-50 downloads monthly
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                {/* GitHub Repository Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <GitHub sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Source Code Repository (Optional)
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Link to your GitHub repository to increase trust and showcase your code quality. This can boost downloads by up to 40%.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                    <TextField
                      label="GitHub Repository URL"
                      variant="outlined"
                      fullWidth
                      value={githubLink}
                      onChange={(e) => {
                        setGithubLink(e.target.value);
                        updateFormDirty();
                      }}
                      disabled={isSubmitting}
                      placeholder="https://github.com/username/repository"
                      error={!!errors.githubLink}
                      helperText={errors.githubLink || "Optional but recommended for higher trust"}
                      InputProps={{
                        startAdornment: <GitHub fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                    {githubLink && (
                      <Button
                        variant="outlined"
                        onClick={testGitHubLink}
                        disabled={isSubmitting}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Test
                      </Button>
                    )}
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrivateRepo}
                        onChange={(e) => {
                          setIsPrivateRepo(e.target.checked);
                          updateFormDirty();
                        }}
                        disabled={isSubmitting || !githubLink}
                      />
                    }
                    label="This is a private repository"
                    sx={{ mb: 1 }}
                  />
                  
                  {githubLink && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        ✅ Great! Adding a repository link increases user trust and can boost your downloads significantly.
                        {isPrivateRepo && " Don't worry - we'll note that the source is private."}
                      </Typography>
                    </Alert>
                  )}
                </Grid>
                
                {/* Quality Score Section */}
                <Grid item xs={12}>
                  <QualityScoreContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <QualityScoreLabel>
                        Template Quality Score
                        <Tooltip title={
                          <TooltipContent>
                            <TooltipTitle>Quality Score Criteria</TooltipTitle>
                            <TooltipText>
                              • Title: 10-60 characters (10 points)
                              • Description: 100+ characters (20 points)
                              • Category selected (15 points)
                              • Framework/tools selected (15 points)
                              • At least 1 image (20 points)
                              • 3+ images (10 points)
                              • Tags added (10 points)
                            </TooltipText>
                          </TooltipContent>
                        }>
                          <HelpOutline fontSize="small" sx={{ ml: 1, cursor: 'pointer' }} />
                        </Tooltip>
                      </QualityScoreLabel>
                      <QualityScoreValue score={qualityScore}>{qualityScore}%</QualityScoreValue>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={qualityScore} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: qualityScore >= 80 ? 'var(--status-success)' : 
                                          qualityScore >= 50 ? 'orange' : 'var(--status-error)'
                        }
                      }} 
                    />
                    <Box sx={{ mt: 1 }}>
                      {qualityScore >= 80 ? (
                        <Typography variant="body2" color="success.main">
                          ✅ Excellent! Your template is ready for submission.
                        </Typography>
                      ) : (
                        <Box>
                          <Typography variant="body2" color={qualityScore >= 50 ? 'warning.main' : 'error.main'}>
                            {qualityScore >= 50 ? '⚠️ Good start! ' : '❌ Needs improvement: '}
                            Missing requirements:
                          </Typography>
                          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                            {getMissingRequirements().map((req, index) => (
                              <Typography key={index} component="li" variant="body2" color="text.secondary">
                                {req.text}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </QualityScoreContainer>
                </Grid>
                
                {/* Tags Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags & Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField
                      label="Add Tag"
                      variant="outlined"
                      fullWidth
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      disabled={isSubmitting || tags.length >= 5}
                      error={!!errors.tags}
                      helperText={errors.tags || `${tags.length}/5 tags`}
                      sx={{ mr: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentTag && tags.length < 5) {
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddTag}
                      disabled={!currentTag || tags.length >= 5 || isSubmitting}
                      startIcon={<Add />}
                    >
                      Add
                    </Button>
                  </Box>
                  {tags.length > 0 && (
                    <TagsContainer sx={{ mt: 2 }}>
                      {tags.map((tag, index) => (
                        <TagChip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </TagsContainer>
                  )}
                </Grid>
                
                {/* Publish Checklist */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    📋 Pre-Publish Checklist
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {uploadedFiles.length > 0 ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Files uploaded ({uploadedFiles.length})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {description.length >= 100 ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Description complete (100+ chars)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {pricingTier ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Pricing set
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {title.length >= 10 ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Title complete (10+ chars)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {category ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Category selected
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {frameworkTools.length > 0 ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            Framework/tools selected
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {githubLink ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <RadioButtonUnchecked color="disabled" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            GitHub link (optional)
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                
                {/* Benefits Section */}
                <Grid item xs={12}>
                  <BenefitsContainer>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <Celebration color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Your Template Will Reach 500k+ Developers
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <BenefitItem>
                          <Star color="primary" />
                          <Typography variant="subtitle1">Gain Recognition</Typography>
                          <Typography variant="body2">Showcase your skills to thousands of developers worldwide</Typography>
                        </BenefitItem>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <BenefitItem>
                          <AttachMoney color="primary" />
                          <Typography variant="subtitle1">Earn Revenue</Typography>
                          <Typography variant="body2">
                            {pricingTier === 'Premium' ? 
                              `Earn up to $${(price * 50 * 0.7).toFixed(0)}/month` : 
                              'Build your reputation for future premium templates'
                            }
                          </Typography>
                        </BenefitItem>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <BenefitItem>
                          <GitHub color="primary" />
                          <Typography variant="subtitle1">Build Portfolio</Typography>
                          <Typography variant="body2">Add to your professional development portfolio</Typography>
                        </BenefitItem>
                      </Grid>
                    </Grid>
                  </BenefitsContainer>
                </Grid>
                
                {/* Submit Button */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <SubmitButton
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isAuthenticated || qualityScore < 50}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUpload />}
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish Your Template'}
                    </SubmitButton>
                  </Box>
                  {qualityScore < 50 && (
                    <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
                      Complete more requirements to enable publishing
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </StepContent>
          </Fade>
        );
        

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <HeaderBanner>
        <Typography variant="h4" component="h1">
          Share Your Amazing Designs With The Community
        </Typography>
        <Typography variant="subtitle1">
          Join 5,000+ designers who've shared templates and reached millions of developers
        </Typography>
        
        <StatsContainer>
          <StatItem>
            <Typography variant="h5">5K+</Typography>
            <Typography variant="body2">Active Creators</Typography>
          </StatItem>
          <StatItem>
            <Typography variant="h5">2M+</Typography>
            <Typography variant="body2">Monthly Downloads</Typography>
          </StatItem>
          <StatItem>
            <Typography variant="h5">$250K</Typography>
            <Typography variant="body2">Creator Earnings</Typography>
          </StatItem>
        </StatsContainer>
      </HeaderBanner>
      
      <FormContainer>
        <Box sx={{ mb: 4 }}>
          <StepperContainer>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperContainer>
        </Box>
        
        <FormSection>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <SecondaryButton
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
            >
              Back
            </SecondaryButton>
            
            {activeStep === steps.length - 1 ? (
              <SubmitButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !isAuthenticated}
                startIcon={<CloudUpload />}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Your Template'}
              </SubmitButton>
            ) : (
              <PrimaryButton
                variant="contained"
                onClick={() => {
                  console.log('Next button clicked!');
                  handleNext();
                }}
                disabled={isSubmitting}
                endIcon={<NavigateNext />}
              >
                Next
              </PrimaryButton>
            )}
          </Box>
        </FormSection>
        
        {activeStep === 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Popular Templates For Inspiration
            </Typography>
            
            <Grid container spacing={3}>
              {exampleTemplates.map((template, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ExampleCard>
                    <CardMedia
                      component="img"
                      height="140"
                      image={template.image}
                      alt={template.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {template.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template.category} • {template.framework}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ color: 'gold', mr: 0.5 }} fontSize="small" />
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {template.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({template.downloads} downloads)
                        </Typography>
                      </Box>
                    </CardContent>
                  </ExampleCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </FormContainer>
      
      {/* Full Preview Dialog */}
      <FullPreviewContainer
        uploadedFiles={uploadedFiles}
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
      />
    </PageContainer>
  );
};

export default UploadPage;