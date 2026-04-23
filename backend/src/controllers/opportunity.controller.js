import { getOpportunities } from "../services/opportunity.service.js";

export async function opportunities(req, res) {
  // The service already ranks and shapes the ideas, so the controller just hands them back.
  const data = await getOpportunities();
  res.json(data);
}
