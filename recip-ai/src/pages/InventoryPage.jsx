import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { db, appId } from '../firebase.js';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { List, Trash2, PlusCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// The page for managing user's inventory
export default function InventoryPage() {
    const { userId, inventory, setInventory, isLoading, setIsLoading, isAuthReady } = useContext(AppContext);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '' });

    useEffect(() => {
        if (!isAuthReady || !userId) return;
        
        setIsLoading(true);
        const inventoryCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'inventory');
        const unsubscribe = onSnapshot(inventoryCollectionRef, (snapshot) => {
            const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventory(inventoryData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching inventory: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId, isAuthReady, setInventory, setIsLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const quantity = parseFloat(newItem.quantity);
        if (newItem.name.trim() === '' || isNaN(quantity) || quantity <= 0 || !userId) return;
        
        const inventoryCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'inventory');
        try {
            await addDoc(inventoryCollectionRef, { 
                name: newItem.name.trim(),
                quantity: quantity,
                unit: newItem.unit.trim(),
                purchaseQuantity: quantity
            });
            setNewItem({ name: '', quantity: '', unit: '' });
        } catch (error) {
            console.error("Error adding item: ", error);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!userId) return;
        const itemDocRef = doc(db, 'artifacts', appId, 'users', userId, 'inventory', id);
        try {
            await deleteDoc(itemDocRef);
        } catch (error) {
            console.error("Error deleting item: ", error);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading your inventory..." />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleAddItem} className="p-4 bg-white rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item name" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2" />
                    <input type="number" name="quantity" value={newItem.quantity} onChange={handleInputChange} placeholder="Qty" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                    <input type="text" name="unit" value={newItem.unit} onChange={handleInputChange} placeholder="Unit (e.g., lbs, oz, gallon)" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 col-span-1 sm:col-span-2" />
                    <button type="submit" className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow col-span-1">
                        <PlusCircle size={20} />
                    </button>
                </div>
            </form>

            {inventory.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <List className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Your inventory is empty</h3>
                    <p className="mt-1 text-gray-500">Add items with quantities to get started.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {inventory.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                            <div>
                                <span className="text-gray-800 font-bold capitalize">{item.name}</span>
                                <span className="text-gray-500 text-sm ml-2">{item.quantity} {item.unit}</span>
                            </div>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
