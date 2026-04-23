import Chart from "react-apexcharts";

export default function CandleChart({ candles = [] }) {
  if (!candles.length) {
    return <div className="candle-chart-empty">No chart data available.</div>;
  }

  const series = [
    {
      data: candles.map((candle) => ({
        x: new Date(candle.date),
        y: [
          Number(candle.open),
          Number(candle.high),
          Number(candle.low),
          Number(candle.close),
        ],
      })),
    },
  ];

  const options = {
    chart: {
      type: "candlestick",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      foreColor: "#94a3b8",
    },
    theme: {
      mode: "dark",
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#4ade80",
          downward: "#f87171",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    grid: {
      borderColor: "rgba(148,163,184,0.12)",
      strokeDashArray: 4,
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#94a3b8",
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: "#94a3b8",
        },
        formatter: (value) => `Rs. ${Math.round(value)}`,
      },
    },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <div className="candle-chart-shell">
      <Chart
        options={options}
        series={series}
        type="candlestick"
        height={320}
      />
    </div>
  );
}
