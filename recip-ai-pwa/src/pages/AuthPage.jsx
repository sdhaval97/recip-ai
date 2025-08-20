import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ChefHat } from 'lucide-react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex items-center justify-center mb-6">
            <ChefHat className="text-green-500 h-10 w-10 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
        </div>
        <p className="text-gray-600 mb-8 text-center">Sign in via magic link with your email below.</p>
        <form onSubmit={handleLogin} className="w-full max-w-sm">
            <input
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
                {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
        </form>
        {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
    </div>
  );
}
