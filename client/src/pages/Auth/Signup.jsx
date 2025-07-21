// client/src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast'; // Ensure this import is correct

function Signup({ auth, db }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Dismiss any currently visible toasts

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      toast.error('Please enter a username.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        username: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Account created successfully! You are now logged in.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please login or use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else {
        // Fallback for unhandled errors
        errorMessage = `Signup failed: ${error.message || 'Unknown error'}`;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-student-os-white p-4">
      <div className="bg-white rounded-2xl shadow-custom-medium p-8 md:p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-student-os-accent mb-6">Join StudentOS!</h2>
        <p className="text-student-os-dark-gray mb-8">Create your account to get organized.</p>

        <form onSubmit={handleSignup} className="space-y-6">
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
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition duration-200 text-student-os-dark-gray placeholder-student-os-light-gray"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition duration-200 text-student-os-dark-gray placeholder-student-os-light-gray"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition duration-200 text-student-os-dark-gray placeholder-student-os-light-gray"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-student-os-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-student-os-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-student-os-dark-gray">
          Already have an account?{' '}
          <Link to="/login" className="text-student-os-accent font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
