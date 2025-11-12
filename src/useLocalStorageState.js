import { useState, useEffect } from "react";

export function useLocalStorageState(initialStat, key) {
    const [value, setValue] = useState(function () {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialStat;
    });

    useEffect(
        function () {
            localStorage.setItem(key, JSON.stringify(value));
        }, [value, key]);

    return [value, setValue];
};
