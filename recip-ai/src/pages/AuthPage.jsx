import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { LogIn } from 'lucide-react';

// The initial welcome/authentication page
export default function AuthPage() {
    const { userId } = useContext(AppContext);
    return (
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg mt-10">
            <LogIn className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-800">Welcome to RECIP.AI!</h2>
            <p className="mt-2 text-gray-600">You are automatically and securely signed in.</p>
            <div className="mt-6 bg-gray-100 p-3 rounded-md text-left">
                <p className="text-sm font-semibold text-gray-700">Your User ID:</p>
                <p className="text-xs text-gray-500 break-all">{userId}</p>
            </div>
            <p className="mt-4 text-sm text-gray-500">This ID keeps your grocery lists private and secure.</p>
        </div>
    );
}
