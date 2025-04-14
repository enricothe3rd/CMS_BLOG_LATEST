import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Container, 
  Paper, 
  Chip, 
  Divider, 
  Button, 
  Avatar, 
  CircularProgress, 
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Post = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/posts/${id}/`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post. It may be private or no longer exists.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:8000/api/posts/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Redirect to home page after successful deletion
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
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
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button 
            component={RouterLink} 
            to="/" 
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>Post not found</Alert>
          <Button 
            component={RouterLink} 
            to="/" 
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  const isAuthor = user && post.author.id === user.id;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Button 
          component={RouterLink} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                {post.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={post.author.avatar} 
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {post.author.username ? post.author.username.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>
                  {post.visibility === 'public' ? (
                    <Button
                      component={RouterLink}
                      to={`/user/${post.author.id}`}
                      variant="text"
                      sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                    >
                      <Typography variant="subtitle1" color="primary">
                        {post.author.username}
                      </Typography>
                    </Button>
                  ) : (
                    <Typography variant="subtitle1">
                      {post.author.username}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    {new Date(post.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip 
                  label={post.visibility === 'public' ? 'Public' : 'Private'} 
                  color={post.visibility === 'public' ? 'success' : 'default'} 
                  size="small"
                  icon={<VisibilityIcon fontSize="small" />}
                />
                <Chip 
                  label={post.status} 
                  color={post.status === 'published' ? 'success' : 'default'} 
                  size="small"
                />
              </Box>
            </Box>
            {isAuthor && (
              <Box>
                <Tooltip title="Edit Post">
                  <IconButton 
                    component={RouterLink} 
                    to={`/blog/edit/${post.id}`}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={deleteConfirm ? "Click again to confirm" : "Delete Post"}>
                  <IconButton 
                    onClick={handleDelete}
                    color={deleteConfirm ? "error" : "default"}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {post.featured_image && (
            <Box
              component="img"
              src={post.featured_image}
              alt={post.title}
              sx={{
                width: '100%',
                maxHeight: 500,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 4,
              }}
            />
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {post.content}
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {post.category && (
              <Chip 
                label={post.category.name} 
                color="primary" 
                variant="outlined" 
              />
            )}
            {post.tags.map((tag) => (
              <Chip 
                key={tag.id} 
                label={tag.name} 
                variant="outlined" 
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Post; 