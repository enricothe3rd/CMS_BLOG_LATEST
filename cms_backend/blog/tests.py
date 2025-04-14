from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class UserRegistrationTests(APITestCase):
    def setUp(self):
        # Create a test user that already exists
        self.existing_user = User.objects.create_user(
            username='existinguser',
            email='existing@test.com',
            password='TestPass123!'
        )
        self.register_url = reverse('register')

    def test_successful_registration(self):
        """Test successful user registration"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # Including the existing user
        self.assertEqual(User.objects.filter(username='testuser').exists(), True)

    def test_duplicate_username(self):
        """Test registration with existing username"""
        data = {
            'username': 'existinguser',
            'email': 'new@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_duplicate_email(self):
        """Test registration with existing email"""
        data = {
            'username': 'newuser',
            'email': 'existing@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_invalid_password(self):
        """Test registration with invalid password"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': '123',  # Too short
            'confirm_password': '123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'TestPass123!',
            'confirm_password': 'DifferentPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_missing_fields(self):
        """Test registration with missing required fields"""
        data = {
            'username': 'testuser',
            'email': '',  # Missing email
            'password': 'TestPass123!',
            'confirm_password': 'TestPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
