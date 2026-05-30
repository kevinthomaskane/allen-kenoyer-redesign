"use client";

import { useEffect, useState, type FormEvent } from "react";
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

const LINK_ERROR =
  "This reset link is invalid or has expired. Request a new one from the sign-in page.";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // The recovery email links here with a PKCE `code`; exchange it for a session
  // so updateUser() below can set the new password (ADR-0006).
  useEffect(() => {
    const supabase = createClient();
    async function establishSession() {
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setLinkError(LINK_ERROR);
          setReady(true);
          return;
        }
      }
      const { data } = await supabase.auth.getClaims();
      if (!data?.claims) setLinkError(LINK_ERROR);
      setReady(true);
    }
    void establishSession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Choose a new password for your admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-muted-foreground text-sm">
              Verifying your reset link…
            </p>
          ) : linkError ? (
            <p role="alert" className="text-destructive text-sm">
              {linkError}
            </p>
          ) : (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Saving…" : "Save new password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
