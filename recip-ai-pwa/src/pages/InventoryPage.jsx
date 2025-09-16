import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Save, X, List } from 'lucide-react';

const METRIC_UNITS = {
    Weight: ['g', 'kg'],
    Volume: ['ml', 'litre'],
    Count: ['pcs', 'box', 'packet'],
};
const IMPERIAL_UNITS = {
    Weight: ['oz', 'lbs'],
    Volume: ['fl oz', 'cup', 'pint', 'quart', 'gallon'],
    Count: ['pcs', 'box', 'packet'],
};

export default function InventoryPage({ inventory, onAddItem, onDeleteItem, onUpdateItem, unitSystem }) {
    const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });
    const [error, setError] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingQuantity, setEditingQuantity] = useState('');

    const currentUnits = unitSystem === 'metric' ? METRIC_UNITS : IMPERIAL_UNITS;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const validateItem = (name, quantity) => {
        if (!/.*[a-zA-Z].*/.test(name) || !/.*[aeiouAEIOU].*/.test(name)) {
            return "Please enter a valid item name.";
        }
        if (quantity <= 0) {
            return "Quantity must be a positive number.";
        }
        if (quantity > 10000) {
            return "Quantity seems too high. Please check the value.";
        }
        return '';
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const quantity = parseFloat(newItem.quantity);
        
        const validationError = validateItem(newItem.name, quantity);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (newItem.unit === '') {
            setError('Please select a unit for the item.');
            return;
        }

        setError('');

        const itemToAdd = {
            name: newItem.name.trim().toLowerCase(),
            quantity,
            unit: newItem.unit,
            purchase_quantity: quantity,
        };

        onAddItem(itemToAdd);
        setNewItem({ name: '', quantity: '', unit: '' });
    };

    const handleEditClick = (item) => {
        setEditingItemId(item.id);
        setEditingQuantity(item.quantity);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingQuantity('');
    };

    const handleSaveEdit = (itemId) => {
        const newQuantity = parseFloat(editingQuantity);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            onUpdateItem(itemId, newQuantity);
            setEditingItemId(null);
            setEditingQuantity('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleAddItem} className="p-4 bg-gray-100 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <input
                        type="text" name="name" value={newItem.name} onChange={handleInputChange}
                        placeholder="Item name (e.g., Chicken)"
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2"
                        required
                    />
                    <input
                        type="number" name="quantity" value={newItem.quantity} onChange={handleInputChange}
                        placeholder="Qty"
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        step="0.1"
                        required
                    />
                    <select
                        name="unit" value={newItem.unit} onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                        required
                    >
                        <option value="">- Unit -</option>
                        {Object.entries(currentUnits).map(([group, units]) => (
                            <optgroup label={group} key={group}>
                                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <button type="submit" className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow">
                        <PlusCircle size={24} />
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </form>

            {inventory.length === 0 ? (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                    <List className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Your inventory is empty</h3>
                    <p className="mt-1 text-gray-500">Add some items you have at home to get started.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {inventory.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex-grow">
                                <span className="text-gray-800 font-bold capitalize">{item.name}</span>
                                {editingItemId === item.id ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="number"
                                            value={editingQuantity}
                                            onChange={(e) => setEditingQuantity(e.target.value)}
                                            className="p-1 border border-gray-300 rounded-md w-24"
                                            autoFocus
                                            step="0.1"
                                        />
                                        <span className="text-gray-500 text-sm">{item.unit}</span>
                                        <button onClick={() => handleSaveEdit(item.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-full"><Save size={20} /></button>
                                        <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm ml-2">{item.quantity} {item.unit}</span>
                                        <button onClick={() => handleEditClick(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

