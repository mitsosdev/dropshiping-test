# Spotify Music Player — Navbar Component

Add a compact Spotify embed player as a dropdown in the navbar. Clicking the music icon opens a mini Spotify widget. Music continues playing across page navigations and when the dropdown is closed.

## Requirements

- **Position**: Top-right navbar, between language toggle and cart icon
- **Behavior**: Click to toggle dropdown, click outside to close
- **Persistence**: Music keeps playing when dropdown closes or user navigates
- **Lazy load**: iframe loads on first open only, stays mounted after
- **Mobile**: Works on both desktop and mobile navbar
- **Dependencies**: `lucide-react` (Music icon), `tailwindcss`, `cn()` utility

## Setup

1. Copy `components/music-player.tsx` into the project
2. Set `SPOTIFY_URL` to your playlist/album/track link
3. Add `<MusicPlayer />` to your navbar

## Component: `components/music-player.tsx`

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Music } from "lucide-react";
import { cn } from "@/lib/general/utils";

/**
 * Set your Spotify playlist/album/track URL here.
 * Go to Spotify → right-click playlist → Share → Copy link
 * Example: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6"
 */
const SPOTIFY_URL = "https://open.spotify.com/playlist/YOUR_PLAYLIST_ID";

function getEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://open.spotify.com/embed${u.pathname}?utm_source=generator&theme=0`;
  } catch {
    return "";
  }
}

export function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!SPOTIFY_URL) return null;

  const embedUrl = getEmbedUrl(SPOTIFY_URL);
  if (!embedUrl) return null;

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!loaded) setLoaded(true);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-full transition-all duration-300",
          open
            ? "bg-terracotta/10 text-terracotta"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={open ? "Close music player" : "Open music player"}
      >
        <Music className="size-[16px]" strokeWidth={1.5} />
        {open && (
          <span className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-[2px]">
            <span className="inline-block h-[3px] w-[2px] animate-pulse rounded-full bg-terracotta" style={{ animationDelay: "0ms" }} />
            <span className="inline-block h-[3px] w-[2px] animate-pulse rounded-full bg-terracotta" style={{ animationDelay: "150ms" }} />
            <span className="inline-block h-[3px] w-[2px] animate-pulse rounded-full bg-terracotta" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </button>

      {loaded && (
        <div
          className={cn(
            "absolute right-0 top-12 z-50 w-[250px] overflow-hidden rounded-sm border border-border/40 bg-background shadow-lg transition-all duration-300",
            open
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          )}
        >
          <iframe
            src={embedUrl}
            width="250"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
            title="Spotify Player"
          />
        </div>
      )}
    </div>
  );
}
```

## Navbar Integration

```tsx
import { MusicPlayer } from "@/components/music-player";

// Desktop navbar (between language toggle and cart):
<MusicPlayer />
<div className="mx-1 h-4 w-px bg-border" />
<Link href="/cart">...</Link>

// Mobile navbar (before cart):
<MusicPlayer />
<Link href="/cart">...</Link>
```

## Customization

- **Size**: Change `w-[250px]` and `height="152"` for bigger/smaller widget
- **Colors**: Replace `bg-terracotta` with your brand accent color
- **URL types**: Works with playlists, albums, and single tracks
- **Theme**: Change `theme=0` to `theme=1` for dark Spotify embed
