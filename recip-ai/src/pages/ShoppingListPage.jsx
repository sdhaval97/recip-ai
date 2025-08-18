import React, { useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { db, appId } from '../firebase.js';
import { collection, onSnapshot, query, getDocs, writeBatch } from 'firebase/firestore';
import { ShoppingCart, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// The page for viewing the shopping list
export default function ShoppingListPage() {
    const { userId, shoppingList, setShoppingList, isLoading, setIsLoading, isAuthReady } = useContext(AppContext);

    useEffect(() => {
        if (!isAuthReady || !userId) return;
        
        setIsLoading(true);
        const shoppingListCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'shoppingList');
        const unsubscribe = onSnapshot(shoppingListCollectionRef, (snapshot) => {
            const listData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setShoppingList(listData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching shopping list: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId, isAuthReady, setShoppingList, setIsLoading]);

    const handleClearList = async () => {
        if (!userId) return;
        
        const shoppingListCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'shoppingList');
        const q = query(shoppingListCollectionRef);
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error clearing list: ", error);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading your shopping list..." />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            {shoppingList.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Your shopping list is empty</h3>
                    <p className="mt-1 text-gray-500">When you use up an ingredient, it will be added here.</p>
                </div>
            ) : (
                <>
                    <ul className="space-y-3 mb-6">
                        {shoppingList.map(item => (
                            <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
                                <div>
                                    <span className="text-gray-800 font-bold capitalize">{item.name}</span>
                                    <span className="text-gray-500 text-sm ml-2">{item.quantity} {item.unit}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={handleClearList} 
                        className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow"
                    >
                        <Trash2 size={20}/>
                        Clear Shopping List
                    </button>
                </>
            )}
        </div>
    );
}
