import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/theme-context';

import Layout from '@/routes/layout';
import DashboardPage from '@/routes/dashboard/page';
import CustomerPage from '@/routes/customers/page';
import ServicesPage from '@/routes/services/page';
import FAQpage from '@/routes/faq/page';
import AppointmentsPage from '@/routes/appointments/page';

const isAuthenticated = () => !!localStorage.getItem('isLoggedIn');

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'customers',
        element: <CustomerPage />,
      },
      {
        path: 'appointments',
        element: (
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'services',
        element: <ServicesPage />,
      },
      {
        path: 'faq',
        element: <FAQpage />,
      },
      {
        path: 'settings',
        element: <h1 className="title">Settings</h1>,
      },
    ],
  },
]);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded admin credentials
    const adminEmail = 'admin@example.com';
    const adminPassword = '1';

    if (formData.email !== adminEmail || formData.password !== adminPassword) {
      setError('Invalid email or password');
      return;
    }

    // Set logged-in state
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    alert('Login successful!');
  };

  if (!isLoggedIn) {
    return (
      <section id="login">
        <div className="title-text">
          <p>LOGIN</p>
          <h1>Sign In to Your Account</h1>
        </div>
        <div className="form-container">
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border rounded-md p-2"
                placeholder="admin@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="mt-1 block w-full border rounded-md p-2"
                placeholder="admin123"
              />
            </div>
            <div className="form-group">
              <button type="submit" className="submit-btn bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                Login
              </button>
            </div>
            <div className="form-footer">
              <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;