import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, User, Heart } from 'lucide-react';
import { supabase } from './supabaseClient';

import InventoryPage from './pages/InventoryPage';
import RecipePage from './pages/RecipePage';
import ShoppingListPage from './pages/ShoppingListPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';

// --- Unit Conversion Helper ---
const CONVERSIONS = {
    g: 1, kg: 1000, lbs: 453.592, oz: 28.35,
    ml: 1, litre: 1000,
    pcs: 1, box: 1, packet: 1,
};

const convertToBaseUnit = (quantity, unit) => {
    return quantity * (CONVERSIONS[unit] || 1);
};

export default function App() {
    const [session, setSession] = useState(null);
    const [page, setPage] = useState('inventory');
    const [inventory, setInventory] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
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

    const fetchData = useCallback(async () => {
        if (!session) return;

        const fetchInventory = async () => {
            const { data, error } = await supabase.from('inventory').select('*');
            if (error) console.error('Error fetching inventory:', error);
            else setInventory(data);
        };

        const fetchShoppingList = async () => {
            const { data, error } = await supabase.from('shopping_list').select('*');
            if (error) console.error('Error fetching shopping list:', error);
            else setShoppingList(data);
        };

        const fetchSavedRecipes = async () => {
            const { data, error } = await supabase.from('saved_recipes').select('*');
            if (error) console.error('Error fetching saved recipes:', error);
            else setSavedRecipes(data);
        };

        fetchInventory();
        fetchShoppingList();
        fetchSavedRecipes();
    }, [session]);

    useEffect(() => {
        fetchData();
    }, [session, fetchData]);

    const addItemToInventory = async (item) => {
        const { data, error } = await supabase
            .from('inventory')
            .insert([item])
            .select();
        if (error) {
            console.error('Error adding item:', error);
        } else if (data) {
            setInventory(prev => [...prev, ...data]);
        }
    };

    const deleteItemFromInventory = async (id) => {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) {
            console.error('Error deleting item:', error);
        } else {
            setInventory(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleUpdateItemQuantity = async (id, newQuantity) => {
        const { data, error } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating item quantity:', error);
        } else if (data) {
            setInventory(prevInventory =>
                prevInventory.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const handleSaveRecipe = async (recipe) => {
        if (!session) {
            alert('You must be logged in to save recipes.');
            return;
        }
        const { data, error } = await supabase
            .from('saved_recipes')
            .insert([{ ...recipe, user_id: session.user.id }])
            .select();

        if (error) {
            console.error('Error saving recipe:', error);
            alert('Could not save recipe. Please try again.');
        } else if (data) {
            setSavedRecipes(prev => [...prev, ...data]);
            alert('Recipe saved!');
        }
    };
    
    const handleDeleteRecipe = async (id) => {
        const { error } = await supabase.from('saved_recipes').delete().eq('id', id);
        if (error) {
            console.error('Error deleting recipe:', error);
        } else {
            setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
        }
    };

    const handleCookRecipe = async (recipe) => {
        const inventoryUpdates = [];
        const itemsToDeleteFromInventory = [];
        const itemsToAddToShoppingList = [];

        for (const usedIngredient of recipe.ingredients) {
            const inventoryItem = inventory.find(item => item.name.toLowerCase() === usedIngredient.name.toLowerCase());

            if (inventoryItem) {
                const usedAmountBase = convertToBaseUnit(usedIngredient.quantity, usedIngredient.unit);
                const inventoryAmountBase = convertToBaseUnit(inventoryItem.quantity, inventoryItem.unit);
                const newQuantityBase = inventoryAmountBase - usedAmountBase;

                if (newQuantityBase <= 0) {
                    itemsToDeleteFromInventory.push(inventoryItem.id);
                    itemsToAddToShoppingList.push({
                        name: inventoryItem.name,
                        quantity: inventoryItem.purchase_quantity,
                        unit: inventoryItem.unit,
                        purchase_quantity: inventoryItem.purchase_quantity,
                        user_id: session.user.id
                    });
                } else {
                    const newQuantityOriginalUnit = newQuantityBase / (CONVERSIONS[inventoryItem.unit] || 1);
                    inventoryUpdates.push({ ...inventoryItem, quantity: newQuantityOriginalUnit });
                }
            }
        }

        // Batch updates to Supabase
        const { error: updateError } = await supabase.from('inventory').upsert(inventoryUpdates);
        const { error: deleteError } = await supabase.from('inventory').delete().in('id', itemsToDeleteFromInventory);
        const { error: addError } = await supabase.from('shopping_list').insert(itemsToAddToShoppingList);

        if (updateError || deleteError || addError) {
            console.error({ updateError, deleteError, addError });
            alert('There was an error updating your lists.');
        } else {
            fetchData(); // Re-fetch all data to ensure UI is in sync
        }
    };

    const handleClearShoppingList = async () => {
        const { error } = await supabase.from('shopping_list').delete().eq('user_id', session.user.id);
        if (error) console.error('Error clearing shopping list:', error);
        else setShoppingList([]);
    };

    const handleBuyItem = async (item) => {
        const { error: deleteError } = await supabase.from('shopping_list').delete().eq('id', item.id);
        if (deleteError) {
            console.error('Error removing item from shopping list:', deleteError);
            return;
        }

        const { error: addError } = await supabase.from('inventory').insert([{
            name: item.name,
            quantity: item.purchase_quantity,
            unit: item.unit,
            purchase_quantity: item.purchase_quantity,
            user_id: session.user.id
        }]);
        
        if (addError) console.error('Error adding item to inventory:', addError);
        else fetchData();
    };

    if (!session) {
        return <AuthPage />;
    }

    const renderPage = () => {
        switch (page) {
            case 'inventory':
                return <InventoryPage
                    inventory={inventory}
                    onAddItem={addItemToInventory}
                    onDeleteItem={deleteItemFromInventory}
                    onUpdateItem={handleUpdateItemQuantity}
                    unitSystem={unitSystem}
                />;
            case 'recipe':
                return <RecipePage
                    inventory={inventory}
                    onCookRecipe={handleCookRecipe}
                    onSaveRecipe={handleSaveRecipe}
                    savedRecipes={savedRecipes}
                    generatedRecipes={generatedRecipes}
                    setGeneratedRecipes={setGeneratedRecipes}
                />;
            case 'to-buy':
                return <ShoppingListPage
                    shoppingList={shoppingList}
                    onClearList={handleClearShoppingList}
                    onBuyItem={handleBuyItem}
                />;
            case 'favorites':
                return <FavoritesPage
                    savedRecipes={savedRecipes}
                    onDeleteRecipe={handleDeleteRecipe}
                />;
            case 'profile':
                return <ProfilePage
                    session={session}
                    unitSystem={unitSystem}
                    setUnitSystem={setUnitSystem}
                />;
            default:
                return <InventoryPage inventory={inventory} onAddItem={addItemToInventory} onDeleteItem={deleteItemFromInventory} />;
        }
    };

    const navItems = [
        { id: 'inventory', icon: List, label: 'Inventory' },
        { id: 'recipe', icon: UtensilsCrossed, label: 'Recipes' },
        { id: 'to-buy', icon: ShoppingCart, label: 'To Buy' },
        { id: 'favorites', icon: Heart, label: 'Favorites' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col max-w-lg mx-auto shadow-2xl">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="px-4 py-4 flex items-center justify-center">
                    <ChefHat className="text-green-500 h-8 w-8 mr-3" />
                    <h1 className="text-2xl font-bold text-gray-700 tracking-tight">RECIP.AI</h1>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-6 lg:p-8">
                {renderPage()}
            </main>

            <nav className="bg-white shadow-t-md sticky bottom-0 z-10 border-t border-gray-200">
                <div className="px-2 py-2 flex justify-around">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setPage(item.id)}
                            className={`flex flex-col items-center justify-center w-20 p-2 rounded-lg transition-colors duration-200 ${
                                page === item.id ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            <item.icon className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}

