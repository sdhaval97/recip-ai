import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ChefHat } from 'lucide-react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (isSigningUp) {
      // Handle Sign Up
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Success! Please check your email to verify your account.');
      }
    } else {
      // Handle Sign In
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      }
      // Note: Successful sign-in is handled by the onAuthStateChange listener in App.jsx
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex items-center justify-center mb-6">
            <ChefHat className="text-green-500 h-10 w-10 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
        </div>
        <p className="text-gray-600 mb-8 text-center">
          {isSigningUp ? 'Create a new account' : 'Sign in to your account'}
        </p>
        <form onSubmit={handleAuthAction} className="w-full max-w-sm">
            <input
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
                type="password"
                placeholder="Your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
                {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
            </button>
        </form>

        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="mt-4 text-sm text-gray-600 hover:underline"
        >
          {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>

        {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}
