import React from "react";
import { OverviewCard } from "../(home)/_components/overview-cards/card";
import { EnergyIcon, DollarIcon, HomeIcon } from "@/assets/icons";
import { PaymentsOverview } from "@/components/Charts/payments-overview";
import Chatbot from "@/components/Chatbot/chatbot";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 px-6 pb-6 pt-2">
      {/* Top Section with Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          label="Current Monthly Usage"
          data={{ value: "350 kWh", growthRate: 5 }}
          Icon={EnergyIcon}
        />
        <OverviewCard
          label="Estimated Monthly Cost"
          data={{ value: "$124.50", growthRate: 3 }}
          Icon={DollarIcon}
        />
        <OverviewCard
          label="Comparison with Similar Households"
          data={{ value: "-12%", growthRate: -12 }}
          Icon={HomeIcon}
        />
      </div>

      {/* Bottom Section with Chart and Chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="p-4 border rounded-lg shadow bg-white max-h-[550px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Energy Consumption Trend</h2>
          <div className="flex-grow">
            <PaymentsOverview 
              timeFrame="monthly"
            />
          </div>
        </div>

        {/* Chat Section */}
        <div className="max-h-[550px] flex flex-col">
          <Chatbot />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;