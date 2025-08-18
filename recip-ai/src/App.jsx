import React, { useState, createContext } from 'react';

// Creates a global context to share state across the application
export const AppContext = createContext();

// Provides the shared state to all child components
export const AppProvider = ({ children }) => {
    const [page, setPage] = useState('auth');
    const [userId, setUserId] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const state = {
        page, setPage,
        userId, setUserId,
        inventory, setInventory,
        shoppingList, setShoppingList,
        isLoading, setIsLoading,
        isAuthReady, setIsAuthReady
    };

    return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};
