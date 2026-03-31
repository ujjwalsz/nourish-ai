import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", calories: 1920, protein: 102, carbs: 230, fat: 65 },
  { day: "Tue", calories: 2100, protein: 118, carbs: 248, fat: 72 },
  { day: "Wed", calories: 1750, protein: 95, carbs: 195, fat: 58 },
  { day: "Thu", calories: 2250, protein: 130, carbs: 260, fat: 78 },
  { day: "Fri", calories: 1980, protein: 108, carbs: 220, fat: 68 },
  { day: "Sat", calories: 2400, protein: 98, carbs: 310, fat: 85 },
  { day: "Sun", calories: 1850, protein: 95, carbs: 210, fat: 62 },
];

const monthlyData = [
  { week: "Week 1", calories: 2020, protein: 108, carbs: 240, fat: 70 },
  { week: "Week 2", calories: 1950, protein: 112, carbs: 225, fat: 66 },
  { week: "Week 3", calories: 2100, protein: 120, carbs: 250, fat: 72 },
  { week: "Week 4", calories: 1890, protein: 105, carbs: 218, fat: 64 },
];

const macroBreakdown = [
  { name: "Protein", value: 108, color: "hsl(153, 50%, 25%)" },
  { name: "Carbs", value: 230, color: "hsl(200, 80%, 50%)" },
  { name: "Fat", value: 68, color: "hsl(38, 92%, 50%)" },
];

type Range = "weekly" | "monthly";

const NutritionCharts = () => {
  const [range, setRange] = useState<Range>("weekly");
  const data = range === "weekly" ? weeklyData : monthlyData;
  const xKey = range === "weekly" ? "day" : "week";

  const avgCalories = Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length);
  const avgProtein = Math.round(data.reduce((s, d) => s + d.protein, 0) / data.length);

  return (
    <div className="container py-8 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display text-2xl text-foreground">Nutrition Trends</h2>
          <p className="text-sm text-muted-foreground">Track your eating patterns over time</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={range === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("weekly")}
            className="rounded-xl"
          >
            Weekly
          </Button>
          <Button
            variant={range === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("monthly")}
            className="rounded-xl"
          >
            Monthly
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-card border p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Avg Calories</span>
          </div>
          <p className="font-display text-2xl text-foreground">{avgCalories} <span className="text-sm font-body text-muted-foreground">kcal/day</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-card border p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Avg Protein</span>
          </div>
          <p className="font-display text-2xl text-foreground">{avgProtein} <span className="text-sm font-body text-muted-foreground">g/day</span></p>
        </motion.div>
      </div>

      {/* Calorie Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-card border p-5"
      >
        <h3 className="font-display text-lg text-foreground mb-4">Calorie Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(153, 50%, 25%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(153, 50%, 25%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(143, 20%, 85%)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
            <Tooltip
              contentStyle={{
                background: "hsl(45, 25%, 95%)",
                border: "1px solid hsl(143, 20%, 85%)",
                borderRadius: "0.75rem",
                fontSize: 13,
              }}
            />
            <Area type="monotone" dataKey="calories" stroke="hsl(153, 50%, 25%)" fill="url(#calGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Macro Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-card border p-5"
        >
          <h3 className="font-display text-lg text-foreground mb-4">Macro Split (avg)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {macroBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {macroBreakdown.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                {m.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Protein Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl bg-card border p-5"
        >
          <h3 className="font-display text-lg text-foreground mb-4">Protein Intake</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(143, 20%, 85%)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 10%, 45%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(45, 25%, 95%)",
                  border: "1px solid hsl(143, 20%, 85%)",
                  borderRadius: "0.75rem",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="protein" fill="hsl(153, 50%, 25%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default NutritionCharts;
