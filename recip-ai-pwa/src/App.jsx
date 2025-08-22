import React, { useState, useEffect } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, User } from 'lucide-react';
import { supabase } from './supabaseClient';

import InventoryPage from './pages/InventoryPage';
import RecipePage from './pages/RecipePage';
import ShoppingListPage from './pages/ShoppingListPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

// --- Unit Conversion Helpers ---
const toBaseUnits = (quantity, unit) => {
    switch (unit) {
        case 'kg': return { value: quantity * 1000, baseUnit: 'g' };
        case 'g': return { value: quantity, baseUnit: 'g' };
        case 'lbs': return { value: quantity * 453.592, baseUnit: 'g' };
        case 'oz': return { value: quantity * 28.3495, baseUnit: 'g' };
        case 'litre': return { value: quantity * 1000, baseUnit: 'ml' };
        case 'ml': return { value: quantity, baseUnit: 'ml' };
        default: return { value: quantity, baseUnit: unit }; // For pcs, box, etc.
    }
};

const fromBaseUnits = (quantity, originalUnit) => {
    switch (originalUnit) {
        case 'kg': return quantity / 1000;
        case 'lbs': return quantity / 453.592;
        case 'oz': return quantity / 28.3495;
        case 'litre': return quantity / 1000;
        default: return quantity;
    }
};


export default function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unitSystem, setUnitSystem] = useState('metric');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setLoading(false);
        return;
      };
      setLoading(true);
      
      const { data: inventoryData } = await supabase.from('inventory').select('*').order('created_at');
      const { data: shoppingData } = await supabase.from('shopping_list').select('*').order('created_at');

      setInventory(inventoryData || []);
      setShoppingList(shoppingData || []);
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const addItemToInventory = async (item) => {
    const { data } = await supabase.from('inventory').insert([{ ...item, user_id: session.user.id, purchase_quantity: item.quantity }]).select();
    if (data) setInventory(prev => [...prev, data[0]]);
  };

  const deleteItemFromInventory = async (id) => {
    await supabase.from('inventory').delete().eq('id', id);
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleCookRecipe = async (recipe) => {
    try {
        const itemsToUpdate = [];
        const itemsToDeleteIds = [];
        const itemsToAddToShoppingList = [];

        for (const usedIng of recipe.ingredients) {
            const invItem = inventory.find(item => item.name.toLowerCase() === usedIng.name.toLowerCase());
            if (invItem) {
                const invBase = toBaseUnits(invItem.quantity, invItem.unit);
                const usedBase = toBaseUnits(usedIng.quantity, usedIng.unit);

                // Only perform subtraction if units are compatible
                if (invBase.baseUnit === usedBase.baseUnit) {
                    const newBaseQuantity = invBase.value - usedBase.value;
                    
                    if (newBaseQuantity <= 0) {
                        itemsToDeleteIds.push(invItem.id);
                        itemsToAddToShoppingList.push({
                            name: invItem.name,
                            quantity: invItem.purchase_quantity,
                            unit: invItem.unit,
                            purchase_quantity: invItem.purchase_quantity,
                            user_id: session.user.id
                        });
                    } else {
                        const newOriginalUnitQuantity = fromBaseUnits(newBaseQuantity, invItem.unit);
                        itemsToUpdate.push({ ...invItem, quantity: newOriginalUnitQuantity });
                    }
                }
            }
        }

        if (itemsToDeleteIds.length > 0) {
            await supabase.from('inventory').delete().in('id', itemsToDeleteIds);
        }
        if (itemsToAddToShoppingList.length > 0) {
            await supabase.from('shopping_list').insert(itemsToAddToShoppingList);
        }
        if (itemsToUpdate.length > 0) {
            await supabase.from('inventory').upsert(itemsToUpdate);
        }

        const { data: newInv } = await supabase.from('inventory').select('*');
        const { data: newShop } = await supabase.from('shopping_list').select('*');
        setInventory(newInv || []);
        setShoppingList(newShop || []);

    } catch (error) {
        console.error("Error processing recipe:", error);
    }
  };

  const handleBuyItem = async (item) => {
    await supabase.from('shopping_list').delete().eq('id', item.id);
    await supabase.from('inventory').insert([{ name: item.name, quantity: item.purchase_quantity, unit: item.unit, purchase_quantity: item.purchase_quantity, user_id: session.user.id }]);
    
    const { data: newInv } = await supabase.from('inventory').select('*');
    const { data: newShop } = await supabase.from('shopping_list').select('*');
    setInventory(newInv || []);
    setShoppingList(newShop || []);
  };

  if (!session) {
    return <AuthPage />;
  }

  const renderPage = () => {
    if (loading) return <div className="p-4 text-center">Loading...</div>;
    
    switch (activePage) {
      case 'inventory': return <InventoryPage inventory={inventory} onAddItem={addItemToInventory} onDeleteItem={deleteItemFromInventory} unitSystem={unitSystem} />;
      case 'recipes': return <RecipePage inventory={inventory} onCookRecipe={handleCookRecipe} />;
      case 'shopping-list': return <ShoppingListPage shoppingList={shoppingList} onBuyItem={handleBuyItem} />;
      case 'profile': return <ProfilePage session={session} unitSystem={unitSystem} onUnitSystemChange={setUnitSystem} />;
      default: return <InventoryPage inventory={inventory} onAddItem={addItemToInventory} onDeleteItem={deleteItemFromInventory} unitSystem={unitSystem} />;
    }
  };

  const NavButton = ({ pageName, icon, label }) => (
    <button onClick={() => setActivePage(pageName)} className={`flex flex-col items-center justify-center w-24 p-2 rounded-lg ${activePage === pageName ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}>
      {icon} <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col shadow-2xl bg-white">
      <header className="bg-white shadow-md sticky top-0 z-10 border-b text-center">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <ChefHat className="text-green-500 h-7 w-7 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">RECIP.AI</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-gray-50">{renderPage()}</main>
      <nav className="bg-white shadow-t-md sticky bottom-0 z-10 border-t">
        <div className="px-4 py-2 flex justify-around">
          <NavButton pageName="inventory" icon={<List size={24} />} label="Inventory" />
          <NavButton pageName="recipes" icon={<UtensilsCrossed size={24} />} label="Recipes" />
          <NavButton pageName="shopping-list" icon={<ShoppingCart size={24} />} label="To Buy" />
          <NavButton pageName="profile" icon={<User size={24} />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}
