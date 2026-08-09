export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
] as const;

export const images = {
  hero:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_ae499c5e81_364ff02449a9278d.png",
  syncWaveform:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_e029eeff0e_8be54ef9ad73d15f.png",
  syncDevices:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_0b5ecd6358_3ec328fe586914f4.png",
  syncNetwork:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_2d30529d8c_7294fd519b0f3b59.png",
  spatial3d:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_526b341308_b5772d04ee92ec3a.png",
  voiceChat:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_97598aadb6_07fbd30b2ee21ae3.png",
  avatar1:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_5cae85f4e0_763ef0fb602f1e09.png",
  avatar2:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_5cae85f4e0_ac361e252562a986.png",
  stepCreate:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_9911fba201_6e0c2a89409dc165.png",
  stepPickVideo:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_13b4605d54_b304a48215aee40b.png",
  stepInvite:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_b6a1671275_233f94d0d1964683.png",
} as const;

export const pricingTiers = [
  {
    name: "Popcorn",
    price: "$0",
    period: "/mo",
    features: [
      "8 Seats per room",
      "1080p Sync Playback",
      "Basic 3D Theater",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Director",
    price: "$12",
    period: "/mo",
    features: [
      "50 Seats per room",
      "4K Crystal Sync",
      "Spatial Voice Chat",
      "All 3D Room Themes",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$29",
    period: "/mo",
    features: [
      "Unlimited Seats",
      "Custom 3D Branded Rooms",
      "Priority Streaming",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
] as const;

export const footerLinks = {
  platform: [
    { label: "Features", href: "#features" },
    { label: "Integrations", href: "#" },
    { label: "Pricing", href: "#pricing" },
  ],
  resources: [
    { label: "Blog", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "API Docs", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Legal", href: "#" },
  ],
} as const;

export const howItWorksSteps = [
  {
    step: "Step 1",
    title: "Create Room",
    description:
      "Spin up a private virtual theater in seconds and pick your vibe.",
    image: images.stepCreate,
    imageAlt:
      "person tapping a glowing button on a tablet to launch a virtual room, warm dark interior, lifestyle",
    reverse: false,
  },
  {
    step: "Step 2",
    title: "Pick Video",
    description:
      "Upload a clip or drop a link — the queue syncs for everyone instantly.",
    image: images.stepPickVideo,
    imageAlt:
      "hand selecting a movie from a sleek dark catalog interface on a screen, cinematic glow, lifestyle ph",
    reverse: true,
  },
  {
    step: "Step 3",
    title: "Invite Friends",
    description: "Share a code and watch the room fill up as friends join live.",
    image: images.stepInvite,
    imageAlt:
      "group of friends on screens laughing together during a virtual watch party, cozy dark lighting, life",
    reverse: false,
  },
] as const;
