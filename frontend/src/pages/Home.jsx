import { useState, useEffect } from 'react';
import { Typography, Box, Container, Grid, Card, CardContent, CardMedia, CardActionArea, Chip, CircularProgress, Button, TextField, InputAdornment, Fade, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/posts/');
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = [...posts];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(post => 
        post.category && post.category.id.toString() === selectedCategory
      );
    }
    
    setFilteredPosts(result);
  }, [searchTerm, selectedCategory, posts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to CMS Blog
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A modern content management system built with Django and React
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search posts..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: { xs: 2, md: 0 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Filter by category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {filteredPosts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No posts found matching your criteria.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {filteredPosts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Fade in timeout={300 + index * 100}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={RouterLink} to={`/blog/${post.id}`}>
                    {post.featured_image ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.featured_image}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          height: 200, 
                          bgcolor: 'primary.light', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Typography variant="h6" color="white">
                          {post.title.charAt(0)}
                        </Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {post.category && (
                          <Chip 
                            label={post.category.name} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                        {post.tags.map((tag) => (
                          <Chip 
                            key={tag.id} 
                            label={tag.name} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                        <Chip 
                          label={post.visibility === 'public' ? 'Public' : 'Private'} 
                          size="small" 
                          color={post.visibility === 'public' ? 'success' : 'default'} 
                          variant="outlined" 
                          icon={<VisibilityIcon fontSize="small" />}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {post.author.username}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {user && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
          <Button 
            component={RouterLink} 
            to="/blog/create" 
            variant="contained" 
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            Create New Post
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Home; 