import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UtensilsCrossed, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  logged_at: string;
  category: string;
}

const quickAdd = [
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sugar: 14 },
  { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, sugar: 0 },
  { name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4, sugar: 0 },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 1, fiber: 0, sugar: 6 },
  { name: "Avocado (half)", calories: 120, protein: 1, carbs: 6, fat: 11, fiber: 5, sugar: 0 },
  { name: "Hard Boiled Egg", calories: 78, protein: 6, carbs: 1, fat: 5, fiber: 0, sugar: 1 },
];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const MealLogger = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Today only
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startOfDay.toISOString())
        .order("logged_at", { ascending: true });

      if (error) {
        toast.error("Failed to load meals");
      } else {
        setMeals((data || []) as Meal[]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const addMeal = async (item: typeof quickAdd[0]) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        name: item.name,
        category: "Snack",
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
      })
      .select()
      .single();

    if (error || !data) {
      toast.error("Failed to add meal");
      return;
    }
    setMeals((prev) => [...prev, data as Meal]);
    setShowQuickAdd(false);
    toast.success(`Logged ${item.name}`);
  };

  const removeMeal = async (id: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove meal");
      return;
    }
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const totalCals = meals.reduce((s, m) => s + Number(m.calories), 0);
  const totalProtein = meals.reduce((s, m) => s + Number(m.protein), 0);
  const totalCarbs = meals.reduce((s, m) => s + Number(m.carbs), 0);
  const totalFat = meals.reduce((s, m) => s + Number(m.fat), 0);

  return (
    <div className="container py-8 pb-24 md:pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground">Meal Log</h2>
          <p className="text-sm text-muted-foreground">Track what you eat today</p>
        </div>
        <Button onClick={() => setShowQuickAdd(!showQuickAdd)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Food
        </Button>
      </div>

      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-3">Quick Add</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickAdd.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => addMeal(item)}
                    className="text-left rounded-lg border bg-background p-3 hover:bg-secondary transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.calories} kcal · {item.protein}g protein</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: Math.round(totalCals), unit: "kcal" },
          { label: "Protein", value: Math.round(totalProtein), unit: "g" },
          { label: "Carbs", value: Math.round(totalCarbs), unit: "g" },
          { label: "Fat", value: Math.round(totalFat), unit: "g" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-card border p-4 text-center">
            <p className="font-display text-xl text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : meals.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No meals logged today. Tap “Add Food” to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <UtensilsCrossed className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{meal.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(meal.logged_at)}
                      <span>·</span>
                      <span>{meal.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{Math.round(Number(meal.calories))} kcal</p>
                    <p className="text-xs text-muted-foreground">P:{Math.round(Number(meal.protein))}g C:{Math.round(Number(meal.carbs))}g F:{Math.round(Number(meal.fat))}g</p>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MealLogger;
