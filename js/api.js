const API_KEY = "d2559b8d720c269be68f4468785ab99c";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/original";

const heroCategory = document.getElementById("hero-category");
const heroTitle = document.getElementById("hero-title");
const heroDescription = document.getElementById("hero-description");
const hero = document.getElementById("hero");
const heroMediaDetails = document.getElementById("hero-media-details");
const heroEpisodes = document.getElementById("hero-episodes");
const heroYear = document.getElementById("hero-year");
const heroGenres = document.getElementById("hero-genres");

let mediaList = []; // Array of movies and series
let currentIndex = 0;

// Fetch Popular Images Movies
async function getHeroMedia() {
  try {
    // Fetch movie and series data
    const movieResponse = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`
    );
    const seriesResponse = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}`
    );

    const movieData = await movieResponse.json();
    const seriesData = await seriesResponse.json();

    // Extract top 3 movies
    const movies = movieData.results.slice(0, 3).map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      backdrop_path: movie.backdrop_path,
      type: "Movie",
      year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
      genres: movie.genres_ids || [],
    }));

    // Extract top 3 series
    const series = seriesData.results.slice(0, 3).map((series) => ({
      id: series.id,
      title: series.name,
      overview: series.overview,
      backdrop_path: series.backdrop_path,
      type: "Series",      
      tv_id: series.id,
    }));

    // Merge movie and series data
    mediaList = [...movies, ...series];

    updateHero();
    setInterval(updateHero, 5000); // Update hero image every 5 seconds
  } catch (error) {
    console.error("Error fetching hero images:", error);
  }
}

// Fetch Series Details
async function getSeriesDetails(tvId) {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
    const data = await response.json();
    return {
      year: data.first_air_date ? data.first_air_date.split("-")[0] : "N/A",
      genres: data.genres.map((g) => g.name).join(", "),
      episodes: data.number_of_episodes || "N/A",
    };
  } catch (error) {
    console.error("Error fetching series details:", error);
    return { year: "N/A, genres: N/A, episodes: N/A" };
  }
}

async function updateHero() {
  const media = mediaList[currentIndex];

  heroCategory.textContent = media.type;
  heroTitle.textContent = media.title || media.name;
  heroDescription.textContent = media.overview;
  hero.style.backgroundImage = `url('${IMAGE_URL}${media.backdrop_path}')`;

  if(media.type === "Movies") {
    heroYear.textContent = media.year;
    heroGenres.textContent = "Fetching genres...";
    heroEpisodes.textContent = "-";

    // Fetch genre names for movies
    const genreResponse = await fetch(`${BASE_URL}/genre/movie/list?api_Key=${API_KEY}`);
    const genreData = await genreResponse.json();
    const genreMap = new Map(genreData.genres.map(g => [g.id, g.name]));
  } else {

    // Fetch series details
    const details = await getSeriesDetails(media.tv_id);
    heroYear.textContent = details.year;
    heroGenres.textContent = details.genres;
    heroEpisodes.textContent = `${details.episodes} Episodes`
  }

  // Update hero image
  currentIndex = (currentIndex + 1) % mediaList.length;
}

// Panggil fungsi saat halaman dimuat
getHeroMedia();
