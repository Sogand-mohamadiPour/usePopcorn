import { useEffect } from "react";

export function useKeyState(key, action) {
    useEffect(function () {
        // Callback function for keydown event
        function callback(e) {
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        }
        document.addEventListener("keydown", callback);

        return function () {
            document.removeEventListener('keydown', callback);
        };
    }, [action, key]);
}