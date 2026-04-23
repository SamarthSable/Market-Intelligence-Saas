import axios from "axios";
import Parser from "rss-parser";

const parser = new Parser();
const FALLBACK_IMAGE =
  "https://via.placeholder.com/400x200.png?text=Market+News";

async function getJsonSafely(label, url) {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    return res.data;
  } catch (error) {
    const status = error.response?.status;
    console.warn(
      `${label} request skipped${status ? ` with status ${status}` : ""}.`
    );
    return null;
  }
}

async function getFeedSafely(label, url) {
  try {
    return await parser.parseURL(url);
  } catch (error) {
    console.warn(`${label} feed skipped.`);
    return null;
  }
}

export async function getCompanyNews(symbol) {
  // Company news is optional content, so an upstream outage should return an empty list instead of a 500.
  const data = await getJsonSafely(
    "GNews company search",
    `https://gnews.io/api/v4/search?q=${symbol}&lang=en&max=10&token=${process.env.GNEWS_API_KEY}`
  );

  if (!data?.articles) {
    return [];
  }

  return data.articles.map((article) => ({
    title: article.title,
    url: article.url,
    image: article.image || FALLBACK_IMAGE,
    source: article.source.name,
  }));
}

export async function getMarketNews() {
  const articles = [];

  const [gnews, google, moneycontrol] = await Promise.all([
    getJsonSafely(
      "GNews market search",
      `https://gnews.io/api/v4/search?q=NSE OR Nifty OR Sensex&lang=en&max=10&token=${process.env.GNEWS_API_KEY}`
    ),
    getFeedSafely(
      "Google Finance",
      "https://news.google.com/rss/search?q=indian+stock+market"
    ),
    getFeedSafely(
      "Moneycontrol",
      "https://www.moneycontrol.com/rss/marketreports.xml"
    ),
  ]);

  gnews?.articles?.forEach((article) => {
    articles.push({
      title: article.title,
      url: article.url,
      image: article.image || FALLBACK_IMAGE,
      source: article.source.name,
    });
  });

  google?.items?.slice(0, 20).forEach((article) => {
    articles.push({
      title: article.title,
      url: article.link,
      image: FALLBACK_IMAGE,
      source: "Google Finance",
    });
  });

  moneycontrol?.items?.slice(0, 20).forEach((article) => {
    articles.push({
      title: article.title,
      url: article.link,
      image: FALLBACK_IMAGE,
      source: "Moneycontrol",
    });
  });

  return articles.slice(0, 50);
}
