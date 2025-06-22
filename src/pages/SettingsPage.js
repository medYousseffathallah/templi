import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Palette,
  Person,
  Notifications,
  Apps,
  Search,
  Security,
  GitHub,
  Bolt,
  BarChart,
  Brightness2,
  Brightness7,
  Computer,
  Download,
  Visibility,
  Favorite,
  FilterList,
  Storage,
  Lock,
  Delete,
  OpenInNew,
  Save,
  Refresh
} from '@mui/icons-material';

const SettingsContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
`;

const SettingsHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
`;

const SettingsSection = styled.div`
  background: var(--background-elevated);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-default);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--accent-primary);
  border-radius: 8px;
  margin-right: 12px;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Toggle = styled.button`
  position: relative;
  width: 48px;
  height: 24px;
  background: ${props => props.active ? 'var(--accent-primary)' : 'var(--border-default)'};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--background-default);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--background-default);
  color: var(--text-primary);
  font-size: 14px;
  width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.variant === 'danger' ? 'var(--error-primary)' : 'var(--accent-primary)'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ThemeOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid ${props => props.active ? 'var(--accent-primary)' : 'var(--border-default)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accent-primary);
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  span {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const StatCard = styled.div`
  background: var(--background-default);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    // Appearance & Theme
    theme: 'system',
    accentColor: 'blue',
    compactMode: false,
    animationsEnabled: true,
    
    // Display & Layout
    templatesPerPage: 12,
    gridColumns: 'auto',
    showPreviewOnHover: true,
    autoPlayVideos: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    newTemplateAlerts: false,
    
    // Search & Filters
    defaultSortBy: 'newest',
    rememberFilters: true,
    showAdvancedFilters: false,
    searchHistory: true,
    
    // Data & Privacy
    trackingEnabled: true,
    analyticsEnabled: true,
    shareUsageData: false,
    
    // Performance
    preloadImages: true,
    cacheTemplates: true,
    lowDataMode: false,
    
    // Integrations
    githubIntegration: false,
    autoSyncFavorites: true
  });
  
  const [stats, setStats] = useState({
    totalDownloads: 0,
    favoriteTemplates: 0,
    templatesViewed: 0,
    accountAge: 0
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('templi-settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
    
    // Load user stats (mock data for now)
    setStats({
      totalDownloads: 42,
      favoriteTemplates: 15,
      templatesViewed: 128,
      accountAge: Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
    });
  }, []);
  
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('templi-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };
  
  const handleExportData = () => {
    const data = {
      settings,
      stats,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templi-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      setSettings({
        theme: 'system',
        accentColor: 'blue',
        compactMode: false,
        animationsEnabled: true,
        templatesPerPage: 12,
        gridColumns: 'auto',
        showPreviewOnHover: true,
        autoPlayVideos: true,
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        newTemplateAlerts: false,
        defaultSortBy: 'newest',
        rememberFilters: true,
        showAdvancedFilters: false,
        searchHistory: true,
        trackingEnabled: true,
        analyticsEnabled: true,
        shareUsageData: false,
        preloadImages: true,
        cacheTemplates: true,
        lowDataMode: false,
        githubIntegration: false,
        autoSyncFavorites: true
      });
    }
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <Title>Settings</Title>
        <Subtitle>Customize your Templi experience</Subtitle>
      </SettingsHeader>
      
      {/* Appearance & Theme */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Palette /></SectionIcon>
          <SectionTitle>Appearance & Theme</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Theme</SettingLabel>
            <SettingDescription>Choose your preferred color scheme</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ThemeGrid>
              <ThemeOption 
                active={settings.theme === 'light'}
                onClick={() => updateSetting('theme', 'light')}
              >
                <Brightness7 />
                <span>Light</span>
              </ThemeOption>
              <ThemeOption 
                active={settings.theme === 'dark'}
                onClick={() => updateSetting('theme', 'dark')}
              >
                <Brightness2 />
                <span>Dark</span>
              </ThemeOption>
              <ThemeOption 
                active={settings.theme === 'system'}
                onClick={() => updateSetting('theme', 'system')}
              >
                <Computer />
                <span>System</span>
              </ThemeOption>
            </ThemeGrid>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Accent Color</SettingLabel>
            <SettingDescription>Choose your preferred accent color</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select 
              value={settings.accentColor} 
              onChange={(e) => updateSetting('accentColor', e.target.value)}
            >
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Compact Mode</SettingLabel>
            <SettingDescription>Reduce spacing and padding for more content</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.compactMode}
              onClick={() => updateSetting('compactMode', !settings.compactMode)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Animations</SettingLabel>
            <SettingDescription>Enable smooth transitions and animations</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.animationsEnabled}
              onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Display & Layout */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Apps /></SectionIcon>
          <SectionTitle>Display & Layout</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Templates Per Page</SettingLabel>
            <SettingDescription>Number of templates to show per page</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select 
              value={settings.templatesPerPage} 
              onChange={(e) => updateSetting('templatesPerPage', parseInt(e.target.value))}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Grid Columns</SettingLabel>
            <SettingDescription>Number of columns in template grid</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select 
              value={settings.gridColumns} 
              onChange={(e) => updateSetting('gridColumns', e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="5">5 Columns</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Preview on Hover</SettingLabel>
            <SettingDescription>Show template preview when hovering over cards</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.showPreviewOnHover}
              onClick={() => updateSetting('showPreviewOnHover', !settings.showPreviewOnHover)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Auto-play Videos</SettingLabel>
            <SettingDescription>Automatically play video previews</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.autoPlayVideos}
              onClick={() => updateSetting('autoPlayVideos', !settings.autoPlayVideos)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Notifications */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Notifications /></SectionIcon>
          <SectionTitle>Notifications</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Email Notifications</SettingLabel>
            <SettingDescription>Receive updates via email</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.emailNotifications}
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Push Notifications</SettingLabel>
            <SettingDescription>Receive browser push notifications</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.pushNotifications}
              onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Weekly Digest</SettingLabel>
            <SettingDescription>Get a weekly summary of new templates</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.weeklyDigest}
              onClick={() => updateSetting('weeklyDigest', !settings.weeklyDigest)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>New Template Alerts</SettingLabel>
            <SettingDescription>Get notified when templates matching your interests are added</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.newTemplateAlerts}
              onClick={() => updateSetting('newTemplateAlerts', !settings.newTemplateAlerts)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Search & Filters */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Search /></SectionIcon>
          <SectionTitle>Search & Filters</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Default Sort Order</SettingLabel>
            <SettingDescription>How templates are sorted by default</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select 
              value={settings.defaultSortBy} 
              onChange={(e) => updateSetting('defaultSortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloaded</option>
              <option value="alphabetical">Alphabetical</option>
            </Select>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Remember Filters</SettingLabel>
            <SettingDescription>Save your filter preferences between sessions</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.rememberFilters}
              onClick={() => updateSetting('rememberFilters', !settings.rememberFilters)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Advanced Filters</SettingLabel>
            <SettingDescription>Show advanced filtering options by default</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.showAdvancedFilters}
              onClick={() => updateSetting('showAdvancedFilters', !settings.showAdvancedFilters)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Search History</SettingLabel>
            <SettingDescription>Keep track of your recent searches</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.searchHistory}
              onClick={() => updateSetting('searchHistory', !settings.searchHistory)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Data & Privacy */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Security /></SectionIcon>
          <SectionTitle>Data & Privacy</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Usage Tracking</SettingLabel>
            <SettingDescription>Help improve Templi by sharing anonymous usage data</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.trackingEnabled}
              onClick={() => updateSetting('trackingEnabled', !settings.trackingEnabled)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Analytics</SettingLabel>
            <SettingDescription>Enable analytics to track your template usage patterns</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.analyticsEnabled}
              onClick={() => updateSetting('analyticsEnabled', !settings.analyticsEnabled)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Share Usage Data</SettingLabel>
            <SettingDescription>Share aggregated usage data with template creators</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.shareUsageData}
              onClick={() => updateSetting('shareUsageData', !settings.shareUsageData)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Export Data</SettingLabel>
            <SettingDescription>Download all your data in JSON format</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Button onClick={handleExportData}>
              <Download />
              Export
            </Button>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Clear All Data</SettingLabel>
            <SettingDescription>Remove all your local data and reset settings</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Button variant="danger" onClick={handleClearData}>
              <Delete />
              Clear Data
            </Button>
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Performance */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><Bolt /></SectionIcon>
          <SectionTitle>Performance</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Preload Images</SettingLabel>
            <SettingDescription>Load template images in advance for faster browsing</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.preloadImages}
              onClick={() => updateSetting('preloadImages', !settings.preloadImages)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Cache Templates</SettingLabel>
            <SettingDescription>Store template data locally for faster loading</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.cacheTemplates}
              onClick={() => updateSetting('cacheTemplates', !settings.cacheTemplates)}
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Low Data Mode</SettingLabel>
            <SettingDescription>Reduce data usage by loading lower quality images</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.lowDataMode}
              onClick={() => updateSetting('lowDataMode', !settings.lowDataMode)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Integrations */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><GitHub /></SectionIcon>
          <SectionTitle>Integrations</SectionTitle>
        </SectionHeader>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>GitHub Integration</SettingLabel>
            <SettingDescription>Connect your GitHub account for enhanced features</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Button>
              <OpenInNew />
              {settings.githubIntegration ? 'Disconnect' : 'Connect'}
            </Button>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel>Auto-sync Favorites</SettingLabel>
            <SettingDescription>Automatically sync favorites across devices</SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Toggle 
              active={settings.autoSyncFavorites}
              onClick={() => updateSetting('autoSyncFavorites', !settings.autoSyncFavorites)}
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
      
      {/* Analytics Dashboard */}
      <SettingsSection>
        <SectionHeader>
          <SectionIcon><BarChart /></SectionIcon>
          <SectionTitle>Your Analytics</SectionTitle>
        </SectionHeader>
        
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalDownloads}</StatValue>
            <StatLabel>Total Downloads</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.favoriteTemplates}</StatValue>
            <StatLabel>Favorite Templates</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.templatesViewed}</StatValue>
            <StatLabel>Templates Viewed</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.accountAge}</StatValue>
            <StatLabel>Days Active</StatLabel>
          </StatCard>
        </StatsGrid>
      </SettingsSection>
      
      {/* Save Button */}
      <SettingsSection>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? <Refresh /> : <Save />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </SettingsSection>
    </SettingsContainer>
  );
};

export default SettingsPage;