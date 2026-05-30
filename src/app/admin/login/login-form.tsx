"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email) {
      setError('Enter your email above, then choose "Forgot password?".');
      return;
    }
    setPending(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/admin/reset-password` },
    );
    setPending(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Check your email for a password reset link.");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Admin sign in</CardTitle>
        <CardDescription>Allen Kenoyer Glass studio dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => void handleSignIn(event)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          {notice && <p className="text-muted-foreground text-sm">{notice}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => void handleForgotPassword()}
            disabled={pending}
          >
            Forgot password?
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
