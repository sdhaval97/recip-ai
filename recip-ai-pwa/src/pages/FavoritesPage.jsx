import React, { useState, useMemo } from 'react';
import { Heart, Trash2, ArrowLeft, Leaf, Beef } from 'lucide-react';

export default function FavoritesPage({ savedRecipes, onDeleteFavorite }) {
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'veg', 'non-veg'

  const filteredRecipes = useMemo(() => {
    if (filter === 'veg') {
      return savedRecipes.filter(recipe => recipe.is_vegetarian);
    }
    if (filter === 'non-veg') {
      return savedRecipes.filter(recipe => !recipe.is_vegetarian);
    }
    return savedRecipes;
  }, [savedRecipes, filter]);

  if (selectedFavorite) {
    return (
      <div className="p-4 animate-fade-in">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <button onClick={() => setSelectedFavorite(null)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-4">
            <ArrowLeft size={16} /> Back to Favorites
          </button>
          <h3 className="text-3xl font-bold text-green-700 capitalize mb-4">{selectedFavorite.recipe_name}</h3>
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md space-y-1">
              {selectedFavorite.ingredients.map((ing, i) => (
                <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside bg-gray-50 p-4 rounded-md space-y-1">
                {selectedFavorite.instructions.split('.').filter(sentence => sentence.trim()).map((sentence, i) => (
                    <li key={i}>{sentence.trim()}.</li>
                ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-center rounded-lg border border-gray-300">
        <button onClick={() => setFilter('all')} className={`flex-1 p-2 text-sm font-semibold transition-colors rounded-l-md ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
        <button onClick={() => setFilter('veg')} className={`flex-1 p-2 text-sm font-semibold transition-colors border-l border-r ${filter === 'veg' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Veg</button>
        <button onClick={() => setFilter('non-veg')} className={`flex-1 p-2 text-sm font-semibold transition-colors rounded-r-md ${filter === 'non-veg' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Non-Veg</button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">No Saved Recipes</h3>
          <p className="mt-1 text-gray-500">You can save recipes from the Recipe Finder page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
              <button onClick={() => setSelectedFavorite(recipe)} className="flex-grow text-left flex items-center">
                {recipe.is_vegetarian ? <Leaf size={20} className="text-green-500 mr-3" /> : <Beef size={20} className="text-red-500 mr-3" />}
                <h4 className="font-bold text-gray-800 capitalize">{recipe.recipe_name}</h4>
              </button>
              <button onClick={() => onDeleteFavorite(recipe.id)} className="text-red-500 hover:text-red-700 ml-4 p-2 rounded-full hover:bg-red-100">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
