import React, { useState, useEffect } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, PlusCircle, Trash2, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

// Import the page components with the correct file extension
import InventoryPage from './pages/InventoryPage.jsx';
import RecipePage from './pages/RecipePage.jsx';
import ShoppingListPage from './pages/ShoppingListPage.jsx';


// --- Main App Component ---

export default function App() {
  const [activePage, setActivePage] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch all data from Supabase when the app starts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: inventoryData, error: inventoryError } = await supabase.from('inventory').select('*').order('created_at');
      const { data: shoppingData, error: shoppingError } = await supabase.from('shopping_list').select('*').order('created_at');

      if (inventoryError) console.error('Error fetching inventory:', inventoryError);
      else setInventory(inventoryData || []);

      if (shoppingError) console.error('Error fetching shopping list:', shoppingError);
      else setShoppingList(shoppingData || []);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const addItemToInventory = async (item) => {
    const { data, error } = await supabase.from('inventory').insert([{ name: item.name, quantity: item.quantity, unit: item.unit, purchase_quantity: item.quantity }]).select();
    if (error) console.error('Error adding item:', error);
    else if (data) setInventory(prev => [...prev, data[0]]);
  };

  const deleteItemFromInventory = async (id) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) console.error('Error deleting item:', error);
    else setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleCookRecipe = async (recipe) => {
    const itemsToUpdate = [];
    const itemsToMove = [];
    
    recipe.ingredients.forEach(usedIng => {
      const invItem = inventory.find(item => item.name.toLowerCase() === usedIng.name.toLowerCase());
      if (invItem) {
        const newQuantity = invItem.quantity - usedIng.quantity;
        if (newQuantity <= 0) {
          itemsToMove.push(invItem);
        } else {
          itemsToUpdate.push({ ...invItem, quantity: newQuantity });
        }
      }
    });

    // Move used up items to shopping list
    if (itemsToMove.length > 0) {
      await supabase.from('inventory').delete().in('id', itemsToMove.map(i => i.id));
      await supabase.from('shopping_list').insert(itemsToMove.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit, purchase_quantity: i.purchase_quantity })));
    }

    // Update quantities for partially used items
    if (itemsToUpdate.length > 0) {
      await supabase.from('inventory').upsert(itemsToUpdate);
    }

    // Refresh local state from database to ensure consistency
    const { data: newInventory } = await supabase.from('inventory').select('*');
    const { data: newShoppingList } = await supabase.from('shopping_list').select('*');
    setInventory(newInventory || []);
    setShoppingList(newShoppingList || []);
  };

  const handleBuyItem = async (item) => {
    // Remove from shopping list
    await supabase.from('shopping_list').delete().eq('id', item.id);
    
    // Add back to inventory
    await supabase.from('inventory').insert([{ name: item.name, quantity: item.purchase_quantity, unit: item.unit, purchase_quantity: item.purchase_quantity }]);

    // Refresh local state
    const { data: newInventory } = await supabase.from('inventory').select('*');
    const { data: newShoppingList } = await supabase.from('shopping_list').select('*');
    setInventory(newInventory || []);
    setShoppingList(newShoppingList || []);
  };

  const renderPage = () => {
    if (loading) {
      return <div className="p-4 text-center text-gray-500">Loading your kitchen...</div>;
    }
    
    switch (activePage) {
      case 'inventory':
        return <InventoryPage inventory={inventory} onAddItem={addItemToInventory} onDeleteItem={deleteItemFromInventory} />;
      case 'recipes':
        return <RecipePage inventory={inventory} onCookRecipe={handleCookRecipe} />;
      case 'shopping-list':
        return <ShoppingListPage shoppingList={shoppingList} onBuyItem={handleBuyItem} />;
      default:
        return <InventoryPage inventory={inventory} onAddItem={addItemToInventory} onDeleteItem={deleteItemFromInventory} />;
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
      <header className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200 text-center">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <ChefHat className="text-green-500 h-7 w-7 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-gray-50">
        {renderPage()}
      </main>
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
