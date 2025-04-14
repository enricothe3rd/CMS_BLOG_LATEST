import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const defaultCategories = [
  { name: 'Technology', description: 'Posts about software, hardware, and tech trends' },
  { name: 'Travel', description: 'Travel experiences and destination guides' },
  { name: 'Lifestyle', description: 'Daily life, personal experiences, and lifestyle tips' },
  { name: 'Business', description: 'Business insights, entrepreneurship, and career advice' },
  { name: 'Health & Wellness', description: 'Health tips, fitness, and mental wellbeing' },
  { name: 'Personal Development', description: 'Self-improvement and personal growth' }
];

const CategoryManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const createDefaultCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      for (const category of defaultCategories) {
        await axios.post('http://localhost:8000/api/categories/', category, config);
      }

      setSuccess('Default categories created successfully!');
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error creating default categories:', error);
      setError('Failed to create default categories. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/categories/');
      setCategories(response.data);
      setError('');

      // If no categories exist, create default ones
      if (response.data.length === 0) {
        await createDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      if (editingCategory) {
        // Update existing category
        await axios.put(
          `http://localhost:8000/api/categories/${editingCategory.id}/`,
          newCategory,
          config
        );
        setSuccess('Category updated successfully!');
      } else {
        // Create new category
        await axios.post('http://localhost:8000/api/categories/', newCategory, config);
        setSuccess('Category created successfully!');
      }

      // Reset form and refresh categories
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.detail || 'Error saving category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:8000/api/categories/${categoryToDelete.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Manage Categories
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>

            {editingCategory && (
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '' });
                }}
                sx={{ mt: 1 }}
              >
                Cancel Editing
              </Button>
            )}
          </Box>
        </Paper>

        <Paper sx={{ mt: 4 }}>
          <List>
            {categories.map((category) => (
              <ListItem key={category.id} divider>
                <ListItemText
                  primary={category.name}
                  secondary={category.description}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={() => handleEdit(category)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {categories.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No categories yet"
                  secondary="Create your first category above"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this category? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManager; 