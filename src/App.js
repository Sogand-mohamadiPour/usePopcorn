import { useEffect, useState, useRef } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";

// calculating average for movie details summary
const average = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, cur) => acc + cur, 0);
  return sum / arr.length;
};

// OMDB API key
const key = 'a062c83d';

// Main App component
export default function App() {
  // State variables
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);

  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem('watched');
    return storedValue ? JSON.parse(storedValue) : [];
  });

  // Handler functions
  function handleSelectMovie(id) {
    setSelectedId(selectedId => id === selectedId ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }
  // End of handler functions

  useEffect(function () {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  // Fetch movies based on query



  return (
    <>
      <Navbar>

        <Serach
          query={query}
          setQuery={setQuery}
        />

        <NumResults
          movies={movies}
        />

      </Navbar>

      <Main>

        <Box>

          {isLoading && <Loader />}
          {!isLoading && !error &&
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />}
          {error &&
            <ErrorMessage
              message={error}
            />}

        </Box>

        <Box>

          {
            selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
              />
            ) : (
              <>
                <WatchedSummary
                  watched={watched}
                />

                <WatchedMovieList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
              </>
            )}

        </Box>

      </Main>
    </>
  );
}

// Helper components
function Loader() {
  return <p className="loader">Loading...</p>
}

// Error message component
function ErrorMessage({ message }) {
  return <p className="error">
    <span>⛔</span> {message}</p>

}

// Navbar component
function Navbar({ children }) {
  return (
    <>
      <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
    </>
  )
}

// Logo component
function Logo() {
  return (
    <>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  )
}

// Search component
function Serach({ query, setQuery }) {
  const inputEL = useRef(null);

  // Focus on search box when component mounts
  useEffect(function () {
    inputEL.current?.focus();
  }, []);

  useEffect(function () {
    function callback(e) {
      if (document.activeElement === inputEL.current) return;

      if (e.code === "Enter") {
        inputEL.current.focus();
        setQuery("");
      }
    }

    document.addEventListener('keydown', callback)
    return () => document.removeEventListener('keydown', callback)
  }, [setQuery]);

  // using useEffectEvent but still not on stable React // 
  // const handleFocus = useEffectEvent(function () {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // });

  // useEffect(function () {
  //   handleFocus();
  // }, []);
  ///////////////////////////////////////////////////////////////////////////////

  // useEffect(function (){
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);



  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEL}
      />
    </>
  )
}

// Number of results component
function NumResults({ movies }) {
  return (
    <>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </>
  )
}

// Main content component
function Main({ children }) {
  return (
    <>
      <main className="main">
        {children}
      </main>
    </>
  )
}


// Box component with toggle functionality
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
      </div>
    </>
  )
}

// Movie list component
function MovieList({ movies, onSelectMovie }) {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie
            movie={movie}
            key={movie.imdbID}
            onSelectMovie={onSelectMovie}
          />
        ))}
      </ul>
    </>
  )
}

// Individual movie component
function Movie({ movie, onSelectMovie }) {
  return (
    <>
      <li onClick={() => onSelectMovie(movie.imdbID)}>
        <img
          src={movie.Poster}
          alt={`${movie.Title} poster`}
        />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>📅</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  )
}

// Movie details component
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  // State variables for movie details
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState('');

  const conutRef = useRef(0);

  useEffect(function () {
    if (userRating) conutRef.current = conutRef.current + 1;
  }, [userRating]);

  // Check if the movie is already in the watched list
  const isWatched = watched?.some(movie => movie.imdbID === selectedId) || false;

  // Get the watched movie details if it exists
  const watchedMovie =
    watched?.find(movie => movie.imdbID === selectedId)?.userRating;

  // Destructure movie details
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // Handler to add movie to watched list
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: runtime ? Number(runtime.split(" ").at(0)) : 0,
      imdbRating: Number(imdbRating),
      userRating: Number(userRating),
      countRatingDecisions: conutRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Effect to handle Escape key for closing movie details
  useEffect(function () {
    // Callback function for keydown event
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    }
    document.addEventListener("keydown", callback);

    return function () {
      document.removeEventListener('keydown', callback);
    };
  }, [onCloseMovie]);

  // Effect to fetch movie details when selectedId changes
  useEffect(function () {
    const controller = new AbortController();
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        setError("");
        setMovie({});
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${key}&i=${selectedId}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("something went wrong with showing movie details");
        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie details not found");
        setMovie(data);
      }
      catch (err) {
        if (err.name !== "AbortError") {
          console.error(err.message);
          setError(err.message);
        }
      }
      finally { setIsLoading(false); }
    }

    getMovieDetails();

    // Cleanup function to abort fetch on unmount or selectedId change
    return function cleanup() {
      controller.abort();
    }
  }, [selectedId])

  // Effect to update document title based on movie title
  useEffect(function () {
    if (title) {
      document.title = `Movie | ${title}`;
    }
    return function () {
      // working with closure to reset title on unmount
      document.title = "usePopcorn";
    }
  }, [title]);

  return (
    <>
      {isLoading && <Loader />}

      {error &&
        <ErrorMessage
          message={error} />}

      {!isLoading && !error && (
        <div className="details">
          <header>

            <button
              className="btn-back"
              onClick={onCloseMovie}>&larr;
            </button>

            {poster && <img src={poster} alt={`Poster of ${title} movie`} />}
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>

          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="btn-add"
                      onClick={() => { handleAdd() }}
                    >
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedMovie?.userRating} <span>⭐</span></p>
              )}
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </>
  )
}


// Watched summary component
function WatchedSummary({ watched }) {
  // Calculate averages for summary
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating) || []);
  const avgUserRating = average(watched?.map((movie) => movie.userRating) || []);
  const avgRuntime = average(watched?.map((movie) => movie.runtime) || []);

  return (
    <>
      <div className="summary">

        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched?.length || 0} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime.toFixed(2)} min</span>
          </p>
        </div>

      </div>
    </>
  )
}

// Watched movie list component
function WatchedMovieList({ watched, onDeleteWatched }) {

  return (
    <>
      <ul className="list">
        {watched?.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatched={onDeleteWatched}
          />
        )) || []}
      </ul>
    </>
  )
}

// Individual watched movie component
function WatchedMovie({ movie, onDeleteWatched }) {

  return (
    <>

      <li>
        <img
          src={movie.Poster}
          alt={`${movie.Title} poster`}
        />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>

          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>

    </>
  )
}


