import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
          404 · not found
        </p>
        <h1 className="font-display text-5xl text-mahogany mt-3">
          This page slipped past ARIA.
        </h1>
        <p className="mt-4 text-sm text-mahogany-soft">
          The route you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/" className="aria-btn-primary inline-flex">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust">
          something went wrong
        </p>
        <h1 className="font-display text-3xl text-mahogany mt-3">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-mahogany-soft">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="aria-btn-primary"
          >
            Try again
          </button>
          <Link to="/" className="px-4 py-2 rounded-lg border border-card-border text-sm text-mahogany hover:bg-warm-white transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ARIA — Adaptive Role Intelligence for Interviews" },
      {
        name: "description",
        content:
          "ARIA is a multi-agent AI mock interview coach. Interviewer, Evaluator, and Coach agents work together to deliver adaptive sessions with surgical feedback.",
      },
      { name: "author", content: "ARIA" },
      { property: "og:title", content: "ARIA — Adaptive Role Intelligence for Interviews" },
      {
        property: "og:description",
        content: "A multi-agent AI interview coach with adaptive difficulty and 30-day growth plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
