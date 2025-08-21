import React, { useState, useEffect } from 'react';
import { ChefHat, List, UtensilsCrossed, ShoppingCart, User, PlusCircle, Trash2, AlertCircle, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

// --- Page Components ---

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (isSigningUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Success! Please check your email to verify your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50">
        <div className="flex items-center justify-center mb-6">
            <ChefHat className="text-green-500 h-10 w-10 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">RECIP.AI</h1>
        </div>
        <p className="text-gray-600 mb-8 text-center">
          {isSigningUp ? 'Create a new account' : 'Sign in to your account'}
        </p>
        <form onSubmit={handleAuthAction} className="w-full max-w-sm">
            <input
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
                type="password"
                placeholder="Your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
                {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
            </button>
        </form>
        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="mt-4 text-sm text-gray-600 hover:underline"
        >
          {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}

function ProfilePage({ session, unitSystem, onUnitSystemChange }) {
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

function InventoryPage({ inventory, onAddItem, onDeleteItem, unitSystem }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');

  const validateAndProcessInput = () => {
    const trimmedItemName = itemName.trim();
    if (!/^[a-zA-Z\s]+$/.test(trimmedItemName) || !/[aeiouAEIOU]/.test(trimmedItemName) || trimmedItemName.length < 2) {
      setError('Please enter a valid item name.');
      return null;
    }
    let numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid, positive quantity.');
      return null;
    }
    if (!unit) {
      setError('Please select a unit for your item.');
      return null;
    }
    
    let processedQuantity = numQuantity;
    let processedUnit = unit;
    if (unit === 'g' && numQuantity >= 1000) {
        processedQuantity = numQuantity / 1000;
        processedUnit = 'kg';
    } else if (unit === 'ml' && numQuantity >= 1000) {
        processedQuantity = numQuantity / 1000;
        processedUnit = 'litre';
    } else if (unit === 'lbs') {
        processedQuantity = numQuantity * 0.453592;
        processedUnit = 'kg';
    } else if (unit === 'oz') {
        processedQuantity = numQuantity * 28.3495;
        processedUnit = 'g';
    }

    setError('');
    return { name: trimmedItemName, quantity: processedQuantity, unit: processedUnit };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedItem = validateAndProcessInput();
    if (processedItem) {
      onAddItem(processedItem);
      setItemName('');
      setQuantity('');
      setUnit('');
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item name" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2" required />
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1" required />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 bg-white" required>
            <option value="">- Unit -</option>
            <optgroup label="Count">
              <option value="pcs">pcs</option>
              <option value="box">box</option>
              <option value="packet">packet</option>
            </optgroup>
            {unitSystem === 'metric' ? (
              <optgroup label="Metric">
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="litre">litre</option>
                <option value="ml">ml</option>
              </optgroup>
            ) : (
              <optgroup label="Imperial">
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
                <option value="gallon">gallon</option>
                <option value="cup">cup</option>
              </optgroup>
            )}
          </select>
          <button type="submit" className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center shadow col-span-1">
            <PlusCircle size={24} />
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} className="mr-2"/>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
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

function RecipePage({ inventory, onCookRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preference, setPreference] = useState('surprise me');
  const [cuisine, setCuisine] = useState('any');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const hasNonVegIngredients = () => {
    const nonVegKeywords = ['chicken', 'meat', 'beef', 'pork', 'fish', 'prawns', 'shrimp', 'lamb', 'egg', 'eggs'];
    return inventory.some(item => nonVegKeywords.some(keyword => item.name.toLowerCase().includes(keyword)));
  };

  const generateRecipes = async () => {
    if (inventory.length < 2) {
      setError("Add at least 2 items to your inventory to find recipes.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    let finalPreference = preference;
    if (preference === 'non-veg' && !hasNonVegIngredients()) {
        finalPreference = 'veg';
    }

    const ingredientsList = inventory.map(item => `${item.quantity} ${item.unit || ''} of ${item.name}`).join(', ');
    const cuisineText = cuisine === 'any' ? '' : `${cuisine} `;
    const prompt = `You are a helpful chef. Based on the following ingredients I have: ${ingredientsList}, generate 3 unique ${finalPreference} ${cuisineText}recipe ideas portioned for one person. Assume I have basic pantry staples like salt, pepper, and oil. For each recipe, provide: 1. A 'recipeName' (string). 2. An 'ingredients' list (array of objects with name, quantity, unit) using ONLY the main ingredients from my list. 3. A single string for 'instructions' with concise, step-by-step cooking directions, separating each step with a period (.).`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              recipeName: { type: "STRING" },
              ingredients: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    quantity: { type: "NUMBER" },
                    unit: { type: "STRING" }
                  },
                  required: ["name", "quantity", "unit"]
                }
              },
              instructions: { type: "STRING" }
            },
            required: ["recipeName", "ingredients", "instructions"]
          }
        }
      }
    };

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key is missing. Please check your .env file.");

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const result = await response.json();
      if (result.candidates && result.candidates[0].content.parts[0].text) {
        const parsedRecipes = JSON.parse(result.candidates[0].content.parts[0].text);
        setRecipes(parsedRecipes);
      } else {
        throw new Error("Could not parse recipes from AI response.");
      }
    } catch (err) {
      console.error("Error generating recipes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoneCooking = () => {
    onCookRecipe(selectedRecipe);
    setSelectedRecipe(null);
    setRecipes([]);
  };

  if (selectedRecipe) {
    return (
      <div className="p-4 animate-fade-in">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-4">
            <ArrowLeft size={16} /> Back to Recipes
          </button>
          <h3 className="text-3xl font-bold text-green-700 capitalize mb-4">{selectedRecipe.recipeName}</h3>
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
              {selectedRecipe.ingredients.map((ing, i) => (
                <li key={i} className="text-gray-800 capitalize">{ing.quantity} {ing.unit} {ing.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Instructions:</h4>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-2">
              {selectedRecipe.instructions.split('.').filter(sentence => sentence.trim()).map((sentence, i) => (
                <li key={i}>{sentence.trim()}.</li>
              ))}
            </ul>
          </div>
          <button onClick={handleDoneCooking} className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600">
            I'm Done Cooking!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select value={preference} onChange={(e) => setPreference(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            <option value="surprise me">Surprise Me</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            <option value="any">Any Cuisine</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Thai">Thai</option>
            <option value="Mediterranean">Mediterranean</option>
          </select>
        </div>
        <button onClick={generateRecipes} disabled={isLoading || inventory.length < 2} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 disabled:bg-gray-400">
          {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div> : <Sparkles size={20} />}
          <span>{isLoading ? 'Generating...' : 'Generate Recipes'}</span>
        </button>
        {inventory.length < 2 && <p className="text-center text-sm text-yellow-700 mt-3 bg-yellow-100 p-2 rounded-md">Add at least 2 items to your inventory to find recipes.</p>}
      </div>
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {recipes.length > 0 ? (
        <div className="space-y-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-bold text-green-700 capitalize">{recipe.recipeName}</h4>
              <p className="text-sm text-gray-500 mt-2 mb-3">Uses:</p>
              <ul className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{ing.name}</li>
                ))}
              </ul>
              <button onClick={() => setSelectedRecipe(recipe)} className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600">
                Cook This
              </button>
            </div>
          ))}
          <button onClick={generateRecipes} disabled={isLoading} className="mt-6 w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2">
            <RefreshCw size={20} /> Try Again
          </button>
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">Ready to cook?</h3>
          <p className="mt-1 text-gray-500">Generate recipes based on your inventory.</p>
        </div>
      )}
    </div>
  );
}

function ShoppingListPage({ shoppingList, onBuyItem }) {
  return (
    <div className="p-4">
      {shoppingList.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">Shopping list is empty</h3>
          <p className="mt-1 text-gray-500">Used ingredients will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shoppingList.map(item => (
            <li key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <input 
                type="checkbox" 
                id={`item-${item.id}`} 
                onChange={() => onBuyItem(item)}
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 mr-4"
              />
              <label htmlFor={`item-${item.id}`} className="flex-grow">
                <span className="font-bold capitalize">{item.name}</span>
                <span className="text-gray-500 text-sm ml-2">{item.purchase_quantity} {item.unit}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// --- Main App Component ---

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
                const newQuantity = invItem.quantity - usedIng.quantity;
                if (newQuantity <= 0) {
                    itemsToDeleteIds.push(invItem.id);
                    itemsToAddToShoppingList.push({
                        name: invItem.name,
                        quantity: invItem.purchase_quantity,
                        unit: invItem.unit,
                        purchase_quantity: invItem.purchase_quantity,
                        user_id: session.user.id
                    });
                } else {
                    itemsToUpdate.push({ ...invItem, quantity: newQuantity });
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
