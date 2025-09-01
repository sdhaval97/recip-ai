import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, RefreshCw, ArrowLeft, Heart, Leaf, Beef } from 'lucide-react';

export default function RecipePage({ inventory, onCookRecipe, onSaveRecipe, generatedRecipes, setGeneratedRecipes }) {
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
    setGeneratedRecipes([]);

    let finalPreference = preference;
    if (preference === 'non-veg' && !hasNonVegIngredients()) {
        finalPreference = 'veg';
    }

    const ingredientsList = inventory.map(item => `${item.quantity} ${item.unit || ''} of ${item.name}`).join(', ');
    const cuisineText = cuisine === 'any' ? '' : `${cuisine} `;
    const prompt = `You are a helpful chef. Based on the following ingredients I have: ${ingredientsList}, generate 3 unique ${finalPreference} ${cuisineText}recipe ideas portioned for one person. Assume I have basic pantry staples like salt, pepper, and oil. For each recipe, provide: 1. A 'recipeName' (string). 2. An 'ingredients' list (array of objects with name, quantity, unit) using ONLY the main ingredients from my list. 3. A single string for 'instructions' with concise, step-by-step cooking directions, separating each step with a period (.). 4. A boolean value 'isVegetarian'.`;

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
              instructions: { type: "STRING" },
              isVegetarian: { type: "BOOLEAN" }
            },
            required: ["recipeName", "ingredients", "instructions", "isVegetarian"]
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
        setGeneratedRecipes(parsedRecipes);
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
  };

  const handleSaveRecipe = () => {
    onSaveRecipe(selectedRecipe);
    alert('Recipe saved!');
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
          <div className="flex gap-4 mt-6">
            <button onClick={handleSaveRecipe} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
              <Heart size={20} /> Save Recipe
            </button>
            <button onClick={handleDoneCooking} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600">
              I'm Done Cooking!
            </button>
          </div>
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

      {generatedRecipes.length > 0 ? (
        <div className="space-y-4">
          {generatedRecipes.map((recipe, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-green-700 capitalize">{recipe.recipeName}</h4>
                {recipe.isVegetarian ? <Leaf size={20} className="text-green-500" /> : <Beef size={20} className="text-red-500" />}
              </div>
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

