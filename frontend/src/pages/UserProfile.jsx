import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/user/${userId}/`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile. This profile may be private or no longer exists.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/posts/?author=${userId}&visibility=public`);
        setUserPosts(response.data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={userData?.avatar || null}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {userData?.username ? userData.username.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {userData?.first_name && userData?.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : userData?.username}
            </Typography>
            {userData?.bio && (
              <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                {userData.bio}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {userData?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {userData.location}
                  </Typography>
                </Box>
              )}
              {userData?.website && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WebsiteIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    <a href={userData.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {userData.website}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Public Posts by {userData?.first_name || userData?.username}
        </Typography>

        {userPosts.length === 0 ? (
          <Alert severity="info">
            No public posts available from this user.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {userPosts.map((post, index) => (
              <Grid item key={post.id} xs={12} sm={6}>
                <Fade in timeout={300 + index * 100}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {post.featured_image ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={post.featured_image}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          height: 140, 
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
                        {post.excerpt || post.content.substring(0, 100) + '...'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          label="Public" 
                          color="success" 
                          size="small"
                          icon={<VisibilityIcon fontSize="small" />}
                        />
                        <Button
                          component={RouterLink}
                          to={`/blog/${post.id}`}
                          variant="outlined"
                          size="small"
                        >
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile; 