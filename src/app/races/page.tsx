'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RaceCard from '@/components/races/RaceCard';
import { RaceStatus } from '@prisma/client';

// Mock data for now
const mockRaces = [
  {
    id: '1',
    name: 'Daytona 500',
    track: 'Daytona International Speedway',
    category: 'Oval',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'UPCOMING' as RaceStatus,
    participants: Array.from({ length: 40 }, (_, i) => ({
      id: `driver-${i + 1}`,
      name: `Driver ${i + 1}`,
    })),
  },
  {
    id: '2',
    name: 'Spa 24 Hours',
    track: 'Circuit de Spa-Francorchamps',
    category: 'Road',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'UPCOMING' as RaceStatus,
    participants: Array.from({ length: 30 }, (_, i) => ({
      id: `driver-${i + 100}`,
      name: `Driver ${i + 100}`,
    })),
  },
  {
    id: '3',
    name: 'Nürburgring Grand Prix',
    track: 'Nürburgring',
    category: 'Road',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'UPCOMING' as RaceStatus,
    participants: Array.from({ length: 25 }, (_, i) => ({
      id: `driver-${i + 200}`,
      name: `Driver ${i + 200}`,
    })),
  },
  {
    id: '4',
    name: 'Monaco Sprint',
    track: 'Circuit de Monaco',
    category: 'Road',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'COMPLETED' as RaceStatus,
    participants: Array.from({ length: 20 }, (_, i) => ({
      id: `driver-${i + 300}`,
      name: `Driver ${i + 300}`,
      finishPosition: i,
    })),
  },
  {
    id: '5',
    name: 'Indianapolis 500',
    track: 'Indianapolis Motor Speedway',
    category: 'Oval',
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'LIVE' as RaceStatus,
    participants: Array.from({ length: 33 }, (_, i) => ({
      id: `driver-${i + 400}`,
      name: `Driver ${i + 400}`,
    })),
  },
];

// Define race categories
const categories = ['All', 'Road', 'Oval', 'Dirt Road', 'Dirt Oval'];

export default function RacesPage() {
  const [activeTab, setActiveTab] = useState<RaceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [races, setRaces] = useState(mockRaces);

  // In a real app, this would fetch from the API
  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Normally you would fetch from the API here
        // const response = await fetch('/api/races');
        // const data = await response.json();
        // setRaces(data.races);
        
        // Using mock data for now
        setRaces(mockRaces);
      } catch (err) {
        console.error('Error fetching races:', err);
        setError('Failed to load races. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRaces();
  }, []);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: RaceStatus | 'ALL') => {
    setActiveTab(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle category change
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };

  // Filter races based on active tab, search query, and category
  const filteredRaces = races.filter(race => {
    // Filter by status
    if (activeTab !== 'ALL' && race.status !== activeTab) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !race.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !race.track.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (category !== 'All' && race.category !== category) {
      return false;
    }
    
    return true;
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          iRacing Events
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse upcoming, live, and completed races. Place bets on your favorite drivers.
        </Typography>
        
        {/* Filters */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          alignItems: { xs: 'stretch', md: 'center' },
          my: 3 
        }}>
          <TextField
            placeholder="Search races or tracks..."
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon color="action" />
                </InputAdornment>
              }
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="race status tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Races" value="ALL" />
            <Tab label="Upcoming" value="UPCOMING" />
            <Tab label="Live" value="LIVE" />
            <Tab label="Completed" value="COMPLETED" />
          </Tabs>
        </Box>
        
        {/* Results */}
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : filteredRaces.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No races found matching your criteria.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredRaces.length} races
                </Typography>
                {searchQuery && (
                  <Chip 
                    label={`Search: "${searchQuery}"`} 
                    size="small" 
                    onDelete={() => setSearchQuery('')} 
                  />
                )}
                {category !== 'All' && (
                  <Chip 
                    label={`Category: ${category}`} 
                    size="small" 
                    onDelete={() => setCategory('All')} 
                  />
                )}
              </Box>
              
              <Divider sx={{ mb: 4 }} />
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(3, 1fr)', 
                  lg: 'repeat(4, 1fr)' 
                }, 
                gap: 3 
              }}>
                {filteredRaces.map((race) => (
                  <Box key={race.id}>
                    <RaceCard race={race} />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
} 