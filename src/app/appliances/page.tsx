"use client";
import React, { useState, useEffect } from "react";
import { Plus, X, Save, Settings, BarChart2, Zap, AlertTriangle } from "lucide-react";

// Define Appliance Types
type ApplianceCategory = "Kitchen" | "Entertainment" | "Bathroom" | "Laundry" | "Office" | "Other";

interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  wattage: number;
  hoursPerDay: number;
  isOn: boolean;
  image: string;
}

// Hardcoded common household appliances with images
const defaultAppliances: Appliance[] = [
  {
    id: "1",
    name: "Fridge",
    category: "Kitchen",
    wattage: 150,
    hoursPerDay: 24,
    isOn: true,
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  },
  {
    id: "2",
    name: "Lamp",
    category: "Office",
    wattage: 60,
    hoursPerDay: 6,
    isOn: false,
    image: "https://cdn-icons-png.flaticon.com/512/224/224446.png",
  },
  {
    id: "3",
    name: "Washing Machine",
    category: "Laundry",
    wattage: 500,
    hoursPerDay: 2,
    isOn: false,
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046796.png",
  },
  {
    id: "4",
    name: "Television",
    category: "Entertainment",
    wattage: 120,
    hoursPerDay: 5,
    isOn: true,
    image: "https://cdn-icons-png.flaticon.com/512/254/254434.png",
  },
  {
    id: "5",
    name: "Microwave",
    category: "Kitchen",
    wattage: 1000,
    hoursPerDay: 1,
    isOn: false,
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046786.png",
  },
];

const Page = () => {
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Toggle appliance on/off state
  const toggleApplianceState = (id: string) => {
    setAppliances(
      appliances.map((appliance) =>
        appliance.id === id ? { ...appliance, isOn: !appliance.isOn } : appliance
      )
    );
  };

  // Calculate energy consumption (kWh per month)
  const calculateEnergyConsumption = (appliance: Appliance): number => {
    return (appliance.wattage / 1000) * appliance.hoursPerDay * 30;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏡 Home Energy Monitor</h1>
            <p className="text-gray-600 mt-1">Monitor and manage your household appliances' energy consumption.</p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Appliance
          </button>
        </div>

        {/* Appliance List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
              <img src={appliance.image} alt={appliance.name} className="w-20 h-20 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{appliance.name}</h2>
              <p className="text-gray-600 text-sm">{appliance.category}</p>
              <p className="mt-1 text-sm">🔌 {appliance.wattage} W | ⏳ {appliance.hoursPerDay} hrs/day</p>
              <p className="mt-1 font-semibold">⚡ {calculateEnergyConsumption(appliance).toFixed(1)} kWh/month</p>

              {/* Toggle Button */}
              <button
                onClick={() => toggleApplianceState(appliance.id)}
                className={`mt-4 px-4 py-2 rounded-md font-semibold transition ${
                  appliance.isOn ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                }`}
              >
                {appliance.isOn ? "ON" : "OFF"}
              </button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Appliances</h3>
            <p className="text-3xl font-bold">{appliances.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Monthly Energy Usage</h3>
            <p className="text-3xl font-bold">
              {appliances.reduce((total, appliance) => total + calculateEnergyConsumption(appliance), 0).toFixed(2)} kWh
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Estimated Monthly Cost</h3>
            <p className="text-3xl font-bold">
              ${appliances.reduce((total, appliance) => total + calculateEnergyConsumption(appliance) * 0.15, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
          <p>Home Energy Monitor &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Page;
