import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// The seed keeps a small starter universe in place so the app has something real to work with on day one.
const SECTORS = ["IT", "Banking", "Pharma", "Energy", "FMCG"];
const INDICATORS = [
  {
    id: 1,
    name: "RSI",
    formula: "RSI(14)",
  },
];

// We store api_symbol here too so the live sync can fetch prices without any manual DB patching later.
const COMPANIES = [
  {
    name: "Tata Consultancy Services",
    symbol: "TCS",
    api_symbol: "TCS:NSE",
    sector: "IT",
    market_cap: 1200000000000,
  },
  {
    name: "Infosys",
    symbol: "INFY",
    api_symbol: "INFY:NSE",
    sector: "IT",
    market_cap: 700000000000,
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    api_symbol: "HDFCBANK:NSE",
    sector: "Banking",
    market_cap: 900000000000,
  },
  {
    name: "ICICI Bank",
    symbol: "ICICIBANK",
    api_symbol: "ICICIBANK:NSE",
    sector: "Banking",
    market_cap: 850000000000,
  },
  {
    name: "Sun Pharma",
    symbol: "SUNPHARMA",
    api_symbol: "SUNPHARMA:NSE",
    sector: "Pharma",
    market_cap: 300000000000,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const sectorName of SECTORS) {
    await prisma.sectors.upsert({
      where: { name: sectorName },
      update: {},
      create: { name: sectorName },
    });
  }

  console.log("Sectors inserted or updated");

  for (const indicator of INDICATORS) {
    await prisma.indicators.upsert({
      where: { id: indicator.id },
      update: {
        name: indicator.name,
        formula: indicator.formula,
      },
      create: {
        id: indicator.id,
        name: indicator.name,
        formula: indicator.formula,
      },
    });
  }

  console.log("Indicators inserted or updated");

  const sectors = await prisma.sectors.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const sectorMap = new Map(sectors.map((sector) => [sector.name, sector.id]));

  for (const company of COMPANIES) {
    await prisma.companies.upsert({
      where: { symbol: company.symbol },
      update: {
        name: company.name,
        api_symbol: company.api_symbol,
        sector_id: sectorMap.get(company.sector),
        market_cap: company.market_cap,
      },
      create: {
        name: company.name,
        symbol: company.symbol,
        api_symbol: company.api_symbol,
        sector_id: sectorMap.get(company.sector),
        market_cap: company.market_cap,
      },
    });
  }

  console.log("Companies inserted or updated");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Seeding completed");
  });
