import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);

    const { error } =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName || email.split("@")[0]);

    if (error) {
      toast.error(error);
      setSubmitting(false);
      return;
    }

    toast.success(mode === "signin" ? "Welcome back!" : "Account created 🌿");
    // Redirect handled by useEffect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-elegant"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl text-foreground">NutriSense</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane"
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
