import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Box,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Tooltip,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyPosts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8000/api/posts/my_posts/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPosts(response.data);
        setFilteredPosts(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching my posts:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load your posts. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchMyPosts();
    }
  }, [user, authLoading, navigate]);

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
    
    // Filter by tab
    if (tabValue === 1) {
      result = result.filter(post => post.status === 'published');
    } else if (tabValue === 2) {
      result = result.filter(post => post.status === 'draft');
    } else if (tabValue === 3) {
      result = result.filter(post => post.visibility === 'public');
    } else if (tabValue === 4) {
      result = result.filter(post => post.visibility === 'private');
    }
    
    setFilteredPosts(result);
  }, [searchTerm, tabValue, posts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:8000/api/posts/${postToDelete.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            My Posts
          </Typography>
          <Button
            component={RouterLink}
            to="/blog/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Create New Post
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="All Posts" />
            <Tab label="Published" />
            <Tab label="Drafts" />
            <Tab label="Public" />
            <Tab label="Private" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Alert severity="info">
            {searchTerm 
              ? "No posts found matching your search criteria." 
              : "You haven't created any posts yet. Click the 'Create New Post' button to get started."}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {filteredPosts.map((post, index) => (
              <Grid item key={post.id} xs={12} sm={6} md={4}>
                <Fade in timeout={300 + index * 100}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
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
                        <Typography variant="h3" color="white">
                          {post.title.charAt(0)}
                        </Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                          {post.title}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit Post">
                            <IconButton 
                              component={RouterLink} 
                              to={`/blog/edit/${post.id}`}
                              size="small"
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Post">
                            <IconButton 
                              onClick={() => handleDeleteClick(post)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 2, flexGrow: 1 }}
                      >
                        {post.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Chip 
                          label={post.status === 'published' ? 'Published' : 'Draft'}
                          color={post.status === 'published' ? 'success' : 'default'}
                          size="small"
                        />
                        <Chip 
                          label={post.visibility === 'public' ? 'Public' : 'Private'}
                          color={post.visibility === 'public' ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyPosts; 