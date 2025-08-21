import React from 'react';
import { supabase } from '../supabaseClient';

export default function ProfilePage({ session, unitSystem, onUnitSystemChange }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-center mb-6">Profile & Settings</h2>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Logged in as:</p>
          <p className="font-semibold text-gray-800 break-all">{session.user.email}</p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Unit System:</p>
          <div className="flex rounded-lg border border-gray-300">
            <button 
              onClick={() => onUnitSystemChange('metric')}
              className={`flex-1 p-2 rounded-l-md text-sm font-semibold transition-colors ${unitSystem === 'metric' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Metric (kg, ml)
            </button>
            <button 
              onClick={() => onUnitSystemChange('imperial')}
              className={`flex-1 p-2 rounded-r-md text-sm font-semibold transition-colors ${unitSystem === 'imperial' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Imperial (lbs, oz)
            </button>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
