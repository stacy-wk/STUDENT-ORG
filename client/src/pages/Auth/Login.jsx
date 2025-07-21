// client/src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

// Login component for user authentication
function Login({ auth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Handles the login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    try {
      // Use Firebase Authentication to sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-student-os-white p-4">
      <div className="bg-white rounded-2xl shadow-custom-medium p-8 md:p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-student-os-accent mb-6">Welcome Back!</h2>
        <p className="text-student-os-dark-gray mb-8">Sign in to manage your university life.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition duration-200 text-student-os-dark-gray placeholder-student-os-light-gray"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition duration-200 text-student-os-dark-gray placeholder-student-os-light-gray"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-student-os-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-student-os-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-student-os-dark-gray">
          Don't have an account?{' '}
          <Link to="/signup" className="text-student-os-accent font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
