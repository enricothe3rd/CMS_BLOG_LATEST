import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    visibility: 'public',
    featured_image: null,
  });
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        if (response.data.length === 0) {
          // Create default categories if none exist
          const defaultCategories = [
            { name: 'Travel', description: 'Travel experiences and destinations', slug: 'travel' },
            { name: 'Education', description: 'Educational content and learning resources', slug: 'education' },
            { name: 'Technology', description: 'Tech news, reviews, and tutorials', slug: 'technology' },
            { name: 'Lifestyle', description: 'Life, health, and wellness', slug: 'lifestyle' },
            { name: 'Food', description: 'Recipes, restaurants, and culinary experiences', slug: 'food' },
            { name: 'Business', description: 'Business insights and entrepreneurship', slug: 'business' },
            { name: 'Art & Culture', description: 'Art, music, and cultural topics', slug: 'art-culture' },
            { name: 'Science', description: 'Scientific discoveries and explanations', slug: 'science' }
          ];

          const token = localStorage.getItem('access_token');
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          };

          try {
            const createdCategories = await Promise.all(
              defaultCategories.map(category => 
                axios.post('http://localhost:8000/api/categories/', category, config)
              )
            );
            setCategories(createdCategories.map(response => response.data));
          } catch (error) {
            console.error('Error creating default categories:', error);
            // If creating defaults fails, still try to use any existing categories
            const existingResponse = await axios.get('http://localhost:8000/api/categories/');
            setCategories(existingResponse.data);
          }
        } else {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error loading categories. Please try again.');
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tags/');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchCategories();
    fetchTags();

    if (id) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('access_token');
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          };
          const response = await axios.get(`http://localhost:8000/api/posts/${id}/`, config);
          const post = response.data;
          
          // Check if the current user is the author
          if (post.author.id !== user.id) {
            setError('You do not have permission to edit this post');
            navigate('/my-posts');
            return;
          }
          
          setFormData({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            category: post.category ? post.category.id : '',
            tags: post.tags.map(tag => tag.id),
            status: post.status,
            visibility: post.visibility,
            featured_image: null,
          });
        } catch (error) {
          console.error('Error fetching post:', error);
          setError('Error fetching post. Please try again.');
          navigate('/my-posts');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      featured_image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      };

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('visibility', formData.visibility);
      
      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }
      
      // Add tags
      formData.tags.forEach(tagId => {
        formDataToSend.append('tags', tagId);
      });

      let response;
      if (id) {
        // Update existing post
        response = await axios.put(`http://localhost:8000/api/posts/${id}/`, formDataToSend, config);
        setSuccess('Post updated successfully!');
      } else {
        // Create new post
        response = await axios.post('http://localhost:8000/api/posts/', formDataToSend, config);
        setSuccess('Post created successfully!');
      }

      // Redirect to the post page after a short delay
      setTimeout(() => {
        if (id) {
          // If editing an existing post, go to that post
          navigate(`/blog/${response.data.id}`);
        } else {
          // If creating a new post, go to My Posts page
          navigate('/my-posts');
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error.response?.data?.detail || 'Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      setCategoryError('');
      if (!newCategory.name.trim()) {
        setCategoryError('Category name is required');
        return;
      }

      const token = localStorage.getItem('access_token');
      const categoryData = {
        ...newCategory,
        slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      const response = await axios.post(
        'http://localhost:8000/api/categories/',
        categoryData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      // Add the new category to the list and select it
      setCategories(prev => [...prev, response.data]);
      setFormData(prev => ({ ...prev, category: response.data.id }));
      setNewCategory({ name: '', description: '' });
      setOpenCategoryDialog(false);
      setSuccess('Category created successfully!');
    } catch (error) {
      setCategoryError(error.response?.data?.detail || 'Error creating category');
    }
  };

  if (loading && id) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ py: 4 }}>
        <Button
          component="button"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {id ? 'Edit Post' : 'Create New Post'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="excerpt"
                  label="Excerpt"
                  name="excerpt"
                  multiline
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  helperText="A short summary of your post"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="content"
                  label="Content"
                  name="content"
                  multiline
                  rows={12}
                  value={formData.content}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem 
                        key={category.id} 
                        value={category.id}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenCategoryDialog(true);
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        }
                      }}
                    >
                      <AddIcon sx={{ mr: 1 }} />
                      Create New Category
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="visibility-label">Visibility</InputLabel>
                  <Select
                    labelId="visibility-label"
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    label="Visibility"
                    onChange={handleChange}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleChange}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ height: '56px', width: '100%' }}
                >
                  {formData.featured_image ? 'Change Image' : 'Upload Featured Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.featured_image && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected: {formData.featured_image.name}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
            
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : id ? 'Update Post' : 'Create Post'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              error={!!categoryError}
              helperText={categoryError}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained" color="primary">
            Create Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostForm; 