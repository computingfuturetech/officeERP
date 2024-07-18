import React, { useState } from "react";
import { LineChart } from "@mui/x-charts";
import CustomDropdown from "./custom_dropdown";
import "./style/lineChart.css";

export default function BasicLineChart() {
  const [selectedSeries, setSelectedSeries] = useState([
    "HBL",
    "MCB",
    "UBL",
    "BOP",
  ]);

  const allSeries = {
    HBL: {
      data: [2, 5.5, 2, 8.5, 1.5, 5, 4, 3.5, 5, 3.5, 5.5, 1],
      color: "red",
      showMark: false,
      label: "HBL",
    },
    MCB: {
      data: [3, 2.5, 3, 7.5, 4.5, 4, 2, 5.5, 2, 8.5, 1.5, 5],
      showMark: false,
      color: "green",
      label: "MCB",
    },
    UBL: {
      data: [4, 3.5, 5, 3.5, 5.5, 1, 3, 2.5, 3, 7.5, 4.5, 4],
      showMark: false,
      color: "blue",
      label: "UBL",
    },
    BOP: {
      data: [5, 4, 2, 5.5, 2, 8.5, 1.5, 5, 4, 3.5, 5, 3.5],
      showMark: false,
      color: "yellow",
      label: "BOP",
    },
    Alfalah: {
      data: [5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2],
      showMark: false,
      color: "purple",
      label: "Alfalah",
    },
    Suneri: {
      data: [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4],
      showMark: false,
      color: "orange",
      label: "Suneri",
    },
    JS: {
      data: [3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4],
      showMark: false,
      color: "pink",
      label: "JS",
    },
    Dubai: {
      data: [5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2],
      showMark: false,
      color: "black",
      label: "Dubai",
    },
    Qarz: {
      data: [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4],
      showMark: false,
      color: "grey",
      label: "Qarz",
    },
  };

  const handleCheckboxChange = (label) => {
    setSelectedSeries((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="line-chart">
      <CustomDropdown
        options={allSeries}
        selectedOptions={selectedSeries}
        onChange={handleCheckboxChange}
      />
      <LineChart
        sx={{
          background: "#F9FAFC",
          borderRadius: "8px",
        }}
        slotProps={{
          tooltip: { anchor: "center" },
          legend: { itemMarkHeight: 4, itemMarkWidth: 4, labelStyle: { fontSize: 12 }

          },
        }}
        colors={["#0050c8"]}
        xAxis={[
          {
            data: [0, 2, 3, 5, 8, 10, 12, 14, 16, 18, 20, 22],
          },
        ]}
        series={selectedSeries.map((key) => allSeries[key])}
        height={300}
      />
    </div>
  );
}
