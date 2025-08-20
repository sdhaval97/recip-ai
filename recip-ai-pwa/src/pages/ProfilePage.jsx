import React from 'react';
import { supabase } from '../supabaseClient';

export default function ProfilePage({ session }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <p className="text-gray-600 mb-4">Logged in as:</p>
      <p className="font-bold text-gray-800 mb-8">{session.user.email}</p>
      <button
        onClick={handleSignOut}
        className="w-full max-w-sm bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
