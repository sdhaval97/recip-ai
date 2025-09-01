import React, { useState, useEffect } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, User, Heart } from 'lucide-react';
import { supabase } from './supabaseClient';

import InventoryPage from './pages/InventoryPage';
import RecipePage from './pages/RecipePage';
import ShoppingListPage from './pages/ShoppingListPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';

// --- Unit Conversion Logic ---
const conversionRates = {
  // Weight (base: g)
  g: 1,
  kg: 1000,
  lbs: 453.592,
  oz: 28.35,
  // Volume (base: ml)
  ml: 1,
  litre: 1000,
  // Count (base: pcs)
  pcs: 1,
  box: 1,
  packet: 1,
};

const unitToBase = {
    g: 'g', kg: 'g', lbs: 'g', oz: 'g',
    ml: 'ml', litre: 'ml',
    pcs: 'pcs', box: 'pcs', packet: 'pcs',
};

const convertToBaseUnit = (quantity, unit) => {
    if (!unit || !conversionRates[unit]) return { quantity, baseUnit: unit || 'pcs' };
    const baseUnit = unitToBase[unit];
    const convertedQuantity = quantity * conversionRates[unit];
    return { quantity: convertedQuantity, baseUnit };
};

export default function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
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
      const { data: savedRecipesData } = await supabase.from('saved_recipes').select('*').order('created_at');

      setInventory(inventoryData || []);
      setShoppingList(shoppingData || []);
      setSavedRecipes(savedRecipesData || []);
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

  const handleSaveRecipe = async (recipe) => {
    const { data, error } = await supabase.from('saved_recipes').insert([{
      user_id: session.user.id,
      recipe_name: recipe.recipeName,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      is_vegetarian: recipe.isVegetarian
    }]).select();

    if (error) {
      console.error("Error saving recipe:", error);
      throw error; // Re-throw the error to be caught by the caller
    } else if (data) {
      setSavedRecipes(prev => [...prev, data[0]]);
    }
  };

  const handleDeleteFavorite = async (id) => {
    await supabase.from('saved_recipes').delete().eq('id', id);
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  const handleCookRecipe = async (recipe) => {
    try {
      const inventoryUpdates = [];
      const inventoryDeletions = [];
      const shoppingListAdditions = [];

      for (const usedIng of recipe.ingredients) {
        const invItem = inventory.find(item => item.name.toLowerCase() === usedIng.name.toLowerCase());
        if (invItem) {
          const invInBase = convertToBaseUnit(invItem.quantity, invItem.unit);
          const usedInBase = convertToBaseUnit(usedIng.quantity, usedIng.unit);

          if (invInBase.baseUnit === usedInBase.baseUnit) {
            const remainingInBase = invInBase.quantity - usedInBase.quantity;

            if (remainingInBase <= 0.001) {
              inventoryDeletions.push(invItem.id);
              if (!shoppingList.find(shopItem => shopItem.name.toLowerCase() === invItem.name.toLowerCase())) {
                  shoppingListAdditions.push({
                    name: invItem.name,
                    quantity: invItem.purchase_quantity,
                    unit: invItem.unit,
                    purchase_quantity: invItem.purchase_quantity,
                    user_id: session.user.id
                  });
              }
            } else {
              const remainingInOriginalUnit = remainingInBase / (conversionRates[invItem.unit] || 1);
              inventoryUpdates.push({ ...invItem, quantity: remainingInOriginalUnit });
            }
          } else {
            console.warn(`Unit mismatch for ${invItem.name}: Inventory has ${invItem.unit}, recipe uses ${usedIng.unit}. Skipping.`);
          }
        }
      }

      if (inventoryDeletions.length > 0) {
        await supabase.from('inventory').delete().in('id', inventoryDeletions);
      }
      if (shoppingListAdditions.length > 0) {
        await supabase.from('shopping_list').insert(shoppingListAdditions);
      }
      if (inventoryUpdates.length > 0) {
        await supabase.from('inventory').upsert(inventoryUpdates);
      }

      const { data: newInv } = await supabase.from('inventory').select('*');
      const { data: newShop } = await supabase.from('shopping_list').select('*');
      setInventory(newInv || []);
      setShoppingList(newShop || []);
      setGeneratedRecipes([]);

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
      case 'recipes': return <RecipePage inventory={inventory} onCookRecipe={handleCookRecipe} onSaveRecipe={handleSaveRecipe} generatedRecipes={generatedRecipes} setGeneratedRecipes={setGeneratedRecipes} savedRecipes={savedRecipes} />;
      case 'shopping-list': return <ShoppingListPage shoppingList={shoppingList} onBuyItem={handleBuyItem} />;
      case 'favorites': return <FavoritesPage savedRecipes={savedRecipes} onDeleteFavorite={handleDeleteFavorite} />;
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
          <NavButton pageName="favorites" icon={<Heart size={24} />} label="Favorites" />
          <NavButton pageName="shopping-list" icon={<ShoppingCart size={24} />} label="To Buy" />
          <NavButton pageName="profile" icon={<User size={24} />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

