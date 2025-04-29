import { BarChartViewProps } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const BarChartView: React.FC<BarChartViewProps> = ({ data }) => {
  console.log({ data });

  const graphdata = []; //= //Object.entries(data);
  // console.log({ graphdata });
  for (const tag in data) {
    graphdata.push({
      tag: tag,
      // @ts-expect-error - Element implicitly has an 'any' type
      un: data[tag].filter((q) => q.answered === "no").length,
      // @ts-expect-error - Element implicitly has an 'any' type
      an: data[tag].filter((q) => q.answered === "yes").length,
    });
  }

  console.log({ graphdata });

  return (
    <ResponsiveContainer className="min-h-[30vh]">
      <BarChart
        width={500}
        height={300}
        data={graphdata}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tag" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* <Bar dataKey="un" stackId="a" fill="#de6060" accumulate="sum" /> */}
        <Bar
          dataKey="an"
          stackId="a"
          fill="#82ca9d"
          accumulate="sum"
          name="Answered"
          attributeName="att"
        />
        <Bar
          dataKey="un"
          stackId="a"
          fill="#de6060"
          accumulate="sum"
          name="Unanswered"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
