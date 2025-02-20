const API_KEY = "d2559b8d720c269be68f4468785ab99c";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/original";

const heroCategory = document.getElementById("hero-category");
const heroTitle = document.getElementById("hero-title");
const hero = document.getElementById("hero");
const heroMediaDetails = document.getElementById("hero-media-details");
const heroEpisodes = document.getElementById("hero-episodes");
const heroYear = document.getElementById("hero-year");
const heroGenres = document.getElementById("hero-genres");
const heroStory = document.getElementById("hero-story");
const castContainer = document.getElementById("top-cast");
const recommendedMovies = document.getElementById("recommended-movie");
const recommendedSeries = document.getElementById("recommended-series");
let mediaList = [];
let currentIndex = 0;

// Fetch Popular Movies & Series
async function getHeroMedia() {
  try {
    const movieResponse = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`
    );
    const seriesResponse = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}`
    );

    const movieData = await movieResponse.json();
    const seriesData = await seriesResponse.json();

    const movies = movieData.results.slice(0, 3).map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      backdrop_path: movie.backdrop_path,
      type: "Movie",
      year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
      genres: movie.genre_ids,
    }));

    const series = seriesData.results.slice(0, 3).map((series) => ({
      id: series.id,
      title: series.name,
      overview: series.overview,
      backdrop_path: series.backdrop_path,
      type: "Series",
      tv_id: series.id,
    }));

    mediaList = [...movies, ...series];

    updateHero();
    setInterval(updateHero, 5000);
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
    return { year: "N/A", genres: "N/A", episodes: "N/A" };
  }
}

// Fetch Cast
async function updateCast(movieId, type) {
  let url =
    type === "Movie"
      ? `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
      : `${BASE_URL}/tv/${movieId}/credits?api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const topCast = data.cast.slice(0, 7);

    const castContainer = document.getElementById("cast-container");
    castContainer.innerHTML = ""; // Bersihkan isi sebelumnya

    topCast.forEach((actor) => {
      const castItem = document.createElement("div");
      castItem.classList.add(
        "flex",
        "items-center",
        "gap-3",
        "justify-between"
      );

      const profilePath = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : "https://via.placeholder.com/150";

      castItem.innerHTML = `
        <img src="${profilePath}" alt="${actor.name}" class="w-12 h-12 rounded-full object-cover"/>
        <div class="text-white">
          <p class="text-base text-[#f9f9f9] font-semibold">${actor.name}</p>
          <p class="text-xs text-[#9CA4AB]">${actor.character}</p>
        </div>
      `;

      castContainer.appendChild(castItem);
    });
  } catch (error) {
    console.error("Error fetching cast:", error);
  }
}

// Fetch Recommended Movies
async function updateRecommendedMovies() {
  try {
    // Ambil daftar film populer
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`
    );
    const data = await response.json();

    if (data.results.length === 0) return;

    // Pilih satu film secara random
    const randomMovie =
      data.results[Math.floor(Math.random() * data.results.length)];
    const movieId = randomMovie.id;

    // Ambil recommended movies berdasarkan movieId random
    const recResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`
    );
    const recData = await recResponse.json();

    // Update UI dengan rekomendasi film
    const container = document.getElementById("recommended-movie");
    recData.results.slice(0, 7).forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("flex", "flex-col", "items-center", "gap-3");

      movieElement.innerHTML = `
        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}" class="w-32 h-48 rounded-lg shadow-md object-cover"/>
        <p class="text-sm text-center mt-2">${movie.title}</p>`;

      container.appendChild(movieElement);
    });
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
  }
}

// Fetch Recommended Series
async function updateRecommendedSeries() {
  try {
    // Ambil daftar series populer
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const data = await response.json();

    if (data.results.length === 0) return;

    // Pilih satu series secara random
    const randomSeries = data.results[Math.floor(Math.random() * data.results.length)];
    const seriesId = randomSeries.id;

    // Ambil recommended series berdasarkan seriesId random
    const recResponse = await fetch(
      `${BASE_URL}/tv/${seriesId}/recommendations?api_key=${API_KEY}`
    );
    const recData = await recResponse.json();

    // Update UI dengan rekomendasi series
    const container = document.getElementById("recommended-series");
    container.innerHTML = ""; // Bersihkan isi sebelumnya

    recData.results.slice(0, 7).forEach((series) => {
      const seriesElement = document.createElement("div");
      seriesElement.classList.add("flex", "flex-col", "items-center", "gap-3");

      seriesElement.innerHTML = `
        <img src="${IMAGE_URL}${series.poster_path}" alt="${series.name}" class="w-32 h-48 rounded-lg shadow-md object-cover"/>
        <p class="text-sm text-center mt-2">${series.name}</p>`;

      container.appendChild(seriesElement);
    });
  } catch (error) {
    console.error("Error fetching recommended series:", error);
  }
}

// Update Hero Section
async function updateHero() {
  const media = mediaList[currentIndex];

  heroCategory.textContent = media.type;
  heroTitle.textContent = media.title;
  heroStory.textContent = media.overview;
  hero.style.backgroundImage = `url('${IMAGE_URL}${media.backdrop_path}')`;

  if (media.type === "Movie") {
    heroYear.textContent = media.year;
    heroGenres.textContent = "Fetching...";
    heroEpisodes.style.display = "none";

    const genreResponse = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    const genreData = await genreResponse.json();
    const genreMap = new Map(genreData.genres.map((g) => [g.id, g.name]));

    heroGenres.textContent =
      media.genres.map((id) => genreMap.get(id)).join(", ") || "Unknown";
  } else {
    const details = await getSeriesDetails(media.tv_id);
    heroYear.textContent = details.year;
    heroGenres.textContent = details.genres;
    heroEpisodes.style.display = "block";
    heroEpisodes.textContent = `Episodes ${details.episodes}`;
  }


  updateCast(media.id, media.type);

  currentIndex = (currentIndex + 1) % mediaList.length;
}

// Update Cast Section
getHeroMedia();

// Update Recommended Movies
document.addEventListener("DOMContentLoaded", updateRecommendedMovies);

// Update Recommended Series
document.addEventListener("DOMContentLoaded", updateRecommendedSeries);
