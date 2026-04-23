import { prisma } from "../prisma.js";

function SMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  const sum = slice.reduce((total, value) => total + value, 0);
  return sum / period;
}

function RSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let index = prices.length - period; index < prices.length; index += 1) {
    const diff = prices[index] - prices[index - 1];

    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const rs = gains / (losses || 1);
  return 100 - 100 / (1 + rs);
}

export async function calculateIndicators() {
  const companies = await prisma.companies.findMany();

  for (const company of companies) {
    const prices = await prisma.price_data.findMany({
      where: { company_id: company.id },
      orderBy: { trade_date: "asc" },
      select: { close_price: true, trade_date: true },
    });

    const closes = prices.map((price) => Number(price.close_price));
    if (closes.length < 50) continue;

    const rsi = RSI(closes);
    SMA(closes, 50);
    SMA(closes, 200);

    const latest = prices[prices.length - 1].trade_date;

    await prisma.technical_indicators.upsert({
      where: {
        company_id_trade_date_indicator_id: {
          company_id: company.id,
          trade_date: latest,
          indicator_id: 1,
        },
      },
      update: {
        value: rsi,
      },
      create: {
        company_id: company.id,
        trade_date: latest,
        indicator_id: 1,
        value: rsi,
      },
    });

    console.log(`RSI calculated for ${company.symbol}`);
  }
}
