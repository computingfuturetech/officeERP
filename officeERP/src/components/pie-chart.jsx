import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';


export default function PieCharts() {
  return (
    <>
        <PieChart
        series={[
            {
            data: [],
            innerRadius: 30,
            outerRadius: 100,
            paddingAngle: 5,
            cornerRadius: 5,
            startAngle: -45,
            endAngle: 225,
            cx: 150,
            cy: 150,
            }
        ]}
        />
</>
  );
}