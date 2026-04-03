"use client";

import { useEffect, useRef } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getRefCode(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("tideline_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("tideline_sid", sid);
  }
  return sid;
}

async function trackEvent(
  eventType: string,
  eventData: Record<string, unknown> = {}
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const ref = getRefCode();
  const demoSite = window.location.hostname;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/demo_visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ref_code: ref,
        demo_site: demoSite,
        page_url: window.location.pathname,
        event_type: eventType,
        event_data: eventData,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      }),
    });
  } catch {
    // Silent fail — don't break the demo site
  }
}

export function DemoAnalytics() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Track pageview
    trackEvent("pageview");

    // Track time on site (at 30s, 60s, 120s)
    const timers = [30, 60, 120].map((seconds) =>
      setTimeout(
        () => trackEvent("time_on_site", { seconds }),
        seconds * 1000
      )
    );

    // Track scroll depth
    let maxDepth = 0;
    const onScroll = () => {
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight) *
          100
      );
      if (depth > maxDepth + 24) {
        maxDepth = depth;
        trackEvent("scroll_depth", { depth });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Track CTA clicks
    const onCtaClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="#contact"], button[type="submit"]');
      if (link) {
        trackEvent("cta_click", {
          text: link.textContent?.trim().slice(0, 50),
        });
      }
    };
    document.addEventListener("click", onCtaClick);

    // Track form interactions
    let formTracked = false;
    const onFormFocus = () => {
      if (!formTracked) {
        formTracked = true;
        trackEvent("form_interact");
      }
    };
    document
      .querySelectorAll("input, textarea")
      .forEach((el) => el.addEventListener("focus", onFormFocus, { once: true }));

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onCtaClick);
    };
  }, []);

  // Listen for theme switches from ThemeSwitcher
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          const theme =
            document.documentElement.getAttribute("data-theme") || "default";
          trackEvent("theme_switch", { theme });
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return null; // Invisible component
}
