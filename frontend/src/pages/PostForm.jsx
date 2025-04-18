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
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../api/config';
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
        const response = await api.get('/categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    const fetchTags = async () => {
      try {
        const response = await api.get('/tags/');
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
          const response = await api.get(`/posts/${id}/`);
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
            category: post.category,
            tags: post.tags.map(tag => tag.id),
            status: post.status,
            visibility: post.visibility,
            featured_image: null,
          });
        } catch (err) {
          console.error('Error fetching post:', err);
          setError('Failed to load post. Please try again later.');
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
        response = await api.put(`/posts/${id}/`, formDataToSend);
        setSuccess('Post updated successfully!');
      } else {
        response = await api.post('/posts/', formDataToSend);
        setSuccess('Post created successfully!');
      }

      navigate(`/post/${response.data.id}`);
    } catch (err) {
      console.error('Error saving post:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(errorData.message || 'Failed to save post. Please try again.');
        }
      } else {
        setError('Failed to save post. Please try again.');
      }
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

      const response = await api.post('/categories/', {
        ...newCategory,
        slug: newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
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
            <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  sx={{ height: '56px', width: '100%', mt: 2 }}
                  disabled={loading}
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
                {loading ? (
                  <CircularProgress size={24} />
                ) : id ? (
                  'Update Post'
                ) : (
                  'Create Post'
                )}
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
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained" color="primary" disabled={loading}>
            Create Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostForm; 