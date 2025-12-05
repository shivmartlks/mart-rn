import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "../components/ui/button";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setError(error.message);
    if (data?.user) onLogin(data.user);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-app px-4">
      <Card className="w-full max-w-sm border border-gray-200 shadow-card rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-text-primary font-semibold">
            Login to Shiv Mart
          </CardTitle>

          <CardDescription className="text-text-secondary">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-2">
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  bg-white
                  border border-border 
                  text-text-primary 
                  placeholder:text-text-muted
                  w-full 
                  p-3 
                  rounded-xl
                  focus:outline-none
                  focus:ring-2 
                  focus:ring-primary
                  transition
                "
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  bg-white
                  border border-border 
                  text-text-primary 
                  placeholder:text-text-muted
                  w-full 
                  p-3 
                  rounded-xl
                  focus:outline-none
                  focus:ring-2 
                  focus:ring-primary
                  transition
                "
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-danger text-sm mt-1">{error}</p>}

            {/* Login Button */}
            <Button
              size="large"
              type="submit"
              className="bg-black-800 hover:bg-black-900 text-white"
            >
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center mt-2">
          <p className="text-sm text-text-secondary">
            Don’t have an account? <Button block>Sign Up</Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
