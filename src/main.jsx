import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabase";
import "./styles.css";
import "./rich.css";

const interests = [
  "Beaches",
  "Food & cafes",
  "Culture",
  "Nightlife",
  "Nature",
  "Wellness",
];

const dreamPlaces = [
  {
    id: "goa",
    name: "Goa",
    location: "India",
    vibe: "Golden beaches, slow evenings and sunset cafes.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
    matchTags: ["Beaches", "Food & cafes", "Nightlife"],
  },
  {
    id: "paris",
    name: "Paris",
    location: "France",
    vibe: "Museum mornings, quiet cafes and romantic walks.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85",
    matchTags: ["Culture", "Food & cafes", "Wellness"],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    location: "Japan",
    vibe: "Neon streets, design detail and deep local flavour.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=85",
    matchTags: ["Culture", "Food & cafes", "Nightlife"],
  },
  {
    id: "manali",
    name: "Manali",
    location: "India",
    vibe: "Mountain air, nature days and gentler adventure.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85",
    matchTags: ["Nature", "Wellness", "Food & cafes"],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    location: "India",
    vibe: "Heritage, colour and bold local experiences.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=85",
    matchTags: ["Culture", "Food & cafes", "Nature"],
  },
];

const futureTrips = [
  { id: 1, dest: "Goa, India", date: "Oct 12 - Oct 15", mood: "Sunny coast + cafe hop", cost: "₹38,000" },
  { id: 2, dest: "Paris, France", date: "Nov 04 - Nov 10", mood: "Museum mood + slow travel", cost: "₹78,000" },
  { id: 3, dest: "Manali, India", date: "Dec 12 - Dec 16", mood: "Mountain reset + warm food", cost: "₹43,000" },
];

const pastTrips = [
  { id: 11, dest: "Jaipur, India", date: "May 02 - May 06", mood: "Culture + food trail", cost: "₹31,000" },
  { id: 12, dest: "Tokyo, Japan", date: "Feb 18 - Feb 25", mood: "Nightlife + art walk", cost: "₹92,000" },
];

const quickPrompts = [
  "Where should I go for a beach + food trip?",
  "Can you help me save for a dreamy getaway?",
  "What's the best low-cost 3-day itinerary?",
];

const guides = {
  goa: {
    weather: "28° and clear",
    stay: "Candolim",
    places: ["Sunset coastal walk", "Kayaking & beach time", "Old Goa heritage trail"],
  },
  jaipur: {
    weather: "26° and sunny",
    stay: "Civil Lines",
    places: ["Amber Fort at golden hour", "Pink City food trail", "Artisan workshop & bazaars"],
  },
  manali: {
    weather: "14° and crisp",
    stay: "Old Manali",
    places: ["Riverside arrival walk", "Solang Valley adventure day", "Cafe trail & local market"],
  },
  tokyo: {
    weather: "19° and bright",
    stay: "Shibuya",
    places: ["Lantern-lit arrival walk", "Neighbourhood food crawl", "Art, gardens & coffee"],
  },
  paris: {
    weather: "18° and mild",
    stay: "Le Marais",
    places: ["Seine sunset walk", "Museum and cafe day", "Montmartre at your pace"],
  },
};

const title = (value) => value.trim().split(",")[0] || "Your destination";

const ACCOUNT_STORAGE_KEY = "voyagr-account";
const SESSION_STORAGE_KEY = "voyagr-session";
const GOOGLE_LOGIN_ENABLED = import.meta.env.VITE_SUPABASE_GOOGLE_ENABLED === "true";
const GITHUB_LOGIN_ENABLED = import.meta.env.VITE_SUPABASE_GITHUB_ENABLED === "true";

function readStoredAccount() {
  try {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readStoredSession() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) === "active";
  } catch {
    return false;
  }
}

function getGuide(dest) {
  const key = Object.keys(guides).find((place) => dest.toLowerCase().includes(place));
  return (
    guides[key] || {
      weather: "Great travel weather",
      stay: `Central ${title(dest)}`,
      places: [
        `Settle into ${title(dest)}`,
        "Explore local highlights",
        "A flexible day at your pace",
      ],
    }
  );
}

function makePlan(dest, low) {
  const g = getGuide(dest);
  const city = title(dest);
  const total = low ? 28200 : 35600;
  const flight = low ? "Smart fare selected" : "Best-value flight selected";
  const hotel = low ? `${g.stay} Select` : `The ${g.stay} House`;
  const costs = low ? [5200, 3900, 3300] : [7400, 5100, 4500];

  return {
    total,
    flight,
    hotel,
    g,
    days: g.places.map((place, index) => [
      place,
      costs[index],
      [
        [
          "09:30",
          index ? "A considered start" : "Arrive and check in",
          index ? `A relaxed morning in ${city}` : `Welcome to ${city}`,
        ],
        [
          "12:30",
          index === 1 ? "Local experience" : "Lunch worth lingering over",
          index === 1 ? "Matched to your interests" : "A locally loved table",
        ],
        ["16:30", place, "Routes kept below your daily pace"],
        [
          "20:00",
          index === 2 ? "A calm final evening" : "Dinner and free time",
          "Flexible, based on your mood",
        ],
      ],
    ]),
  };
}

