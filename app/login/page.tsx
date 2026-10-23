import type { Metadata } from "next";
import { BookOpen, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/messages";

export const metadata: Metadata = { title: messages.login.title };

const t = messages.login;

// Placeholder for Checkpoint 1. Real sign-in (password, magic link, forgot password)
// is wired up in Phase 2, so the controls are disabled for now.
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-kb-sidebar px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center justify-center gap-2 text-small font-semibold">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <BookOpen className="size-4" strokeWidth={1.8} />
          </span>
          {messages.app.name}
        </div>

        <section className="rounded-xl border bg-background p-6 shadow-sm sm:p-8">
          <h1 className="text-heading font-semibold">{t.title}</h1>
          <p className="mt-1 text-small text-muted-foreground">{t.subtitle}</p>

          <p
            role="status"
            className="mt-5 flex gap-2 rounded-md bg-kb-role-bg px-3 py-2.5 text-caption text-kb-role-text"
          >
            <Info aria-hidden="true" className="mt-px size-4 shrink-0" strokeWidth={1.8} />
            {t.notReady}
          </p>

          <form className="mt-5 space-y-4" aria-describedby="invite-only">
            <fieldset disabled className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.password}</Label>
                  <span className="text-caption text-muted-foreground">{t.forgotPassword}</span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full">
                {t.submit}
              </Button>
              <div className="flex items-center gap-3 text-label text-kb-faint" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                {t.or}
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button type="button" variant="outline" className="h-11 w-full">
                <Mail strokeWidth={1.8} />
                {t.magicLink}
              </Button>
            </fieldset>
          </form>
        </section>

        <p id="invite-only" className="mt-4 text-center text-caption text-muted-foreground">
          {t.inviteOnly}
        </p>
      </div>
    </main>
  );
}
