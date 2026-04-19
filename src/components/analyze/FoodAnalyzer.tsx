import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Leaf, Droplets, Camera, Upload, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NutritionResult {
  name: string;
  serving: string;
  description?: string;
  confidence?: "low" | "medium" | "high";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  vitamins: { name: string; amount: string; pct: number }[];
  healthNotes?: string[];
}

const foodDatabase: Record<string, NutritionResult> = {
  banana: {
    name: "Banana",
    serving: "1 medium (118g)",
    calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14,
    vitamins: [
      { name: "Vitamin B6", amount: "0.4mg", pct: 25 },
      { name: "Vitamin C", amount: "10mg", pct: 11 },
      { name: "Potassium", amount: "422mg", pct: 12 },
      { name: "Manganese", amount: "0.3mg", pct: 14 },
    ],
  },
  avocado: {
    name: "Avocado",
    serving: "1/2 fruit (100g)",
    calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7,
    vitamins: [
      { name: "Vitamin K", amount: "26µg", pct: 26 },
      { name: "Folate", amount: "81µg", pct: 20 },
      { name: "Vitamin C", amount: "10mg", pct: 11 },
      { name: "Potassium", amount: "485mg", pct: 14 },
    ],
  },
  salmon: {
    name: "Salmon",
    serving: "100g cooked",
    calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0,
    vitamins: [
      { name: "Vitamin D", amount: "11µg", pct: 55 },
      { name: "Vitamin B12", amount: "2.8µg", pct: 117 },
      { name: "Omega-3", amount: "2.3g", pct: 0 },
      { name: "Selenium", amount: "40µg", pct: 57 },
    ],
  },
  egg: {
    name: "Egg",
    serving: "1 large (50g)",
    calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6,
    vitamins: [
      { name: "Vitamin B12", amount: "0.6µg", pct: 25 },
      { name: "Vitamin D", amount: "1µg", pct: 5 },
      { name: "Choline", amount: "147mg", pct: 27 },
      { name: "Selenium", amount: "15µg", pct: 22 },
    ],
  },
};

const popularSearches = ["Banana", "Avocado", "Salmon", "Egg"];

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food-image`;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const FoodAnalyzer = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analyze = (searchTerm: string) => {
    const key = searchTerm.toLowerCase().trim();
    const found = foodDatabase[key];
    if (found) {
      setResult(found);
      setNotFound(false);
      setImagePreview(null);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large. Please use one under 8 MB.");
      return;
    }

    setNotFound(false);
    setResult(null);
    setIsAnalyzingImage(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      setImagePreview(dataUrl);

      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Too many requests. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please add funds to your workspace.");
        else toast.error(err.error || "Failed to analyze image. Try a clearer photo.");
        return;
      }

      const data: NutritionResult = await resp.json();
      setResult(data);
      toast.success(`Analyzed: ${data.name}`);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong analyzing your photo.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="container py-8 pb-24 md:pb-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-display text-2xl text-foreground">Food Analyzer</h2>
        <p className="text-sm text-muted-foreground">Search a food or snap a photo of your meal for an AI breakdown</p>
      </div>

      {/* Image upload */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Analyze a meal photo with AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isAnalyzingImage}
            className="flex-1 rounded-xl gap-2"
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzingImage}
            className="flex-1 rounded-xl gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
        </div>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        />

        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border">
            <img src={imagePreview} alt="Meal preview" className="w-full max-h-64 object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            {isAnalyzingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing your meal...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze(query)}
            placeholder="Search a food (banana, avocado, salmon, egg)..."
            className="w-full rounded-xl border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button onClick={() => analyze(query)} className="rounded-xl px-6">
          Analyze
        </Button>
      </div>

      {/* Popular */}
      <div className="flex gap-2 flex-wrap">
        {popularSearches.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); analyze(s); }}
            className="rounded-full border bg-card px-4 py-1.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {notFound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-6 text-center"
        >
          <p className="text-muted-foreground">Food not found. Try: banana, avocado, salmon, egg — or upload a photo.</p>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.serving}</p>
                </div>
              </div>
              {result.confidence && (
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  result.confidence === "high" ? "border-primary text-primary" :
                  result.confidence === "medium" ? "border-warning text-warning" :
                  "border-muted-foreground text-muted-foreground"
                }`}>
                  {result.confidence} confidence
                </span>
              )}
            </div>

            {result.description && (
              <p className="text-sm text-muted-foreground mb-4 italic">{result.description}</p>
            )}

            {/* Macros */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Calories", value: result.calories, unit: "kcal", pct: (result.calories / 2200) * 100 },
                { label: "Protein", value: result.protein, unit: "g", pct: (result.protein / 130) * 100 },
                { label: "Carbs", value: result.carbs, unit: "g", pct: (result.carbs / 275) * 100 },
                { label: "Fat", value: result.fat, unit: "g", pct: (result.fat / 78) * 100 },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="font-display text-lg text-foreground">{m.value}<span className="text-xs font-body text-muted-foreground">{m.unit}</span></p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(m.pct, 100)}%` }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional */}
            <div className="flex gap-4 text-sm border-t pt-4">
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-info" />
                <span className="text-muted-foreground">Fiber: {result.fiber}g</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Sugar: {result.sugar}g</span>
              </div>
            </div>
          </div>

          {/* Vitamins */}
          {result.vitamins?.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h4 className="font-display text-lg text-foreground mb-4">Vitamins & Minerals</h4>
              <div className="space-y-3">
                {result.vitamins.map((v) => (
                  <div key={v.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.amount}</p>
                    </div>
                    {v.pct > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(v.pct, 100)}%` }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{v.pct}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Notes */}
          {result.healthNotes && result.healthNotes.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h4 className="font-display text-lg text-foreground mb-3">Health Insights</h4>
              <ul className="space-y-2">
                {result.healthNotes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FoodAnalyzer;
