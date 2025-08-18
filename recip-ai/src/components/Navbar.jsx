import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { List, UtensilsCrossed, ShoppingCart } from 'lucide-react';

// The bottom navigation bar
export default function Navbar() {
    const { page, setPage } = useContext(AppContext);
    const navItems = [
        { id: 'inventory', icon: List, label: 'Inventory' },
        { id: 'recipe', icon: UtensilsCrossed, label: 'Recipes' },
        { id: 'to-buy', icon: ShoppingCart, label: 'To Buy' },
    ];

    return (
        <nav className="bg-white shadow-t-md sticky bottom-0 z-10 border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-2 flex justify-around">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`flex flex-col items-center justify-center w-24 p-2 rounded-lg transition-colors duration-200 ${
                            page === item.id ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <item.icon className="h-6 w-6 mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
