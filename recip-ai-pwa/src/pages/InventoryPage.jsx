import React, { useState } from 'react';
import { List, PlusCircle, Trash2, AlertCircle } from 'lucide-react';

export default function InventoryPage({ inventory, onAddItem, onDeleteItem }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateAndProcessInput = () => {
    const trimmedItemName = itemName.trim();

    // 1. Validate item name (must contain letters and at least one vowel)
    if (!/^[a-zA-Z\s]+$/.test(trimmedItemName) || !/[aeiouAEIOU]/.test(trimmedItemName) || trimmedItemName.length < 2) {
      setError('Please enter a valid item name.');
      return null;
    }

    // 2. Validate quantity
    let numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid, positive quantity.');
      return null;
    }

    // 3. Validate unit
    if (!unit) {
      setError('Please select a unit for your item.');
      return null;
    }

    // 4. Process and convert units to SI standards
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
    return {
        name: itemName.trim(),
        quantity: processedQuantity,
        unit: processedUnit
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedItem = validateAndProcessInput();
    
    if (processedItem) {
        onAddItem(processedItem);
        // Reset form
        setItemName('');
        setQuantity('');
        setUnit('');
        setError('');
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input 
            type="text" 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name" 
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2" 
            required 
          />
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty" 
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1" 
            required 
          />
          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 bg-white"
            required
          >
            <option value="">- Unit -</option>
            <optgroup label="Count">
              <option value="pcs">pcs</option>
              <option value="box">box</option>
              <option value="packet">packet</option>
            </optgroup>
            <optgroup label="Weight">
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lbs">lbs</option>
              <option value="oz">oz</option>
            </optgroup>
            <optgroup label="Volume">
              <option value="litre">litre</option>
              <option value="ml">ml</option>
            </optgroup>
          </select>
          <button type="submit" disabled={isValidating} className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow col-span-1 disabled:bg-gray-400">
            {isValidating ? <div className="animate-spin h-6 w-6 border-2 border-t-transparent border-white rounded-full"></div> : <PlusCircle size={24} />}
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
