import { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function MonthlyReportChart() {
  // Configuration
  const cities = [
    "Caloocan City",
    "Makati City",
    "Malabon City",
    "Mandaluyong City",
    "Manila City",
    "Marikina City",
    "Pasig City",
  ];

  const months = [
    "All", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const categories = [
    "Exposed Wires",
    "Illegal Taps",
    "Vegetation",
    "Damaged Poles",
    "Other",
  ];

    const colors = [
    "#0A0903", // Dark
    "#FF5100", // Orange
    "#FF8200", // Amber
    "#FFC929", // Yellow
    "#FFF4D5", // Cream
  ];

  // State
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCities, setSelectedCities] = useState(cities);

  // Generate sample data
  const reportData = useMemo(() => {
    const data = {};
    months.slice(1).forEach((month) => {
      data[month] = {};
      categories.forEach((cat) => {
        data[month][cat] = cities.map(() =>
          Math.floor(Math.random() * 150) + 50
        );
      });
    });
    return data;
  }, []);

  // Handlers
  const toggleCity = (city) => {
    setSelectedCities((prev) =>
      prev.includes(city)
        ? prev.filter((c) => c !== city)
        : [...prev, city].sort((a, b) => cities.indexOf(a) - cities.indexOf(b))
    );
  };

  const selectAll = () => setSelectedCities(cities);
  const clearAll = () => setSelectedCities([]);

  // Chart data computation
  const chartData = useMemo(() => {
    const getFilteredData = (dataArray) => {
      return selectedCities.map((city) => {
        const index = cities.indexOf(city);
        return dataArray[index];
      });
    };

    const datasets = categories.map((category, idx) => {
      let monthlyValues;

      if (selectedMonth === "All") {
        monthlyValues = cities.map((_, i) => {
          const sum = months.slice(1).reduce((acc, month) => {
            return acc + reportData[month][category][i];
          }, 0);
          return Math.round(sum / 12);
        });
      } else {
        monthlyValues = reportData[selectedMonth][category];
      }

      const filteredValues = getFilteredData(monthlyValues);

      return {
        label: category,
        data: filteredValues,
        backgroundColor: colors[idx],
        borderColor: colors[idx].replace("0.85", "1"),
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    return {
      labels: selectedCities,
      datasets,
    };
  }, [selectedMonth, selectedCities, reportData]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 12,
          font: { size: 11, family: "'Inter', sans-serif" },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: selectedMonth === "All"
          ? "Annual Average Report by City"
          : `${selectedMonth} Report by City`,
        font: { size: 18, weight: "600", family: "'Inter', sans-serif" },
        padding: { top: 10, bottom: 20 },
        color: '#1f2937',
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} reports`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#6b7280',
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: "rgba(0, 0, 0, 0.04)",
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#6b7280',
          padding: 8,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monthly Report Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Infrastructure issue reports across cities</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all hover:border-gray-300"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Filter by City</h3>
            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
              {selectedCities.length} of {cities.length}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="text-xs px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {cities.map((city) => {
            const isSelected = selectedCities.includes(city);
            return (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {selectedCities.length === 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">
              Please select at least one city to display data
            </p>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className="h-96 relative">
          {selectedCities.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-base font-medium">No cities selected</p>
              <p className="text-sm text-gray-400 mt-1">Select cities above to view report data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}