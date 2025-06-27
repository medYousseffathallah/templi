import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Box,
  Typography,
  Button,
  Slider,
  Switch
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear,
  Category,
  Code,
  Palette,
  AttachMoney,
  Language,
  Accessibility
} from '@mui/icons-material';

const FilterContainer = styled.div`
  background-color: var(--background-paper);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearButton = styled(Button)`
  && {
    color: var(--text-secondary);
    font-size: 12px;
    padding: 4px 8px;
    min-width: auto;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
`;

const FilterSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const FilterChip = styled(Chip)`
  && {
    height: 28px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.selected {
      background-color: var(--secondary-main);
      color: white;
    }
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--background-default);
  color: var(--text-primary);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--secondary-main);
    box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const FilterPanel = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    categories: [],
    frameworkTools: [],
    pricingTiers: [],
    colorSchemes: [],
    responsive: null,
    accessibilityLevels: [],
    languageSupport: [],
    sortBy: 'createdAt',
    ...initialFilters
  });

  // Filter options based on the Template schema
  const filterOptions = {
    categories: [
      'Web UI',
      'Mobile App UI', 
      'Dashboard UI',
      'Landing Page UI',
      'E-commerce UI',
      'Authentication UI',
      'Admin Panel UI',
      'Email Template UI',
      'Component Library',
      'Design System',
      'Canva UI',
      'Presentation UI',
      'CV/Resume UI',
      'Other'
    ],
    frameworkTools: [
      'React',
      'Vue',
      'Angular',
      'HTML/CSS',
      'Tailwind',
      'Bootstrap',
      'Figma',
      'Sketch',
      'Adobe XD',
      'Webflow',
      'Framer',
      'Canva',
      'PowerPoint',
      'Keynote',
      'Other'
    ],
    pricingTiers: ['Free', 'Premium', 'Freemium'],
    colorSchemes: ['Light', 'Dark', 'Both', 'Custom'],
    accessibilityLevels: ['WCAG AA', 'WCAG AAA', 'Not Tested'],
    languageSupport: ['English', 'Multiple', 'RTL Support'],
    sortOptions: [
      { value: 'createdAt', label: 'Newest First' },
      { value: 'likes', label: 'Most Liked' },
      { value: 'title', label: 'Alphabetical' }
    ]
  };

  const handleFilterChange = (filterType, value, isMultiple = true) => {
    setFilters(prev => {
      let newFilters;
      
      if (isMultiple) {
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value];
        newFilters = { ...prev, [filterType]: newValues };
      } else {
        newFilters = { ...prev, [filterType]: value };
      }
      
      return newFilters;
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchQuery: '',
      categories: [],
      frameworkTools: [],
      pricingTiers: [],
      colorSchemes: [],
      responsive: null,
      accessibilityLevels: [],
      languageSupport: [],
      sortBy: 'createdAt'
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.searchQuery ||
           filters.categories.length > 0 ||
           filters.frameworkTools.length > 0 ||
           filters.pricingTiers.length > 0 ||
           filters.colorSchemes.length > 0 ||
           filters.responsive !== null ||
           filters.accessibilityLevels.length > 0 ||
           filters.languageSupport.length > 0 ||
           filters.sortBy !== 'createdAt';
  };

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <FilterList fontSize="small" />
          Filters & Search
        </FilterTitle>
        {hasActiveFilters() && (
          <ClearButton
            startIcon={<Clear fontSize="small" />}
            onClick={clearAllFilters}
          >
            Clear All
          </ClearButton>
        )}
      </FilterHeader>

      {/* Search */}
      <FilterSection>
        <SectionTitle>Search Templates</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search by title, description, or tags..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
        />
      </FilterSection>

      {/* Sort */}
      <FilterSection>
        <SectionTitle>Sort By</SectionTitle>
        <FormControl fullWidth size="small">
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value, false)}
          >
            {filterOptions.sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterSection>

      {/* Categories */}
      <FilterSection>
        <SectionTitle>
          <Category fontSize="small" />
          Categories
        </SectionTitle>
        <ChipContainer>
          {filterOptions.categories.map(category => (
            <FilterChip
              key={category}
              label={category}
              className={filters.categories.includes(category) ? 'selected' : ''}
              onClick={() => handleFilterChange('categories', category)}
            />
          ))}
        </ChipContainer>
      </FilterSection>

      {/* Framework & Tools */}
      <FilterSection>
        <SectionTitle>
          <Code fontSize="small" />
          Framework & Tools
        </SectionTitle>
        <ChipContainer>
          {filterOptions.frameworkTools.map(tool => (
            <FilterChip
              key={tool}
              label={tool}
              className={filters.frameworkTools.includes(tool) ? 'selected' : ''}
              onClick={() => handleFilterChange('frameworkTools', tool)}
            />
          ))}
        </ChipContainer>
      </FilterSection>

      {/* Pricing */}
      <FilterSection>
        <SectionTitle>
          <AttachMoney fontSize="small" />
          Pricing
        </SectionTitle>
        <ChipContainer>
          {filterOptions.pricingTiers.map(tier => (
            <FilterChip
              key={tier}
              label={tier}
              className={filters.pricingTiers.includes(tier) ? 'selected' : ''}
              onClick={() => handleFilterChange('pricingTiers', tier)}
            />
          ))}
        </ChipContainer>
      </FilterSection>

      {/* Design Specifications */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Palette fontSize="small" />
            Design Specifications
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Color Scheme */}
          <FilterSection>
            <SectionTitle>Color Scheme</SectionTitle>
            <ChipContainer>
              {filterOptions.colorSchemes.map(scheme => (
                <FilterChip
                  key={scheme}
                  label={scheme}
                  className={filters.colorSchemes.includes(scheme) ? 'selected' : ''}
                  onClick={() => handleFilterChange('colorSchemes', scheme)}
                />
              ))}
            </ChipContainer>
          </FilterSection>

          {/* Responsive */}
          <FilterSection>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.responsive === true}
                  onChange={(e) => handleFilterChange('responsive', e.target.checked ? true : null, false)}
                  color="secondary"
                />
              }
              label="Responsive Design"
            />
          </FilterSection>

          {/* Accessibility */}
          <FilterSection>
            <SectionTitle>
              <Accessibility fontSize="small" />
              Accessibility Level
            </SectionTitle>
            <ChipContainer>
              {filterOptions.accessibilityLevels.map(level => (
                <FilterChip
                  key={level}
                  label={level}
                  className={filters.accessibilityLevels.includes(level) ? 'selected' : ''}
                  onClick={() => handleFilterChange('accessibilityLevels', level)}
                />
              ))}
            </ChipContainer>
          </FilterSection>

          {/* Language Support */}
          <FilterSection>
            <SectionTitle>
              <Language fontSize="small" />
              Language Support
            </SectionTitle>
            <ChipContainer>
              {filterOptions.languageSupport.map(lang => (
                <FilterChip
                  key={lang}
                  label={lang}
                  className={filters.languageSupport.includes(lang) ? 'selected' : ''}
                  onClick={() => handleFilterChange('languageSupport', lang)}
                />
              ))}
            </ChipContainer>
          </FilterSection>
        </AccordionDetails>
      </Accordion>
    </FilterContainer>
  );
};

export default FilterPanel;