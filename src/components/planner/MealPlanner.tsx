import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, Leaf, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  time: string;
}

interface DayPlan {
  day: string;
  meals: MealItem[];
}

const dietaryOptions = ["Balanced", "High Protein", "Low Carb", "Vegetarian", "Mediterranean"];

const planTemplates: Record<string, DayPlan[]> = {
  Balanced: [
    { day: "Monday", meals: [
      { name: "Oatmeal with berries & nuts", calories: 350, protein: 12, time: "Breakfast" },
      { name: "Grilled chicken caesar salad", calories: 480, protein: 38, time: "Lunch" },
      { name: "Baked salmon with roasted veggies", calories: 520, protein: 35, time: "Dinner" },
      { name: "Greek yogurt with honey", calories: 150, protein: 15, time: "Snack" },
    ]},
    { day: "Tuesday", meals: [
      { name: "Avocado toast with poached eggs", calories: 380, protein: 18, time: "Breakfast" },
      { name: "Turkey & avocado wrap", calories: 450, protein: 30, time: "Lunch" },
      { name: "Stir-fried tofu with brown rice", calories: 490, protein: 22, time: "Dinner" },
      { name: "Apple slices with almond butter", calories: 180, protein: 5, time: "Snack" },
    ]},
    { day: "Wednesday", meals: [
      { name: "Smoothie bowl with granola", calories: 320, protein: 14, time: "Breakfast" },
      { name: "Quinoa bowl with grilled veggies", calories: 460, protein: 18, time: "Lunch" },
      { name: "Herb-crusted chicken with sweet potato", calories: 550, protein: 40, time: "Dinner" },
      { name: "Mixed nuts & dried fruit", calories: 200, protein: 6, time: "Snack" },
    ]},
    { day: "Thursday", meals: [
      { name: "Whole grain pancakes with fruit", calories: 390, protein: 10, time: "Breakfast" },
      { name: "Lentil soup with crusty bread", calories: 420, protein: 20, time: "Lunch" },
      { name: "Grilled shrimp pasta primavera", calories: 510, protein: 32, time: "Dinner" },
      { name: "Cottage cheese with pineapple", calories: 140, protein: 14, time: "Snack" },
    ]},
    { day: "Friday", meals: [
      { name: "Veggie egg scramble", calories: 310, protein: 22, time: "Breakfast" },
      { name: "Poke bowl with brown rice", calories: 500, protein: 28, time: "Lunch" },
      { name: "Lean beef stir-fry with noodles", calories: 540, protein: 36, time: "Dinner" },
      { name: "Protein bar", calories: 190, protein: 20, time: "Snack" },
    ]},
    { day: "Saturday", meals: [
      { name: "Acai bowl with toppings", calories: 360, protein: 8, time: "Breakfast" },
      { name: "Mediterranean falafel plate", calories: 480, protein: 16, time: "Lunch" },
      { name: "Baked cod with quinoa pilaf", calories: 470, protein: 34, time: "Dinner" },
      { name: "Dark chocolate & almonds", calories: 170, protein: 4, time: "Snack" },
    ]},
    { day: "Sunday", meals: [
      { name: "French toast with fresh berries", calories: 400, protein: 12, time: "Breakfast" },
      { name: "Chicken noodle soup", calories: 380, protein: 26, time: "Lunch" },
      { name: "Grilled veggie flatbread pizza", calories: 490, protein: 18, time: "Dinner" },
      { name: "Hummus with veggie sticks", calories: 160, protein: 6, time: "Snack" },
    ]},
  ],
  "High Protein": [
    { day: "Monday", meals: [
      { name: "Egg white omelette with spinach", calories: 280, protein: 32, time: "Breakfast" },
      { name: "Double chicken breast salad", calories: 520, protein: 52, time: "Lunch" },
      { name: "Grilled steak with asparagus", calories: 560, protein: 48, time: "Dinner" },
      { name: "Whey protein shake", calories: 150, protein: 30, time: "Snack" },
    ]},
    { day: "Tuesday", meals: [
      { name: "Protein pancakes with banana", calories: 340, protein: 28, time: "Breakfast" },
      { name: "Tuna steak with mixed greens", calories: 480, protein: 45, time: "Lunch" },
      { name: "Turkey meatball pasta", calories: 540, protein: 42, time: "Dinner" },
      { name: "Cottage cheese with berries", calories: 160, protein: 22, time: "Snack" },
    ]},
    { day: "Wednesday", meals: [
      { name: "Scrambled eggs with smoked salmon", calories: 360, protein: 30, time: "Breakfast" },
      { name: "Grilled chicken & quinoa bowl", calories: 510, protein: 48, time: "Lunch" },
      { name: "Baked cod with lentils", calories: 480, protein: 40, time: "Dinner" },
      { name: "Greek yogurt with nuts", calories: 180, protein: 20, time: "Snack" },
    ]},
  ],
};

// Fill remaining diet types with balanced as fallback
for (const diet of dietaryOptions) {
  if (!planTemplates[diet]) planTemplates[diet] = planTemplates["Balanced"];
}

const MealPlanner = () => {
  const [selectedDiet, setSelectedDiet] = useState("Balanced");
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generatePlan = () => {
    setGenerating(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(planTemplates[selectedDiet]);
      setGenerating(false);
      setExpandedDay(planTemplates[selectedDiet][0]?.day || null);
    }, 1200);
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-2xl text-foreground">Meal Plan Generator</h2>
        <p className="text-sm text-muted-foreground">Get a personalized weekly meal plan based on your dietary preference</p>
      </motion.div>

      {/* Diet Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-card border p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg text-foreground">Dietary Preference</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((diet) => (
            <button
              key={diet}
              onClick={() => setSelectedDiet(diet)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                selectedDiet === diet
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-secondary"
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
        <Button onClick={generatePlan} disabled={generating} className="rounded-xl gap-2 w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Weekly Plan"}
        </Button>
      </motion.div>

      {/* Loading */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 gap-3"
        >
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Creating your personalized plan...</p>
        </motion.div>
      )}

      {/* Generated Plan */}
      <AnimatePresence>
        {plan && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {plan.map((dayPlan, i) => {
              const isExpanded = expandedDay === dayPlan.day;
              const totalCals = dayPlan.meals.reduce((s, m) => s + m.calories, 0);
              const totalProtein = dayPlan.meals.reduce((s, m) => s + m.protein, 0);

              return (
                <motion.div
                  key={dayPlan.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dayPlan.day)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-foreground">{dayPlan.day}</span>
                      <span className="text-xs text-muted-foreground">
                        {totalCals} kcal · {totalProtein}g protein
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {dayPlan.meals.map((meal) => (
                            <div
                              key={meal.name}
                              className="flex items-center justify-between rounded-lg bg-background border p-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{meal.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {meal.time}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                  <Flame className="h-3 w-3" />
                                  {meal.calories}
                                </div>
                                <p className="text-xs text-muted-foreground">{meal.protein}g protein</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealPlanner;
