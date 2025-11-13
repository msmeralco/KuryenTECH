import React, { useEffect, useState, useRef } from "react";
import {
  FaBolt,
  FaTools,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

ChartJS.register(
  Title,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// Heatmap Layer
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const heatData = points.map((p) => [p.coords[0], p.coords[1], p.severity / 5]);
    const heat = L.heatLayer(heatData, {
      radius: 50,
      blur: 15,
      maxZoom: 15,
      gradient: { 0.2: "green", 0.5: "orange", 1.0: "red" },
    }).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
}

export default function Analytics() {
  // ✅ Keep your full areas array
  const areas = [
    { name: "San Andres", reports: 120, severity: 5, coords: [14.5789, 121.1247] },
    { name: "San Roque", reports: 95, severity: 4, coords: [14.5805, 121.1200] },
    { name: "San Isidro", reports: 47, severity: 3, coords: [14.5840, 121.1168] },
    { name: "Sto. Niño", reports: 20, severity: 2, coords: [14.5901, 121.1212] },
    { name: "Sto. Domingo", reports: 85, severity: 3, coords: [14.5930, 121.1270] },
    { name: "San Juan", reports: 60, severity: 2, coords: [14.5865, 121.1105] },
    { name: "Sta. Rosa", reports: 32, severity: 1, coords: [14.5825, 121.1325] },
    { name: "Karangalan", reports: 87, severity: 4, coords: [14.5890, 121.1350] },
    { name: "Balanti", reports: 24, severity: 1, coords: [14.5755, 121.1300] },
    { name: "Halang", reports: 95, severity: 5, coords: [14.5885, 121.1405] },
  ];

  const [selectedIssues, setSelectedIssues] = useState(["Exposed Wires"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const issueCategories = {
    "Exposed Wires": [45, 60, 75, 70, 85, 90, 95],
    "Illegal Taps": [30, 40, 45, 55, 60, 72, 78],
    "Physical Pole Failure": [25, 35, 40, 42, 47, 50, 55],
    "Transformer Failure": [40, 38, 42, 50, 65, 70, 75],
    "Ground Wires / Guy Wires": [20, 28, 35, 38, 42, 46, 52],
    "Vegetation Encroachment": [10, 20, 25, 30, 35, 40, 45],
    "Component Damage": [15, 22, 28, 35, 40, 45, 50],
    "Corrosion / Aging": [18, 24, 30, 36, 40, 44, 49],
    "Accessory Damage": [12, 18, 25, 28, 32, 38, 41],
  };

  const generateColor = (index) => {
    const colors = [
      "#2563eb", "#f97316", "#10b981", "#ef4444", "#f59e0b",
      "#8b5cf6", "#3b82f6", "#14b8a6", "#e11d48",
    ];
    return colors[index % colors.length];
  };

  const issueTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: selectedIssues.map((issue, index) => ({
      label: issue,
      data: issueCategories[issue],
      borderColor: generateColor(index),
      backgroundColor: `${generateColor(index)}33`,
      pointBackgroundColor: generateColor(index),
      fill: false,
      tension: 0.4,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Issue Trends by Category" },
    },
  };

  const reportStatusData = [
    { name: "Safe", value: 140 },
    { name: "Potential Hazard", value: 95 },
    { name: "Critical", value: 48 },
  ];
  const COLORS = ["#10B981", "#FBBF24", "#EF4444"];

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleCheckboxChange = (issue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((i) => i !== issue)
        : [...prev, issue]
    );
  };

  // ✅ Click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
  <div className="bg-white p-5 rounded-xl shadow flex items-center hover:shadow-lg transition">
    <FaBolt className="text-yellow-500 text-3xl mr-4" />
    <div>
      <p className="text-sm text-gray-500">Detected Electrical Hazards</p>
      <p className="text-xl font-bold text-gray-800">283</p>
      <p className="text-xs text-red-500 font-medium">+5% this week</p>
    </div>
  </div>

  <div className="bg-white p-5 rounded-xl shadow flex items-center hover:shadow-lg transition">
    <FaTools className="text-blue-600 text-3xl mr-4" />
    <div>
      <p className="text-sm text-gray-500">Maintenance Actions</p>
      <p className="text-xl font-bold text-gray-800">157</p>
      <p className="text-xs text-green-500 font-medium">+12% efficiency</p>
    </div>
  </div>

  <div className="bg-white p-5 rounded-xl shadow flex items-center hover:shadow-lg transition">
    <FaExclamationTriangle className="text-orange-500 text-3xl mr-4" />
    <div>
      <p className="text-sm text-gray-500">Critical Faults</p>
      <p className="text-xl font-bold text-gray-800">48</p>
      <p className="text-xs text-red-500 font-medium">Immediate action</p>
    </div>
  </div>

  <div className="bg-white p-5 rounded-xl shadow flex items-center hover:shadow-lg transition">
    <FaShieldAlt className="text-green-500 text-3xl mr-4" />
    <div>
      <p className="text-sm text-gray-500">Safe Zones</p>
      <p className="text-xl font-bold text-gray-800">312</p>
      <p className="text-xs text-green-500 font-medium">+8% coverage</p>
    </div>
  </div>
</div>


      {/* Heatmap */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Heatmap of Reported Hazards</h2>
        <MapContainer
          center={[14.58, 121.05]}
          zoom={13}
          className="w-full h-96 rounded-lg shadow-md"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer points={areas} />
        </MapContainer>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Select Dropdown Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4 relative" ref={dropdownRef}>
            <h2 className="text-lg font-semibold">Issue Trends by Category</h2>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                {selectedIssues.length > 0
                  ? `${selectedIssues.length} Selected`
                  : "Select Categories"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {Object.keys(issueCategories).map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue)}
                        onChange={() => handleCheckboxChange(issue)}
                        className="mr-2 accent-blue-600"
                      />
                      {issue}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-80">
            <Line data={issueTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Hazard Classification Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {reportStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
