import { getCompanyNews, getMarketNews } from "../services/news.service.js";

export async function news(req, res) {
  try {
    const { symbol } = req.query;
    // Company news is always symbol-driven, so we fail fast if the client forgets the query string.
    if (!symbol) return res.status(400).json({ error: "symbol required" });

    const data = await getCompanyNews(symbol);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Company News API failed" });
  }
}

export async function marketNews(req, res) {
  try {
    // The service already tolerates partial provider failures, so this endpoint can stay nice and thin.
    const data = await getMarketNews();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Market News API failed" });
  }
}
