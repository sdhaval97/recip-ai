import React from 'react';
import { ChefHat } from 'lucide-react';

// The main header component with your app's name
export default function Header() {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
                <ChefHat className="text-green-500 h-8 w-8 mr-3" />
                <h1 className="text-2xl font-bold text-gray-700 tracking-tight">RECIP.AI</h1>
            </div>
        </header>
    );
}
