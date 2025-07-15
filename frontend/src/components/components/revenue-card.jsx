import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const RevenueCard = ({ title, revenue, month }) => {
  return (
    <Card className="w-full min-w-md">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between py-4">
        <div>
          <p className="text-3xl font-bold">{revenue.toFixed(2)}</p>
        </div>
        <div className="text-right text-gray-500">
          <p className="text-sm">{month}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueCard;
