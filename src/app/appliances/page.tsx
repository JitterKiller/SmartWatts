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
}

// Hardcoded common household appliances with images
const defaultAppliances: Appliance[] = [
  {
    id: "1",
    name: "LG LFXS26973 Refrigerator",
    category: "Kitchen",
    wattage: 150,
    hoursPerDay: 24,
    isOn: true,
  },
  {
    id: "2",
    name: "BenQ e-Reading LED Desk Lamp",
    category: "Office",
    wattage: 60,
    hoursPerDay: 6,
    isOn: false,
  },
  {
    id: "3",
    name: "Bosch 500 Series",
    category: "Laundry",
    wattage: 500,
    hoursPerDay: 2,
    isOn: false,
  },
  {
    id: "4",
    name: "Samsung S90D/S90DD OLED",
    category: "Entertainment",
    wattage: 120,
    hoursPerDay: 5,
    isOn: true,
  },
  {
    id: "5",
    name: "Toshiba EM131A5C-BS",
    category: "Kitchen",
    wattage: 1000,
    hoursPerDay: 1,
    isOn: false,
  },
];

const Page = () => {
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newAppliance, setNewAppliance] = useState<Partial<Appliance>>({
    name: "",
    category: "Kitchen",
    wattage: 0,
    hoursPerDay: 0,
    isOn: false,
  });

  // Generate a unique ID for new appliances
  const generateUniqueId = (): string => {
    return (appliances.length > 0 ? Math.max(...appliances.map(a => parseInt(a.id))) + 1 : 1).toString();
  };

  // Calculate energy consumption (kWh per month)
  const calculateEnergyConsumption = (appliance: Appliance): number => {
    return (appliance.wattage / 1000) * appliance.hoursPerDay * 30;
  };

  // Handle form submission to add a new appliance
  const handleAddAppliance = () => {
    if (newAppliance.name && newAppliance.category && newAppliance.wattage && newAppliance.hoursPerDay) {
      setAppliances([
        ...appliances,
        {
          id: generateUniqueId(),
          ...newAppliance,
        } as Appliance,
      ]);
      setIsAddingNew(false);
      setNewAppliance({
        name: "",
        category: "Kitchen",
        wattage: 0,
        hoursPerDay: 0,
        isOn: false,
      });
    }
  };

  // Handle appliance deletion
  const handleDeleteAppliance = (id: string) => {
    setAppliances(appliances.filter((appliance) => appliance.id !== id));
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

        {/* Add Appliance Form */}
        {isAddingNew && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Appliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newAppliance.name}
                onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                className="p-2 border border-gray-300 rounded focus:outline-none"
              />
              <select
                value={newAppliance.category}
                onChange={(e) => setNewAppliance({ ...newAppliance, category: e.target.value as ApplianceCategory })}
                className="p-2 border border-gray-300 rounded focus:outline-none"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Laundry">Laundry</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Wattage"
                value={newAppliance.wattage}
                onChange={(e) => setNewAppliance({ ...newAppliance, wattage: Number(e.target.value) })}
                className="p-2 border border-gray-300 rounded focus:outline-none"
              />
              <input
                type="number"
                placeholder="Hours per Day"
                value={newAppliance.hoursPerDay}
                onChange={(e) => setNewAppliance({ ...newAppliance, hoursPerDay: Number(e.target.value) })}
                className="p-2 border border-gray-300 rounded focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddAppliance}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
            >
              Save Appliance
            </button>
          </div>
        )}

        {/* Appliance List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center relative">
              <button
                onClick={() => handleDeleteAppliance(appliance.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">{appliance.name}</h2>
              <p className="text-gray-600 text-sm">{appliance.category}</p>
              <p className="mt-1 text-sm">🔌 {appliance.wattage} W | ⏳ {appliance.hoursPerDay} hrs/day</p>
              <p className="mt-1 font-semibold">⚡ {calculateEnergyConsumption(appliance).toFixed(1)} kWh/month</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Appliances</h3>
            <p className="text-3xl font-bold text-gray-900">{appliances.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Monthly Energy Usage</h3>
            <p className="text-3xl font-bold text-gray-900">
              {appliances.reduce((total, appliance) => total + calculateEnergyConsumption(appliance), 0).toFixed(2)} kWh
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Estimated Monthly Cost</h3>
            <p className="text-3xl font-bold text-gray-900">
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