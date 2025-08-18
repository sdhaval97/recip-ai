import React, { useState, useCallback, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { db, appId } from '../firebase.js';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { UtensilsCrossed, Sparkles, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// The page for generating and viewing recipes
export default function RecipePage() {
    const { userId, inventory, isAuthReady } = useContext(AppContext);
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preference, setPreference] = useState('surprise me');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    
    const fetchWithExponentialBackoff = useCallback(async (url, options, retries = 5, delay = 1000) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
                }
                throw new Error(`API Error: ${response.statusText}`);
            }
            return response.json();
        } catch (err) {
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay));
                return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
            }
            throw err;
        }
    }, []);

    const generateRecipes = useCallback(async () => {
        if (inventory.length < 2) {
            setError("Please add at least two items to your inventory to generate recipes.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecipes([]);

        const ingredientsList = inventory.map(item => `${item.quantity} ${item.unit} of ${item.name}`).join(', ');
        const prompt = `Based ONLY on the following available ingredients: ${ingredientsList}, generate 3 unique ${preference} recipe ideas. For each recipe, provide: 1. A 'recipeName' (string). 2. An 'ingredients' list (array of objects with name, quantity, unit). CRITICAL: For each ingredient in this list, the 'name' and 'unit' MUST EXACTLY MATCH one of the ingredients provided to you. You may use a smaller 'quantity', but the 'unit' must be identical. 3. A single string for 'instructions' with concise, step-by-step cooking directions, using '\\n' to separate steps.`;
        
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
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const result = await fetchWithExponentialBackoff(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const parsedRecipes = JSON.parse(result.candidates[0].content.parts[0].text);
                setRecipes(parsedRecipes);
            } else {
                throw new Error("Could not parse recipes from AI response.");
            }
        } catch (err) {
            console.error("Error generating recipes:", err);
            setError("Sorry, we couldn't generate recipes at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [inventory, preference, fetchWithExponentialBackoff]);
    
    const handleDoneCooking = async () => {
        if (!selectedRecipe || !userId || !isAuthReady) return;

        const batch = writeBatch(db);
        const shoppingListCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'shoppingList');

        for (const usedIngredient of selectedRecipe.ingredients) {
            const inventoryItem = inventory.find(item => 
                item.name.toLowerCase() === usedIngredient.name.toLowerCase() &&
                item.unit.toLowerCase() === usedIngredient.unit.toLowerCase()
            );

            if (inventoryItem) {
                const newQuantity = inventoryItem.quantity - usedIngredient.quantity;
                const itemDocRef = doc(db, 'artifacts', appId, 'users', userId, 'inventory', inventoryItem.id);

                if (newQuantity <= 0.001) {
                    batch.delete(itemDocRef);
                    const newShopDocRef = doc(shoppingListCollectionRef);
                    batch.set(newShopDocRef, { 
                        name: inventoryItem.name, 
                        quantity: inventoryItem.purchaseQuantity, 
                        unit: inventoryItem.unit 
                    });
                } else {
                    batch.update(itemDocRef, { quantity: newQuantity });
                }
            } else {
                console.warn(`Could not find matching inventory item for recipe ingredient: "${usedIngredient.quantity} ${usedIngredient.unit} of ${usedIngredient.name}".`);
            }
        }

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error updating lists: ", error);
        }
        
        setRecipes([]);
        setSelectedRecipe(null);
    };

    if (selectedRecipe) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-4 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Recipes
                </button>
                <h3 className="text-3xl font-bold text-green-700 capitalize mb-4">{selectedRecipe.recipeName}</h3>
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Ingredients you'll use:</h4>
                    <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
                        {selectedRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="text-gray-800 capitalize">{ing.quantity} {ing.unit} {ing.name}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Instructions:</h4>
                    <div className="text-gray-700 bg-gray-50 p-4 rounded-md space-y-3 prose">
                        {selectedRecipe.instructions.split('\n').map((step, i) => (
                           step.trim() && <p key={i}>{step}</p>
                        ))}
                    </div>
                </div>
                <p className="text-sm text-gray-500 my-6 text-center">When you're done, we'll update your inventory and shopping list automatically.</p>
                <button onClick={handleDoneCooking} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors shadow-md">
                    I'm Done Cooking!
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <select value={preference} onChange={(e) => setPreference(e.target.value)} className="w-full sm:w-auto flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="surprise me">Surprise Me</option>
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                    </select>
                    <button onClick={generateRecipes} disabled={isLoading || inventory.length < 2} className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow">
                        <Sparkles size={20} />
                        <span>Generate Recipes</span>
                    </button>
                </div>
                {inventory.length < 2 && <p className="text-center text-sm text-yellow-700 mt-3 bg-yellow-100 p-2 rounded-md">Add at least 2 items to your inventory to find recipes.</p>}
            </div>

            {isLoading && <LoadingSpinner message="Finding delicious recipes..." />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {recipes.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center text-gray-700">Here are some ideas!</h3>
                    {recipes.map((recipe, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-lg font-bold text-green-700 capitalize">{recipe.recipeName}</h4>
                            <p className="text-sm text-gray-500 mt-2 mb-3">Uses:</p>
                            <ul className="flex flex-wrap gap-2">
                                {recipe.ingredients.map((ing, i) => (
                                    <li key={i} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{ing.quantity} {ing.unit} {ing.name}</li>
                                ))}
                            </ul>
                            <button onClick={() => setSelectedRecipe(recipe)} className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                                Cook This
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {recipes.length === 0 && !isLoading && !error && (
                 <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Ready to cook?</h3>
                    <p className="mt-1 text-gray-500">Select a preference and click "Generate Recipes" to find meals you can make with your ingredients.</p>
                </div>
            )}
        </div>
    );
}