function App() {
  const [account, setAccount] = useState(() => readStoredAccount());
  const [authMode, setAuthMode] = useState(() => (readStoredAccount() ? "login" : "choice"));
  const [loggedIn, setLoggedIn] = useState(() => readStoredSession());
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authMethod, setAuthMethod] = useState("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedDestination, setSelectedDestination] = useState(dreamPlaces[0]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [userName, setUserName] = useState("Aarav");
  const [email, setEmail] = useState(() => readStoredAccount()?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [from, setFrom] = useState("Mumbai, India");
  const [dest, setDest] = useState("Goa, India");
  const [start, setStart] = useState("2026-10-12");
  const [end, setEnd] = useState("2026-10-15");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState(40000);
  const [hotelStyle, setHotelStyle] = useState("Boutique");
  const [pace, setPace] = useState("Easy");
  const [transport, setTransport] = useState("Private car");
  const [chosen, setChosen] = useState(["Beaches", "Food & cafes"]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(0);
  const [low, setLow] = useState(false);
  const [rev, setRev] = useState(0);
  const [approved, setApproved] = useState(false);
  const [enthusiasm, setEnthusiasm] = useState(74);
  const [savedPlaces, setSavedPlaces] = useState(["goa", "paris", "tokyo"]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      from: "bot",
      text: "Hi, I'm your travel assistant. Tell me the vibe you want: beaches, culture, quieter stays, or a mini budget plan.",
    },
  ]);

  const plan = useMemo(() => makePlan(dest, low), [dest, low]);
  const city = title(dest);
  const remain = Math.max(0, budget - plan.total);

  useEffect(() => {
    if (!supabase) return;

    const restoreSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profileName =
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "Traveler";

        setUserName(profileName);
        setEmail(session.user.email || "");
        setAccount({ name: profileName, email: session.user.email || "", password: "" });
        setLoggedIn(true);
        localStorage.setItem(SESSION_STORAGE_KEY, "active");
      }
    };

    restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profileName =
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "Traveler";

        setUserName(profileName);
        setEmail(session.user.email || "");
        setLoggedIn(true);
        localStorage.setItem(SESSION_STORAGE_KEY, "active");
      } else {
        setLoggedIn(false);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const visibleSaved = useMemo(
    () =>
      dreamPlaces
        .map((place) => ({
          ...place,
          score: Math.min(
            100,
            42 + place.matchTags.filter((tag) => chosen.includes(tag)).length * 18,
          ),
          saved: savedPlaces.includes(place.id),
        }))
        .sort((a, b) => b.score - a.score),
    [chosen, savedPlaces],
  );

  const toggleInterest = (tag) => {
    setChosen((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const savePlace = async (id) => {
    setSavedPlaces((items) => {
      const exists = items.includes(id);
      setEnthusiasm((value) => Math.min(100, Math.max(0, value + (exists ? -6 : 8))));
      return exists ? items.filter((item) => item !== id) : [id, ...items];
    });

    if (supabase && loggedIn) {
      try {
        const place = dreamPlaces.find((item) => item.id === id);
        if (!place) return;

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) return;

        await supabase.from("saved_places").upsert(
          {
            user_id: user.id,
            place_id: id,
            place_name: place.name,
            location: place.location,
            image: place.image,
            vibe: place.vibe,
          },
          { onConflict: "user_id,place_id" },
        );
      } catch (error) {
        console.warn("Saved place sync skipped while Supabase tables are not configured yet.", error);
      }
    }
  };

  const buildPlan = (economy = low) => {
    const nextBoost = Math.min(100, 52 + chosen.length * 8 + (economy ? 3 : 0));
    setEnthusiasm(nextBoost);
    setLoading(true);
    setApproved(false);

    setTimeout(() => {
      setLow(economy);
      setDay(0);
      setShow(true);
      setLoading(false);
      setTimeout(() => {
        document.querySelector("#plan")?.scrollIntoView({ behavior: "smooth" });
      }, 30);
    }, 1000);
  };

  const replan = () => {
    setBudget((value) => Math.max(30000, Math.round((value * 0.8) / 100) * 100));
    setRev((value) => value + 1);
    buildPlan(true);
  };

  const handleGoogleLogin = async () => {
    if (!GOOGLE_LOGIN_ENABLED || !supabase) {
      setAuthError("Google sign-in is not enabled yet. Use email or OTP to continue for now.");
      return;
    }

    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin || "https://voyagr-travel-planner.vercel.app",
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  const handleGithubLogin = async () => {
    if (!GITHUB_LOGIN_ENABLED || !supabase) {
      setAuthError("GitHub sign-in is not enabled yet. Use email or OTP to continue for now.");
      return;
    }

    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin || "https://voyagr-travel-planner.vercel.app",
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail);

    setAuthError("");
    setAuthNotice("");

    if (!validEmail) {
      setAuthError("Enter a valid email address to receive your one-time passcode.");
      return;
    }

    if (!supabase) {
      setOtpSent(true);
      setAuthNotice("Demo mode is active. Use the email and password flow until Supabase is fully configured.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setOtpSent(true);
    setAuthNotice("A one-time passcode has been sent to your email.");
  };

  const handleOtpVerify = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    setAuthError("");
    setAuthNotice("");

    if (!normalizedEmail || otpCode.trim().length < 6) {
      setAuthError("Enter the 6-digit code sent to your email.");
      return;
    }

    if (!supabase) {
      setLoggedIn(true);
      setUserName("Traveler");
      setPage("home");
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otpCode.trim(),
      type: "email",
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    const profileName =
      data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Traveler";

    setUserName(profileName);
    setEmail(data.user.email || normalizedEmail);
    setLoggedIn(true);
    setAccount({ name: profileName, email: data.user.email || normalizedEmail, password: "" });
    localStorage.setItem(SESSION_STORAGE_KEY, "active");
    setPage("home");
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail);

    setAuthError("");
    setAuthNotice("");

    if (!validEmail) {
      setAuthError("Enter a valid email address, like hello@example.com.");
      return;
    }

    if (authMethod === "otp") {
      if (otpCode.trim().length < 6) {
        setAuthError("Enter the 6-digit code sent to your email.");
        return;
      }
      await handleOtpVerify(event);
      return;
    }

    if (supabase) {
      if (authMode === "signup") {
        if (userName.trim().length < 2) {
          setAuthError("Enter your full name to create your account.");
          return;
        }

        if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
          setAuthError("Your password must be at least 8 characters and include a letter and a number.");
          return;
        }

        if (password !== confirmPassword) {
          setAuthError("The passwords do not match. Check them and try again.");
          return;
        }

        const redirectTarget = window.location.origin || "https://voyagr-travel-planner.vercel.app";

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectTarget,
            data: {
              full_name: userName.trim(),
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (data?.user) {
          setAccount({ name: userName.trim(), email: normalizedEmail, password: "" });
        }

        setEmail(normalizedEmail);
        setPassword("");
        setConfirmPassword("");
        setAuthMode("login");
        setAuthNotice("Account created. Check your inbox to confirm and then sign in.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      const profileName =
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "Traveler";

      setUserName(profileName);
      setEmail(data.user.email || normalizedEmail);
      setLoggedIn(true);
      setAccount({ name: profileName, email: data.user.email || normalizedEmail, password: "" });
      localStorage.setItem(SESSION_STORAGE_KEY, "active");
      setPage("home");
      return;
    }

    if (authMode === "signup") {
      if (userName.trim().length < 2) {
        setAuthError("Enter your full name to create your account.");
        return;
      }

      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        setAuthError("Your password must be at least 8 characters and include a letter and a number.");
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("The passwords do not match. Check them and try again.");
        return;
      }

      const nextAccount = { name: userName.trim(), email: normalizedEmail, password };
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(nextAccount));
      setAccount(nextAccount);
      setEmail(normalizedEmail);
      setPassword("");
      setConfirmPassword("");
      setAuthMode("login");
      setAuthNotice("Your account is ready. Log in to start planning.");
      return;
    }

    if (!account) {
      setAuthError("We couldn't find an account yet. Choose New to create one first.");
      return;
    }

    if (account.email !== normalizedEmail || account.password !== password) {
      setAuthError("That email and password combination is not recognised.");
      return;
    }

    setUserName(account.name);
    setEmail(account.email);
    setLoggedIn(true);
    localStorage.setItem(SESSION_STORAGE_KEY, "active");
    setPage("home");
  };

  const openDestination = (place) => {
    setSelectedDestination(place);
    setDest(`${place.name}, ${place.location}`);
    setPage("destination");
    setProfileOpen(false);
  };

  const startPreferenceFlow = () => {
    setPage("preferences");
    setProfileOpen(false);
  };

  const launchPlanner = () => {
    setPage("planner");
    setShow(false);
    setTimeout(() => buildPlan(), 40);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setLoggedIn(false);
    setAuthMode("choice");
    setProfileOpen(false);
    setPassword("");
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const handleAssistantSend = async (event) => {
    event.preventDefault();
    const value = assistantInput.trim();

    if (!value) return;

    const search = value.toLowerCase();
    let reply = "I’d suggest a balanced route with a little room for slow travel and local flavour.";

    if (search.includes("beach") || search.includes("coast")) {
      reply = "Goa fits your beach and cafe mood best. You could combine sunset walks, beach time, and a local food trail without changing your budget too much.";
    } else if (search.includes("culture") || search.includes("heritage")) {
      reply = "Jaipur or Paris will give you the culture boost you want. I’d time museum blocks and a slow evening around the city centre.";
    } else if (search.includes("budget") || search.includes("save")) {
      reply = "The strongest budget move is to reduce the flight category first, then keep your stay near a walkable area so your daily spend stays low.";
    } else if (search.includes("3 day") || search.includes("three day")) {
      reply = "A three-day plan should keep one anchor destination, one local food moment, and one slow evening. That makes it feel memorable without feeling rushed.";
    }

    setAssistantMessages((current) => [
      ...current,
      { from: "user", text: value },
      { from: "bot", text: "Thinking..." },
    ]);
    setAssistantInput("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: value,
          destination: city,
          interests: chosen,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.reply) {
          reply = result.reply;
        }
      }
    } catch (error) {
      console.warn("Assistant backend unavailable, using local fallback travel response.", error);
    }

    setAssistantMessages((current) => {
      const previous = current.slice(0, -1);
      return [
        ...previous,
        { from: "bot", text: reply },
      ];
    });
  };

  if (!loggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-copy">
            <span className="auth-badge">VOYAGR</span>
            <h1>Plan better. Save smarter. Travel brighter.</h1>
            <p>
              Build your dream guide with saved places, budget-aware plans, and a personal assistant that keeps your motivation high.
            </p>
            <ul>
              <li>Smart trip planner</li>
              <li>Saved dream destinations</li>
              <li>Past + future trip tracking</li>
            </ul>
          </div>

          <div className="auth-panel">
            {authMode === "choice" ? (
              <div className="auth-choice">
                <p className="eyebrow">WELCOME TO VOYAGR</p>
                <h2>Have you used Voyagr before?</h2>
                <p className="auth-subtitle">Choose the path that fits you. You can always come back here later.</p>
                <div className="choice-actions">
                  <button
                    type="button"
                    className="choice-card"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                      setAuthNotice("");
                    }}
                  >
                    <span className="choice-icon">✦</span>
                    <span>
                      <b>I'm new here</b>
                      <small>Create an account and save your first trip.</small>
                    </span>
                    <strong>→</strong>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setAuthNotice("");
                    }}
                  >
                    <span className="choice-icon">↗</span>
                    <span>
                      <b>I already have an account</b>
                      <small>Log in and continue planning.</small>
                    </span>
                    <strong>→</strong>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="back-auth"
                  onClick={() => {
                    setAuthMode("choice");
                    setAuthError("");
                    setAuthNotice("");
                  }}
                >
                  ← Back to welcome
                </button>
                <p className="eyebrow">{authMode === "login" ? "WELCOME BACK" : "CREATE YOUR ACCOUNT"}</p>
                <h2>{authMode === "login" ? "Log in to your trips." : "Start planning smarter."}</h2>
                <p className="auth-subtitle">
                  {authMode === "login"
                    ? "Use the email and password you registered with."
                    : "Your account keeps saved places, plans and travel history together."}
                </p>

                {authNotice && <p className="auth-notice">{authNotice}</p>}
                {authError && <p className="auth-error" role="alert">{authError}</p>}

                <div className="social-actions">
                  <button
                    type="button"
                    className={GOOGLE_LOGIN_ENABLED ? "social-button google" : "social-button google disabled"}
                    onClick={handleGoogleLogin}
                    disabled={!GOOGLE_LOGIN_ENABLED}
                  >
                    <span>G</span>
                    {GOOGLE_LOGIN_ENABLED ? "Continue with Google" : "Google login coming soon"}
                  </button>
                  <button
                    type="button"
                    className={GITHUB_LOGIN_ENABLED ? "social-button github" : "social-button github disabled"}
                    onClick={handleGithubLogin}
                    disabled={!GITHUB_LOGIN_ENABLED}
                  >
                    <span>◌</span>
                    {GITHUB_LOGIN_ENABLED ? "Continue with GitHub" : "GitHub login coming soon"}
                  </button>
                </div>

                <div className="provider-note">
                  Use email or OTP for now. Google and GitHub can be enabled from Supabase when ready.
                </div>

                <div className="divider"><span>or use email</span></div>

                {authMethod === "otp" ? (
                  <form onSubmit={handleOtpVerify} className="auth-form">
                    <label>
                      Email address
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label>
                      One-time code
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                      />
                    </label>

                    <button type="button" className="secondary full-width" onClick={handleSendOtp}>
                      {otpSent ? "Resend code" : "Send code"}
                    </button>

                    {!otpSent && (
                      <p className="mini-hint">Enter your email and tap “Send code” to generate the one-time password.</p>
                    )}

                    <button type="submit" className="primary auth-submit">
                      Verify and continue
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAuth} className="auth-form">
                    {authMode === "signup" && (
                      <label>
                        Full name
                        <input
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Aarav Mehta"
                          autoComplete="name"
                          required
                        />
                      </label>
                    )}

                    <label>
                      Email address
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label>
                      Password
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        autoComplete={authMode === "login" ? "current-password" : "new-password"}
                        minLength={8}
                        required
                      />
                    </label>

                    {authMode === "signup" && (
                      <label>
                        Confirm password
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                      </label>
                    )}

                    <button type="submit" className="primary auth-submit">
                      {authMode === "login" ? "Log in securely" : "Create my account"}
                    </button>
                  </form>
                )}

                <div className="otp-toggle-wrap">
                  <button
                    type="button"
                    className={authMethod === "email" ? "mini-link active" : "mini-link"}
                    onClick={() => {
                      setAuthMethod("email");
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                  >
                    Password login
                  </button>
                  <button
                    type="button"
                    className={authMethod === "otp" ? "mini-link active" : "mini-link"}
                    onClick={() => {
                      setAuthMethod("otp");
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                  >
                    Use OTP
                  </button>
                </div>

                <p className="auth-switch">
                  {authMode === "login" ? "New to Voyagr?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "signup" : "login");
                      setAuthError("");
                      setAuthNotice("");
                    }}
                  >
                    {authMode === "login" ? "Create one" : "Log in"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <div className="brand soft-brand">
          <span className="brand-mark">✦</span> voyagr
        </div>

        <nav className="rail-nav">
          {[
            ["home", "Overview"],
            ["preferences", "Build a trip"],
            ["trips", "My trips"],
            ["saved", "Saved places"],
            ["assistant", "Travel assistant"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={page === key ? "rail-link active" : "rail-link"}
              onClick={() => setPage(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button type="button" className="rail-user-card" onClick={() => setProfileOpen((value) => !value)}>
          <span className="avatar large">{userName.slice(0, 2).toUpperCase()}</span>
          <div>
            <b>{userName}</b>
            <small>{email || "traveler@voyagr.app"}</small>
          </div>
          <span className="profile-chevron">⌄</span>
        </button>
        {profileOpen && (
          <div className="profile-menu">
            <div>
              <b>{userName}</b>
              <small>Traveler profile</small>
            </div>
            <button type="button" onClick={() => setPage("assistant")}>Help & support</button>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        )}
      </aside>

      <main className="workspace">
        {page === "home" && (
          <section className="home-screen">
            <div className="home-hero">
              <div className="hero-copy">
                <p className="eyebrow">GOOD MORNING, {userName.toUpperCase()}</p>
                <h1>Where will your next story begin?</h1>
                <p>Turn the places you daydream about into a trip that feels possible, personal, and worth saving for.</p>
                <div className="hero-actions">
                  <button type="button" className="primary" onClick={startPreferenceFlow}>Plan a new escape <span>→</span></button>
                  <button type="button" className="text-link" onClick={() => setPage("trips")}>View my journeys</button>
                </div>
              </div>
              <div className="hero-photo">
                <img src={dreamPlaces[0].image} alt="Goa coastline" />
                <div className="hero-photo-label"><span>Next on your list</span><b>Goa, India</b><small>Beach days · 3 nights</small></div>
              </div>
            </div>

            <div className="home-section-heading">
              <div><p className="eyebrow">CURATED FOR YOUR MOOD</p><h2>Places that feel like you.</h2></div>
              <button type="button" className="secondary" onClick={() => setPage("saved")}>See all saved places</button>
            </div>
            <div className="destination-grid">
              {visibleSaved.slice(0, 4).map((place) => (
                <article key={place.id} className="destination-card">
                  <button type="button" className="destination-image" onClick={() => openDestination(place)}>
                    <img src={place.image} alt={`${place.name} destination`} />
                    <span>{place.score}% match</span>
                  </button>
                  <div className="destination-card-body">
                    <div><p className="eyebrow mini">{place.location}</p><h3>{place.name}</h3></div>
                    <button type="button" className="round-arrow" onClick={() => openDestination(place)}>↗</button>
                    <p>{place.vibe}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="home-lower-grid">
              <button type="button" className="continue-card" onClick={() => setPage("trips")}>
                <span className="card-icon">↗</span><div><p className="eyebrow">YOUR JOURNEYS</p><h3>Keep your travel momentum going.</h3><small>2 upcoming trips · 2 memories</small></div><strong>→</strong>
              </button>
              <button type="button" className="continue-card warm" onClick={() => setPage("saved")}>
                <span className="card-icon">✦</span><div><p className="eyebrow">SAVED INSPIRATION</p><h3>Your shortlist is getting exciting.</h3><small>{savedPlaces.length} places are waiting for you</small></div><strong>→</strong>
              </button>
            </div>
          </section>
        )}

        {page === "destination" && (
          <section className="destination-detail-screen">
            <button type="button" className="back-link" onClick={() => setPage("home")}>← Back to explore</button>
            <div className="destination-detail-hero">
              <img src={selectedDestination.image} alt={selectedDestination.name} />
              <div><p className="eyebrow">{selectedDestination.location} · DESTINATION GUIDE</p><h1>{selectedDestination.name}</h1><p>{selectedDestination.vibe}</p></div>
            </div>
            <div className="detail-content">
              <div><p className="eyebrow">THE FEELING</p><h2>A trip that gives you more of what you already love.</h2><p>We will shape the days around your energy, keep the route realistic, and leave enough space for the moments you cannot plan.</p></div>
              <div className="detail-facts"><div><b>28°</b><span>Typical weather</span></div><div><b>3-5</b><span>Ideal days</span></div><div><b>₹35k</b><span>From per person</span></div></div>
            </div>
            <div className="detail-actions"><button type="button" className="secondary" onClick={() => savePlace(selectedDestination.id)}>{selectedDestination.saved ? "Saved to your places" : "Save this place"}</button><button type="button" className="primary" onClick={startPreferenceFlow}>Plan this escape <span>→</span></button></div>
          </section>
        )}

        {page === "preferences" && (
          <section className="preference-screen">
            <button type="button" className="back-link" onClick={() => setPage("home")}>← Back to overview</button>
            <div className="preference-heading"><p className="eyebrow">LET'S MAKE IT YOURS</p><h1>What kind of trip are you craving?</h1><p>Pick the feelings that sound good today. There are no wrong answers.</p></div>
            <div className="preference-options">
              {interests.map((interest, index) => <button key={interest} type="button" className={chosen.includes(interest) ? "preference-option selected" : "preference-option"} onClick={() => toggleInterest(interest)}><span>{["◒", "⌁", "✧", "☾", "⌂", "○"][index]}</span><b>{interest}</b><small>{["Salt air & slow mornings", "Find the good table", "Stories, art & old streets", "Lights after dark", "Fresh air & wide views", "A softer pace"][index]}</small>{chosen.includes(interest) && <i>✓</i>}</button>)}
            </div>
            <div className="preference-footer"><span>{chosen.length} preferences selected</span><button type="button" className="primary" onClick={launchPlanner}>Build my trip <span>→</span></button></div>
          </section>
        )}

        {page === "planner" && (
          <section className="screen-panel">
            <div className="screen-header">
              <div>
                <p className="eyebrow">PLAN A TRIP</p>
                <h2>Design a trip around the life you want.</h2>
              </div>
              <button type="button" className="secondary" onClick={() => setPage("assistant")}>
                Ask assistant
              </button>
            </div>

            <div className="planner-wrap">
              <div className="planner-card">
                <div className="field-grid">
                  <label>
                    FROM
                    <input value={from} onChange={(e) => setFrom(e.target.value)} />
                  </label>
                  <label>
                    DESTINATION
                    <input value={dest} onChange={(e) => setDest(e.target.value)} />
                  </label>
                  <label>
                    TRAVELERS
                    <div className="counter">
                      <button type="button" onClick={() => setPeople(Math.max(1, people - 1))}>
                        −
                      </button>
                      <b>{people} travelers</b>
                      <button type="button" onClick={() => setPeople(people + 1)}>
                        +
                      </button>
                    </div>
                  </label>
                  <label>
                    DEPARTURE
                    <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  </label>
                  <label>
                    RETURN
                    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                  </label>
                  <label>
                    TOTAL BUDGET
                    <div className="budget">
                      <span>₹</span>
                      <input
                        value={budget.toLocaleString("en-IN")}
                        onChange={(e) => setBudget(Number(e.target.value.replace(/\D/g, "")) || 0)}
                      />
                    </div>
                  </label>
                </div>

                <div className="preferences">
                  <div>
                    <span className="label">STAY STYLE</span>
                    <div className="segmented">
                      {["Budget", "Boutique", "Luxury"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={hotelStyle === option ? "chosen" : ""}
                          onClick={() => setHotelStyle(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="label">WHAT SHOULD THIS TRIP FEEL LIKE?</span>
                    <div className="chips">
                      {interests.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={chosen.includes(tag) ? "chip selected" : "chip"}
                          onClick={() => toggleInterest(tag)}
                        >
                          {chosen.includes(tag) && "✓ "}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="label">TRAVEL PACE</span>
                    <div className="segmented">
                      {["Easy", "Balanced", "Full"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={pace === option ? "chosen" : ""}
                          onClick={() => setPace(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="label">GETTING AROUND</span>
                    <div className="segmented">
                      {["Private car", "Public transport", "Walking"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={transport === option ? "chosen" : ""}
                          onClick={() => setTransport(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="preflight">
                  <span>✓</span>
                  <p>
                    <b>Ready to plan.</b> From <strong>{from}</strong> to <strong>{city}</strong>, we’ll optimize {pace.toLowerCase()} days with {transport.toLowerCase()} in mind.
                  </p>
                </div>

                <div className="saved-places">
                  <div className="saved-header">
                    <div>
                      <p className="eyebrow">SAVED PLACES</p>
                      <h3>Dream destinations that match your interests</h3>
                    </div>
                    <span className="enthusiasm-pill">{enthusiasm}% motivation</span>
                  </div>

                  <div className="saved-grid">
                    {visibleSaved.slice(0, 4).map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className={
                          place.saved || city.toLowerCase().includes(place.name.toLowerCase())
                            ? "save-card active"
                            : "save-card"
                        }
                        onClick={() => savePlace(place.id)}
                      >
                        <img src={place.image} alt={`${place.name} travel inspiration`} />
                        <span className="save-badge">{place.saved ? "Saved" : "Save"}</span>
                        <div className="save-card-top">
                          <h4>{place.name}</h4>
                          <small>{place.location}</small>
                        </div>
                        <p>{place.vibe}</p>
                        <div className="save-card-foot">
                          <b>{place.score}% fit</b>
                          <span>
                            +
                            {Math.max(3, place.matchTags.filter((tag) => chosen.includes(tag)).length * 7)} boost
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="planner-foot">
                  <p>Usually ready in under 30 seconds.</p>
                  <button type="button" className="primary" onClick={() => buildPlan()} disabled={loading}>
                    {loading ? "Building your route..." : "Build my itinerary"} <span>→</span>
                  </button>
                </div>
              </div>

              <aside className="mini-summary">
                <div className="summary-card">
                  <p className="eyebrow">MOTIVATION</p>
                  <h3>{enthusiasm}%</h3>
                  <span className="meter-track">
                    <i style={{ width: `${enthusiasm}%` }} />
                  </span>
                  <p>
                    {enthusiasm > 80
                      ? "The vibe is strong enough to keep your savings on track."
                      : "Every saved destination is nudging your trip goal forward."}
                  </p>
                </div>

                <div className="summary-card light">
                  <p className="eyebrow">THIS MONTH</p>
                  <h3>₹{budget.toLocaleString("en-IN")}</h3>
                  <p>Budget target is tracking well. Keep your holiday fund steady and let the plan do the rest.</p>
                </div>
              </aside>
            </div>
          </section>
        )}

        {page === "trips" && (
          <section className="screen-panel">
            <div className="screen-header">
              <div>
                <p className="eyebrow">TRAVEL HISTORY</p>
                <h2>See what you’ve lived and what’s next.</h2>
              </div>
              <button type="button" className="secondary" onClick={() => setPage("planner")}>
                Plan another
              </button>
            </div>

            <div className="trip-columns">
              <div className="trip-group">
                <h3>Future trips</h3>
                {futureTrips.map((trip) => (
                  <article key={trip.id} className="trip-card future">
                    <div>
                      <span className="trip-tag">Upcoming</span>
                      <h4>{trip.dest}</h4>
                    </div>
                    <div className="trip-meta">
                      <span>{trip.date}</span>
                      <span>{trip.mood}</span>
                    </div>
                    <footer>
                      <b>{trip.cost}</b>
                      <button type="button">Open plan</button>
                    </footer>
                  </article>
                ))}
              </div>

              <div className="trip-group">
                <h3>Past trips</h3>
                {pastTrips.map((trip) => (
                  <article key={trip.id} className="trip-card past">
                    <div>
                      <span className="trip-tag">Completed</span>
                      <h4>{trip.dest}</h4>
                    </div>
                    <div className="trip-meta">
                      <span>{trip.date}</span>
                      <span>{trip.mood}</span>
                    </div>
                    <footer>
                      <b>{trip.cost}</b>
                      <button type="button">View memories</button>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === "saved" && (
          <section className="screen-panel">
            <div className="screen-header">
              <div>
                <p className="eyebrow">SAVED PLACES</p>
                <h2>Your dream shortlist is ready.</h2>
              </div>
              <button type="button" className="secondary" onClick={() => setPage("planner")}>
                Back to planner
              </button>
            </div>

            <div className="saved-list">
              {visibleSaved.map((place) => (
                <article key={place.id} className={place.saved ? "saved-item active" : "saved-item"}>
                  <div>
                    <span className="eyebrow mini">{place.location}</span>
                    <h3>{place.name}</h3>
                  </div>
                  <p>{place.vibe}</p>
                  <div className="saved-row">
                    <b>{place.score}% fit</b>
                    <button type="button" onClick={() => savePlace(place.id)}>
                      {place.saved ? "Remove" : "Save"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "assistant" && (
          <section className="screen-panel assistant-panel">
            <div className="screen-header">
              <div>
                <p className="eyebrow">PERSONAL ASSISTANT</p>
                <h2>Talk to your travel guide.</h2>
              </div>
              <button type="button" className="secondary" onClick={() => setPage("planner")}>
                Return to trip
              </button>
            </div>

            <div className="assistant-box">
              <div className="prompt-row">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setAssistantInput(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="chat-thread">
                {assistantMessages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className={message.from === "bot" ? "bubble bot" : "bubble user"}
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAssistantSend} className="assistant-form">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask your assistant anything about your trip..."
                />
                <button type="submit" className="primary">Send</button>
              </form>
            </div>
          </section>
        )}

        {show && (
          <section className="results" id="plan">
            <div className="result-title">
              <div>
                <p className="eyebrow">YOUR TRIP BLUEPRINT {rev ? `· VERSION ${rev + 1}` : ""}</p>
                <h2>
                  A very good <em>{city}</em> idea.
                </h2>
                <p>
                  {start} to {end} · {people} travelers · {hotelStyle} stays · {pace} pace · {transport}
                </p>
              </div>
              <button type="button" className="outline" onClick={() => setShow(false)}>
                ← Edit brief
              </button>
            </div>

            <div className="validation">
              <div className="valid-icon">✓</div>
              <div>
                <b>Every constraint is satisfied</b>
                <span>Budget, pace, transport, stay style and selected interests are reflected in this itinerary.</span>
              </div>
              <div className="cost">
                <small>ESTIMATED TOTAL</small>
                <b>₹{plan.total.toLocaleString("en-IN")}</b>
                <span>₹{remain.toLocaleString("en-IN")} under budget</span>
              </div>
            </div>

            <div className="plan-insights">
              {[
                ["✈", "FLIGHT", `${title(from)} → ${city}`, plan.flight],
                ["⌂", "STAY", plan.hotel, `${hotelStyle} · ${plan.g.stay}`],
                ["◈", "PACING", `${pace} schedule`, `${transport} optimized`],
                ["☼", "WEATHER", plan.g.weather, "Outdoor time prioritized"],
              ].map(([icon, label, titleText, detail]) => (
                <div key={label}>
                  <span>{icon}</span>
                  <p>
                    <small>{label}</small>
                    <b>{titleText}</b>
                    <em>{detail}</em>
                  </p>
                </div>
              ))}
            </div>

            <div className="motivation-panel">
              <div>
                <p className="eyebrow">WHY THIS FEELS WORTH SAVING FOR</p>
                <h3>{city} is matching your dream vibe with {chosen.length} key interests.</h3>
              </div>
              <div className="motivation-meter">
                <div className="meter-topline">
                  <span>Interest boost</span>
                  <b>{enthusiasm}%</b>
                </div>
                <span className="meter-track">
                  <i style={{ width: `${enthusiasm}%` }} />
                </span>
                <p>
                  {enthusiasm > 80
                    ? "This trip feels exciting enough to keep your savings on track."
                    : "Every suggested moment is nudging your motivation higher and closer to the goal."}
                </p>
              </div>
            </div>

            <div className="result-grid">
              <aside>
                <div className="advisor">
                  <p className="eyebrow">PLANNER'S NOTE</p>
                  <h3>{low ? "Budget optimized" : "Balanced pick"}</h3>
                  <p>
                    {low
                      ? `We reduced the flight and stay spend, then redesigned ${city} around high-value local experiences.`
                      : `This version protects slow moments while keeping the experiences that best match your brief in easy reach.`}
                  </p>
                  <div className="advisor-meter">
                    <span style={{ width: low ? "76%" : "89%" }} />
                  </div>
                  <small>VALUE SCORE {low ? "76" : "89"} / 100</small>
                </div>

                <div className="budget-card">
                  <div>
                    <small>BUDGET ALLOCATION</small>
                    <b>₹{plan.total.toLocaleString("en-IN")}</b>
                  </div>
                  <span>
                    <i style={{ width: "24%" }} />
                    <i style={{ width: "38%" }} />
                    <i style={{ width: "23%" }} />
                    <i style={{ width: "15%" }} />
                  </span>
                  <p>
                    <em>Travel</em>
                    <em>Stay</em>
                    <em>Experiences</em>
                    <em>Local</em>
                  </p>
                </div>

                <button type="button" className="replan" onClick={replan}>
                  <span>↻</span>
                  <div>
                    <b>Replan for less</b>
                    <small>Reduce budget by 20% and rebuild the whole trip</small>
                  </div>
                  <i>→</i>
                </button>
              </aside>

              <div className="itinerary">
                <div className="itinerary-label">
                  <span>DAY-BY-DAY FLOW</span>
                  <small>Optimized by your preferences</small>
                </div>
                <div className="tabs">
                  {plan.days.map((entry, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setDay(index)}
                      className={day === index ? "tab-active" : ""}
                    >
                      <b>Day {index + 1}</b>
                      <span>{["Arrival", "Explore", "Unwind"][index]}</span>
                    </button>
                  ))}
                </div>
                <article>
                  <div className="day-heading">
                    <div>
                      <span className="day-count">0{day + 1}</span>
                      <div>
                        <h3>{plan.days[day][0]}</h3>
                        <p>{pace} pace, with room to wander.</p>
                      </div>
                    </div>
                    <span className="day-cost">
                      ₹{plan.days[day][1].toLocaleString("en-IN")} <small>est.</small>
                    </span>
                  </div>
                  <div className="timeline">
                    {plan.days[day][2].map((event, index) => (
                      <div key={`${event[0]}-${index}`} className="event">
                        <time>{event[0]}</time>
                        <i className={index === 0 ? "arrival" : ""} />
                        <div>
                          <b>{event[1]}</b>
                          <p>{event[2]}</p>
                        </div>
                        <button type="button" className="more">···</button>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            <div className="approve">
              <div>
                <span className="spark">✦</span>
                <div>
                  <b>{approved ? `Your ${city} escape is confirmed.` : "This plan is ready when you are."}</b>
                  <p>
                    {approved
                      ? "Your itinerary has been saved under Trips."
                      : "Approve it now, or keep refining until it feels perfect."}
                  </p>
                </div>
              </div>
              <div className="approve-actions">
                <button type="button" className="share">Share</button>
                <button type="button" className="primary" onClick={() => setApproved(true)}>
                  {approved ? "Trip confirmed ✓" : "Approve itinerary →"}
                </button>
              </div>
            </div>
          </section>
        )}

        <button type="button" className={assistantOpen ? "assistant-fab active" : "assistant-fab"} onClick={() => setAssistantOpen((value) => !value)} aria-label="Open travel assistant">
          <span>{assistantOpen ? "×" : "✦"}</span>
          <b>{assistantOpen ? "Close" : "Ask Voyagr"}</b>
        </button>
        {assistantOpen && (
          <div className="assistant-popover">
            <div className="assistant-popover-head"><div><span className="status-dot" /> Voyagr guide</div><button type="button" onClick={() => setAssistantOpen(false)}>×</button></div>
            <p>Need a hand choosing a place or making the budget work?</p>
            <div className="assistant-popover-actions"><button type="button" onClick={() => { setAssistantOpen(false); setPage("assistant"); }}>Open full chat</button><button type="button" onClick={() => { setAssistantInput("Suggest a trip for my mood"); setAssistantOpen(false); setPage("assistant"); }}>Ask a question</button></div>
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);