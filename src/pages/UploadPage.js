import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { templateApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
  Checkbox,
  ListItemText,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";

const PageContainer = styled.div`
  padding: 24px;
  margin-left: 240px;
  margin-top: 64px;
  max-width: 1200px;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 64px;
    padding: 16px;
  }
`;

const FormContainer = styled(Paper)`
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const FormTitle = styled(Typography)`
  margin-bottom: 24px;
  font-weight: 600;
  color: var(--text-primary);
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--divider);
  padding-bottom: 8px;
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
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const SubmitButton = styled(Button)`
  margin-top: 24px;
  padding: 12px 24px;
  background-color: var(--primary-main);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 88, 100, 0.3);
  
  &:hover {
    background-color: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(255, 88, 100, 0.4);
  }
  
  &.Mui-disabled {
    background-color: rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.26);
  }
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
  overflow: hidden;
  border: 1px solid var(--divider);
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
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
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

const UploadPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [frameworkTools, setFrameworkTools] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Design specifications
  const [colorScheme, setColorScheme] = useState("Light");
  const [responsive, setResponsive] = useState(true);
  const [accessibilityLevel, setAccessibilityLevel] = useState("Not Tested");
  const [languageSupport, setLanguageSupport] = useState("English");
  
  // Pricing
  const [pricingTier, setPricingTier] = useState("Free");
  const [price, setPrice] = useState(0);
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Category options
  const categoryOptions = [
    'Web UI',
    'Mobile App UI',
    'Canva UI',
    'Presentation UI',
    'CV/Resume UI',
    'Dashboard UI',
    'E-commerce UI',
    'Admin Panel UI',
    'Landing Page UI',
    'Authentication UI',
    'Email Template UI',
    'Component Library',
    'Design System',
    'Other'
  ];
  
  // Framework/Tools options
  const frameworkToolsOptions = [
    'Figma',
    'Sketch',
    'Adobe XD',
    'HTML/CSS',
    'React',
    'Vue',
    'Angular',
    'Tailwind',
    'Bootstrap',
    'Webflow',
    'Framer',
    'Canva',
    'PowerPoint',
    'Keynote',
    'Other'
  ];
  
  // Sub-category options based on main category
  const getSubCategoryOptions = () => {
    switch (category) {
      case 'Web UI':
        return ['Portfolio', 'Blog', 'SaaS', 'Marketplace', 'Social Media', 'News/Magazine'];
      case 'Mobile App UI':
        return ['Social', 'E-commerce', 'Finance', 'Health & Fitness', 'Food & Delivery', 'Travel'];
      case 'CV/Resume UI':
        return ['Creative', 'Professional', 'Minimal', 'Academic', 'Technical'];
      case 'Dashboard UI':
        return ['Analytics', 'Admin', 'CRM', 'Finance', 'Healthcare', 'IoT'];
      case 'E-commerce UI':
        return ['Product Page', 'Checkout', 'Cart', 'Category Page', 'Search Results'];
      case 'Landing Page UI':
        return ['Product', 'Service', 'App', 'Event', 'Personal'];
      default:
        return [];
    }
  };
  
  // Reset sub-category when category changes
  useEffect(() => {
    setSubCategory("");
  }, [category]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Dispatch event to open auth modal
      document.dispatchEvent(new CustomEvent('openAuthModal'));
    }
  }, [isAuthenticated]);
  
  // Add a tag
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 5) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Add an image URL
  const handleAddImageUrl = () => {
    if (currentImageUrl && !imageUrls.includes(currentImageUrl)) {
      setImageUrls([...imageUrls, currentImageUrl]);
      setCurrentImageUrl("");
    }
  };
  
  // Remove an image URL
  const handleRemoveImageUrl = (urlToRemove) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
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
    
    if (imageUrls.length === 0 && !videoUrl) {
      newErrors.visualPreview = "At least one image or video URL is required";
    }
    
    if (tags.length > 5) newErrors.tags = "Maximum of 5 tags allowed";
    
    if (pricingTier === "Premium" && (!price || price <= 0)) {
      newErrors.price = "Price must be greater than 0 for Premium templates";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      document.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const templateData = {
        title,
        description,
        imageUrls,
        videoUrl,
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
        },
        pricingTier,
        price: pricingTier === "Premium" ? price : 0,
        creator: user._id, // Assuming user object has _id
      };
      
      await templateApi.create(templateData);
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting template:", error);
      setSubmitError(error.response?.data?.message || "Failed to submit template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <FormContainer elevation={0}>
        <FormTitle variant="h4">Upload New Template</FormTitle>
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Template submitted successfully! Redirecting...
          </Alert>
        )}
        
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle variant="h6">Basic Information</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Template Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title || `${title.length}/60 characters`}
                  disabled={isSubmitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                    disabled={isSubmitting}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.subCategory} disabled={!category || getSubCategoryOptions().length === 0} required={getSubCategoryOptions().length > 0}>
                  <InputLabel>Sub-Category</InputLabel>
                  <Select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    label="Sub-Category"
                    disabled={isSubmitting || !category || getSubCategoryOptions().length === 0}
                  >
                    {getSubCategoryOptions().map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.subCategory && <FormHelperText>{errors.subCategory}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.frameworkTools} required>
                  <InputLabel>Framework/Tools</InputLabel>
                  <Select
                    multiple
                    value={frameworkTools}
                    onChange={(e) => setFrameworkTools(e.target.value)}
                    input={<OutlinedInput label="Framework/Tools" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                    disabled={isSubmitting}
                  >
                    {frameworkToolsOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={frameworkTools.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.frameworkTools && <FormHelperText>{errors.frameworkTools}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description || `${description.length}/500 characters (minimum 100)`}
                  disabled={isSubmitting}
                  required
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <FormSection>
            <SectionTitle variant="h6">Visual Preview</SectionTitle>
            
            {errors.visualPreview && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.visualPreview}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <TextField
                    label="Image URL"
                    variant="outlined"
                    fullWidth
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddImageUrl}
                    disabled={!currentImageUrl || isSubmitting}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
                <FormHelperText>Add multiple screenshots showing different views/states</FormHelperText>
              </Grid>
              
              {imageUrls.length > 0 && (
                <Grid item xs={12}>
                  <ImagePreviewContainer>
                    {imageUrls.map((url, index) => (
                      <ImagePreview key={index}>
                        <PreviewImage src={url} alt={`Preview ${index + 1}`} />
                        <RemoveImageButton
                          size="small"
                          onClick={() => handleRemoveImageUrl(url)}
                          disabled={isSubmitting}
                        >
                          <Close fontSize="small" />
                        </RemoveImageButton>
                      </ImagePreview>
                    ))}
                  </ImagePreviewContainer>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  label="Video URL (Optional)"
                  variant="outlined"
                  fullWidth
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isSubmitting}
                  helperText="Add a video showcase (maximum 60 seconds)"
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <FormSection>
            <SectionTitle variant="h6">Tags & Keywords</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <TextField
                    label="Tag"
                    variant="outlined"
                    fullWidth
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    disabled={isSubmitting || tags.length >= 5}
                    error={!!errors.tags}
                    helperText={errors.tags || `${tags.length}/5 tags`}
                    sx={{ mr: 1 }}
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
              </Grid>
              
              {tags.length > 0 && (
                <Grid item xs={12}>
                  <TagsContainer>
                    {tags.map((tag, index) => (
                      <TagChip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        disabled={isSubmitting}
                      />
                    ))}
                  </TagsContainer>
                </Grid>
              )}
            </Grid>
          </FormSection>
          
          <FormSection>
            <SectionTitle variant="h6">Additional Information</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="GitHub Link (Optional)"
                  variant="outlined"
                  fullWidth
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  disabled={isSubmitting}
                  helperText="Repository with source code/design files"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPrivateRepo}
                      onChange={(e) => setIsPrivateRepo(e.target.checked)}
                      disabled={isSubmitting || !githubLink}
                    />
                  }
                  label="Private Repository"
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <FormSection>
            <SectionTitle variant="h6">Design Specifications</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSubmitting}>
                  <InputLabel>Color Scheme</InputLabel>
                  <Select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    label="Color Scheme"
                  >
                    {['Light', 'Dark', 'Both', 'Custom'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSubmitting}>
                  <InputLabel>Accessibility Level</InputLabel>
                  <Select
                    value={accessibilityLevel}
                    onChange={(e) => setAccessibilityLevel(e.target.value)}
                    label="Accessibility Level"
                  >
                    {['WCAG AA', 'WCAG AAA', 'Not Tested'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSubmitting}>
                  <InputLabel>Language Support</InputLabel>
                  <Select
                    value={languageSupport}
                    onChange={(e) => setLanguageSupport(e.target.value)}
                    label="Language Support"
                  >
                    {['English', 'Multiple', 'RTL Support'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={responsive}
                      onChange={(e) => setResponsive(e.target.checked)}
                      disabled={isSubmitting}
                    />
                  }
                  label="Responsive Design"
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <FormSection>
            <SectionTitle variant="h6">Pricing</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSubmitting}>
                  <InputLabel>Pricing Tier</InputLabel>
                  <Select
                    value={pricingTier}
                    onChange={(e) => setPricingTier(e.target.value)}
                    label="Pricing Tier"
                  >
                    {['Free', 'Premium', 'Freemium'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={isSubmitting || pricingTier !== "Premium"}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </FormSection>
          
          <SubmitButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting || !isAuthenticated}
            startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
          >
            {isSubmitting ? "Submitting..." : "Submit Template"}
          </SubmitButton>
        </form>
      </FormContainer>
    </PageContainer>
  );
};

export default UploadPage;