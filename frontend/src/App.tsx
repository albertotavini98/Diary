import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DiaryCalendar from './components/Calendar';
import styled from 'styled-components';
import EntriesSummary from './components/EntriesSummary';

// Styled components for Login and Signup
const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem;
    background: #7eb3ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #6a9fee;
    }
  }
`;

// Login Component
const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting login with:', { username, password });

    try {
      await login(username, password);
      console.log('Login successful!');
      navigate('/'); // Redirect to home/calendar page after successful login
    } catch (error: any) {
      console.error('Login error:', error.response || error);
      alert(`Login failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </Form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href="/signup" style={{ color: '#7eb3ff', textDecoration: 'none' }}>
          Sign up here
        </a>
      </p>
    </AuthContainer>
  );
};

// Signup Component
const Signup: React.FC = () => {
  const { signup } = useAuth();
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, username, password);
      alert('Signup successful! Please login.');
      window.location.href = '/login';  // Redirect to login after successful signup
    } catch (error) {
      alert('Signup failed');
    }
  };

  return (
    <AuthContainer>
      <h2>Sign Up</h2>
      <Form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </Form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#7eb3ff', textDecoration: 'none' }}>
          Login here
        </a>
      </p>
    </AuthContainer>
  );
};

// PrivateRoute component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Wrap Login and Signup components with navigation capability
const LoginWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Login />;
};

const SignupWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Signup />;
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/signup" element={<SignupWrapper />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <DiaryCalendar />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/entries" 
            element={
              <PrivateRoute>
                <EntriesSummary />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
