import React from 'react';
import { Heart, Trash2 } from 'lucide-react';

export default function FavoritesPage({ savedRecipes, onDeleteFavorite }) {
  return (
    <div className="p-4">
      {savedRecipes.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">No Saved Recipes</h3>
          <p className="mt-1 text-gray-500">You can save recipes from the Recipe Finder page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-green-700 capitalize mb-2">{recipe.recipe_name}</h4>
                <button onClick={() => onDeleteFavorite(recipe.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="mb-4">
                <h5 className="font-semibold text-sm text-gray-600 mb-1">Ingredients:</h5>
                <ul className="list-disc list-inside text-sm text-gray-500">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-sm text-gray-600 mb-1">Instructions:</h5>
                <ol className="list-decimal list-inside text-sm text-gray-500 space-y-1">
                    {recipe.instructions.split('.').filter(sentence => sentence.trim()).map((sentence, i) => (
                        <li key={i}>{sentence.trim()}.</li>
                    ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
