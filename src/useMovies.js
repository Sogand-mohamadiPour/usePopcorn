import { useState,useEffect } from "react";

export function useMovies(query) {
    // OMDB API key
    const key = 'a062c83d';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [movies, setMovies] = useState([]);

    // Custom hook logic to fetch and manage movies data
    useEffect(function () {
        // AbortController to cancel fetch requests
        const controller = new AbortController();
        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError("");

                const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${query}`,
                    { signal: controller.signal });

                if (!res.ok)
                    throw new Error("something went wrong with fetching movies");
                const data = await res.json()

                if (data.Response === "False") throw new Error("Movie not found");
                setMovies(data.Search || [])
                setError("");
            }

            catch (err) {
                // Ignore abort errors
                if (err.name !== "AbortError") {
                    console.log(err.message);
                    setError(err.message);
                }
            }

            finally {
                setIsLoading(false);
            }
        }

        // Only fetch if query length is 3 or more
        if (query.length < 3) {
            setMovies([]);
            setError("");
            return function () {
                controller.abort();
            };
        }

        fetchMovies();

        // Cleanup function to abort fetch on unmount or query change
        return function () {
            controller.abort();
        };
    }, [query]);

    return { movies, isLoading, error };
}