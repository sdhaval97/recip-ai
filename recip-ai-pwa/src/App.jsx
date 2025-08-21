import React, { useState } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, PlusCircle, Trash2 } from 'lucide-react';

// --- Page Components ---

function InventoryPage({ inventory, onAddItem, onDeleteItem }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !quantity) return;
    onAddItem({ name: itemName, quantity: parseFloat(quantity), unit });
    setItemName('');
    setQuantity('');
    setUnit('');
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input 
            type="text" 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name" 
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2" 
            required 
          />
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty" 
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1" 
            required 
          />
          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 bg-white"
          >
            <option value="">- Unit -</option>
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="litre">litre</option>
            <option value="ml">ml</option>
            <option value="lbs">lbs</option>
            <option value="oz">oz</option>
          </select>
          <button type="submit" className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow col-span-1">
            <PlusCircle size={24} />
          </button>
        </div>
      </form>
      
      {inventory.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">Your inventory is empty</h3>
          <p className="mt-1 text-gray-500">Add items to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {inventory.map(item => (
            <li key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div>
                <span className="font-bold capitalize">{item.name}</span>
                <span className="text-gray-500 text-sm ml-2">{item.quantity} {item.unit}</span>
              </div>
              <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecipePage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Recipe Finder</h1></div>;
}

function ShoppingListPage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">Shopping List</h1></div>;
}


// --- Main App Component ---

export default function App() {
  const [activePage, setActivePage] = useState('inventory');
  const [inventory, setInventory] = useState([]);

  const addItem = (item) => {
    const newItem = { ...item, id: Date.now() };
    setInventory([...inventory, newItem]);
  };

  const deleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'inventory':
        return <InventoryPage inventory={inventory} onAddItem={addItem} onDeleteItem={deleteItem} />;
      case 'recipes':
        return <RecipePage />;
      case 'shopping-list':
        return <ShoppingListPage />;
      default:
        return <InventoryPage inventory={inventory} onAddItem={addItem} onDeleteItem={deleteItem} />;
    }
  };

  const NavButton = ({ pageName, icon, label }) => (
    <button onClick={() => setActivePage(pageName)} className={`flex flex-col items-center justify-center w-24 p-2 rounded-lg transition-colors ${activePage === pageName ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col shadow-2xl bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200 text-center">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <ChefHat className="text-green-500 h-7 w-7 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white shadow-t-md sticky bottom-0 z-10 border-t border-gray-200">
        <div className="px-4 py-2 flex justify-around">
          <NavButton pageName="inventory" icon={<List size={24} />} label="Inventory" />
          <NavButton pageName="recipes" icon={<UtensilsCrossed size={24} />} label="Recipes" />
          <NavButton pageName="shopping-list" icon={<ShoppingCart size={24} />} label="To Buy" />
        </div>
      </nav>
    </div>
  );
}
