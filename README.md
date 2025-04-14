# Blog CMS

A modern, full-stack blog content management system built with Django REST Framework and React.

## Features

- 🔐 User Authentication
  - Login/Register functionality
  - JWT token-based authentication
  - Protected routes and API endpoints

- 📝 Post Management
  - Create, read, update, and delete blog posts
  - Rich text content editing
  - Featured image upload
  - Post excerpts
  - Draft/Published status
  - Public/Private visibility

- 🏷️ Content Organization
  - Category management
  - Predefined categories (Travel, Education, Technology, etc.)
  - Custom category creation
  - Tag support for better content organization

- 👤 User Profiles
  - View and edit user profiles
  - Author information display
  - Profile visibility settings

- 💅 Modern UI
  - Material-UI components
  - Responsive design
  - Clean and intuitive interface
  - Loading states and error handling

## Tech Stack

### Frontend
- React
- Material-UI (MUI)
- React Router
- Axios
- Context API for state management

### Backend
- Django
- Django REST Framework
- Simple JWT for authentication
- PostgreSQL database
- Pillow for image handling

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd cms_backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- Authentication:
  - POST `/api/token/` - Obtain JWT token
  - POST `/api/token/refresh/` - Refresh JWT token
  - POST `/api/register/` - Register new user

- Posts:
  - GET `/api/posts/` - List all public posts
  - POST `/api/posts/` - Create new post
  - GET `/api/posts/{id}/` - Retrieve post
  - PUT `/api/posts/{id}/` - Update post
  - DELETE `/api/posts/{id}/` - Delete post
  - GET `/api/posts/my-posts/` - List user's posts

- Categories:
  - GET `/api/categories/` - List categories
  - POST `/api/categories/` - Create category
  - PUT `/api/categories/{id}/` - Update category
  - DELETE `/api/categories/{id}/` - Delete category

- User Profile:
  - GET `/api/user/profile/` - Get user profile
  - PUT `/api/user/profile/` - Update user profile

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=your_database_url
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 