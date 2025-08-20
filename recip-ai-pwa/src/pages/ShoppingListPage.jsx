import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function ShoppingListPage({ shoppingList, onBuyItem }) {
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
