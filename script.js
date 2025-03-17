const API_KEY = "YOUR_API_KEY";
const url = "https://newsapi.org/v2/everything?q=";
const searchInput = document.getElementById("search-text");
const searchButton = document.getElementById("search-button");
const suggestionsBox = document.createElement("ul");

suggestionsBox.setAttribute("id", "suggestions");
suggestionsBox.classList.add("absolute", "bg-white", "border", "border-gray-300", "rounded-md", "w-full", "mt-1", "z-50", "hidden");
searchInput.parentNode.appendChild(suggestionsBox);

fetchNews("India");

function reload() {
    fetchNews("India");
    window.location.reload();
}

async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) {
            throw new Error("Failed to fetch data from the server.");
        }
        const data = await res.json();
        bindData(data.articles);
        suggestionsBox.classList.add("hidden");
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    if (!articles || articles.length === 0) {
        console.error("No articles found.");
        return;
    }

    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const newsLink = cardClone.querySelector("#news-link");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-us", {
        timeZone: "Asia/Kolkata",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    newsLink.href = article.url;
    newsLink.setAttribute("target", "_blank");
    newsLink.setAttribute("rel", "noopener noreferrer");
}

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return;
    fetchNews(query);
    suggestionsBox.classList.add("hidden"); 
});

async function fetchSuggestions(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) {
            throw new Error("Failed to fetch suggestions.");
        }
        const data = await res.json();
        showSuggestions(data.articles);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
}

function showSuggestions(articles) {
    suggestionsBox.innerHTML = "";
    if (!articles || articles.length === 0) {
        suggestionsBox.classList.add("hidden");
        return;
    }

    articles.slice(0, 5).forEach((article) => {
        const li = document.createElement("li");
        li.classList.add("p-2", "cursor-pointer", "hover:bg-gray-200");
        li.textContent = article.title;
        li.addEventListener("click", () => {
            searchInput.value = article.title; 
            fetchNews(article.title);
            suggestionsBox.classList.add("hidden"); 
        });
        suggestionsBox.appendChild(li);
    });

    suggestionsBox.classList.remove("hidden");
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (!query) {
        suggestionsBox.classList.add("hidden");
        return;
    }
    fetchSuggestions(query);
});

document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
        suggestionsBox.classList.add("hidden");
    }
});

let curSelectedNav = null;

function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    if (curSelectedNav) {
        curSelectedNav.classList.remove("active");
    }
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}
