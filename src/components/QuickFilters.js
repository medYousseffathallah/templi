import React from 'react';
import styled from 'styled-components';
import { Chip, Box, Typography } from '@mui/material';
import {
  Dashboard,
  Web,
  PhoneAndroid,
  Login,
  ShoppingCart,
  AdminPanelSettings,
  Email,
  Palette,
  Code,
  TrendingUp
} from '@mui/icons-material';

const QuickFiltersContainer = styled.div`
  background-color: var(--background-paper);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const QuickFiltersTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
`;

const QuickFilterChip = styled(Chip)`
  && {
    height: 40px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background-color: var(--secondary-light);
      color: white;
    }
    
    &.active {
      background-color: var(--secondary-main);
      color: white;
      border-color: var(--secondary-main);
    }
    
    .MuiChip-icon {
      color: inherit;
    }
  }
`;

const QuickFilters = ({ onQuickFilter, activeFilters = {} }) => {
  const quickFilterOptions = [
    {
      label: 'Dashboard UI',
      value: 'Dashboard UI',
      icon: <Dashboard fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Web UI',
      value: 'Web UI',
      icon: <Web fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Mobile App UI',
      value: 'Mobile App UI',
      icon: <PhoneAndroid fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Landing Page',
      value: 'Landing Page UI',
      icon: <Web fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'E-commerce',
      value: 'E-commerce UI',
      icon: <ShoppingCart fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Authentication',
      value: 'Authentication UI',
      icon: <Login fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Admin Panel',
      value: 'Admin Panel UI',
      icon: <AdminPanelSettings fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'Email Template',
      value: 'Email Template UI',
      icon: <Email fontSize="small" />,
      filterType: 'categories'
    },
    {
      label: 'React',
      value: 'React',
      icon: <Code fontSize="small" />,
      filterType: 'frameworkTools'
    },
    {
      label: 'Figma',
      value: 'Figma',
      icon: <Palette fontSize="small" />,
      filterType: 'frameworkTools'
    },
    {
      label: 'Tailwind',
      value: 'Tailwind',
      icon: <Code fontSize="small" />,
      filterType: 'frameworkTools'
    },
    {
      label: 'Free Only',
      value: 'Free',
      icon: <TrendingUp fontSize="small" />,
      filterType: 'pricingTiers'
    }
  ];

  const handleQuickFilterClick = (option) => {
    const { filterType, value } = option;
    const currentValues = activeFilters[filterType] || [];
    
    let newValues;
    if (currentValues.includes(value)) {
      // Remove filter if already active
      newValues = currentValues.filter(item => item !== value);
    } else {
      // Add filter if not active
      newValues = [...currentValues, value];
    }
    
    onQuickFilter({
      ...activeFilters,
      [filterType]: newValues
    });
  };

  const isFilterActive = (option) => {
    const { filterType, value } = option;
    const currentValues = activeFilters[filterType] || [];
    return currentValues.includes(value);
  };

  return (
    <QuickFiltersContainer>
      <QuickFiltersTitle>
        <TrendingUp fontSize="small" />
        Popular Filters
      </QuickFiltersTitle>
      
      <FiltersGrid>
        {quickFilterOptions.map((option, index) => (
          <QuickFilterChip
            key={index}
            icon={option.icon}
            label={option.label}
            onClick={() => handleQuickFilterClick(option)}
            className={isFilterActive(option) ? 'active' : ''}
            variant={isFilterActive(option) ? 'filled' : 'outlined'}
          />
        ))}
      </FiltersGrid>
    </QuickFiltersContainer>
  );
};

export default QuickFilters;