import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Box,
  Button,
  Container,
  Skeleton,
  Alert
} from '@mui/material';
import axios from 'axios';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/posts/');
        setPosts(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 4 }}
        >
          Blog Posts
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {loading ? (
            // Loading skeletons
            [...Array(6)].map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : posts.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No posts available at the moment.
              </Alert>
            </Grid>
          ) : (
            posts.map((post) => (
              <Grid item key={post.id} xs={12} sm={6} md={4}>
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
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {post.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      {post.excerpt}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/blog/${post.id}`}
                      variant="contained"
                      color="primary"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Blog; 