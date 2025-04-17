"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    department: ""
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData();
    form.append("email", formData.email);
    form.append("department", formData.department);

    startTransition(async () => {
      const result = await authenticateUser(null, form);
      
      if (result.success) {
        router.push(result.redirect ?? '/');
      } else {
        setError(result.error || "Authentication failed");
      }
    });
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-deep-blue via-primary-blue to-secondary-blue">
      <div className="w-full max-w-md p-8 space-y-8 glass-container">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-light">
            Welcome Back
          </h2>
          <p className="mt-2 text-lg text-text-muted">
            Please sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 backdrop-blur-sm rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" 
                   className="block text-sm font-medium text-text-light">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              className={cn(
                "w-full px-3 py-2 rounded-md",
                "bg-surface backdrop-blur-md",
                "border border-white/10",
                "text-text-light placeholder-text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isPending}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="department" 
                   className="block text-sm font-medium text-text-light">
              Department
            </label>
            <select
              id="department"
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                department: e.target.value
              }))}
              className={cn(
                "w-full px-3 py-2 rounded-md",
                "bg-surface backdrop-blur-md",
                "border border-white/10",
                "text-text-light",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isPending}
            >
              <option value="">Select department</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full",
              "bg-accent-blue hover:bg-accent-blue/80",
              "text-text-light"
            )}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
