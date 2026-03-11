// REFERENCE ONLY — predates Supabase persistence. Not mounted in product.

import { samplePosts } from "@/lib/sample-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PrayerFeed() {
  return (
    <Card className="h-fit overflow-hidden">
      <CardHeader className="border-b border-[var(--border)]/70">
        <Badge className="w-fit bg-[var(--accent)]/20 text-[var(--foreground)]">
          Community Feed
        </Badge>
        <CardTitle>Grateful and Struggling, kept in view.</CardTitle>
        <CardDescription>
          The feed stays filterable and prayer-centered, with no likes, no
          identities, and no social metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default">
            All
          </Button>
          <Button size="sm" variant="secondary">
            Grateful
          </Button>
          <Button size="sm" variant="ghost">
            Struggling
          </Button>
        </div>
        {samplePosts.map((post) => (
          <article
            key={post.id}
            className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge>{formatEmotionLabel(post.emotion)}</Badge>
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                {post.category}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--foreground)]">
              {post.message}
            </p>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
              <span>{post.translationLabel}</span>
              <span>{post.prayers.length} prayers</span>
            </div>
            <div className="mt-4 rounded-[1.25rem] bg-[var(--muted)]/45 p-4">
              {post.prayers.length > 0 ? (
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  {post.prayers[0].message}
                </p>
              ) : (
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  Waiting for the first prayer response.
                </p>
              )}
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

function formatEmotionLabel(emotion: "grateful" | "struggling") {
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}
