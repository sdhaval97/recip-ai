import React, { useState } from 'react';

// Placeholder components for our pages
function InventoryPage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">My Inventory</h1></div>;
}

function RecipePage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Recipe Finder</h1></div>;
}

function ShoppingListPage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Shopping List</h1></div>;
}

export default function App() {
  const [activePage, setActivePage] = useState('inventory');

  const renderPage = () => {
    switch (activePage) {
      case 'inventory':
        return <InventoryPage />;
      case 'recipes':
        return <RecipePage />;
      case 'shopping-list':
        return <ShoppingListPage />;
      default:
        return <InventoryPage />;
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col shadow-2xl bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200 text-center">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            {/* We will replace this with an icon later */}
            <span className="text-2xl mr-2">🍳</span> 
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white shadow-t-md sticky bottom-0 z-10 border-t border-gray-200">
        <div className="px-4 py-2 flex justify-around">
          <button onClick={() => setActivePage('inventory')} className={`flex flex-col items-center w-24 p-2 rounded-lg ${activePage === 'inventory' ? 'text-green-600' : 'text-gray-500'}`}>
            {/* Icon Placeholder */}
            <span>📝</span>
            <span className="text-xs font-medium">Inventory</span>
          </button>
          <button onClick={() => setActivePage('recipes')} className={`flex flex-col items-center w-24 p-2 rounded-lg ${activePage === 'recipes' ? 'text-green-600' : 'text-gray-500'}`}>
            {/* Icon Placeholder */}
            <span>🍲</span>
            <span className="text-xs font-medium">Recipes</span>
          </button>
          <button onClick={() => setActivePage('shopping-list')} className={`flex flex-col items-center w-24 p-2 rounded-lg ${activePage === 'shopping-list' ? 'text-green-600' : 'text-gray-500'}`}>
            {/* Icon Placeholder */}
            <span>🛒</span>
            <span className="text-xs font-medium">To Buy</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
