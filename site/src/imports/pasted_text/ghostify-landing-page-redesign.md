You are a senior brand designer, product designer, interaction designer, and frontend architect.

Redesign the Ghostify landing page from scratch.

Ghostify is an open-source browser extension that lets users control privacy/social-pressure signals locally in their browser:

hide seen receipts
hide typing indicators
hide supported story views
works across Messenger, Facebook, and Instagram web surfaces
no Ghostify account
no Ghostify server
open source
current deployed extension size: 22.34 KiB
This must not look like generic AI UI, a SaaS dashboard, a crypto site, a fake cybersecurity product, or a dark card-grid template. It should feel like a premium, quiet, slightly strange browser companion that gives people room to read, type, and watch without announcing every move.

Core feeling: Quiet control while something small and friendly keeps watch.

Three-second memory: A real Ghostify mascot quietly moving through realistic Messenger, Facebook, and Instagram browser surfaces, with one sharp promise: read, type, and watch without announcing it.

Audience: People who use Messenger, Facebook, and Instagram daily and hate the pressure of seen receipts, typing bubbles, and story-view signaling.

Anti-audience: Not enterprise security buyers. Not people looking for a dashboard. Not developers wanting implementation internals above the fold.

Golden frontend stack for implementation handoff:

Framework: Next.js 16 with App Router and React Server Components
Language: TypeScript in strict mode
Styling: Tailwind CSS v4 plus shadcn/ui
Animation: Framer Motion / Motion plus CSS View Transitions API
3D/depth: Three.js only where it adds subtle spatial depth, liquid-glass refraction, or atmosphere
Architecture: Server Components by default; Client Components only for interactive surfaces, mascot physics, animation, and controls
Design tokens: CSS variables compatible with Tailwind v4 and shadcn/ui
Accessibility: keyboard states, reduced motion, focus-visible, contrast, semantic structure
Important: this is a design/prototype prompt, but every design decision must be implementation-realistic for this stack.

Use the attached Ghostify logo as the source of truth for the mascot. Do not invent a different ghost. Do not use emoji as UI.

Visual direction: Dark, intimate, premium, editorial, quietly playful. Slightly haunted but not horror. More “calm privacy companion” than “cybersecurity.” Use textured darkness, tasteful grain, thin luminous lines, realistic browser chrome, soft depth, restrained red/off-white accents, and occasional warm muted tones. Avoid bright green success UI. Avoid purple/blue gradient sludge. Avoid generic neon. Avoid giant all-white text everywhere.

Typography: Do not use Inter, Arial, Roboto, Space Grotesk, or default system fonts as the main brand voice. Choose a distinctive display typeface and a readable body/UI typeface. The type system must have personality and hierarchy:

expressive hero display
tighter section headings
readable body
compact UI labels
small trust/proof text
button labels that fit at desktop and mobile Do not make every section use the same huge headline style.
Page structure: Design a full landing page with desktop and mobile frames. Do not repeat “big text left, content right” in every section. Vary the composition.

Header
Transparent sticky header.
It should feel like almost no navbar, but remain readable across sections.
Left: Ghostify logo and wordmark.
Right links: Features, Platforms, Privacy, GitHub.
No install button in the navbar.
No visible boxed navbar background unless absolutely needed for readability.
Hero
Full viewport, spatial, not trapped in a centered box.
Headline direction: “Read, type, and watch without announcing it.” Improve this only if you can make it sharper, not more generic.
Supporting copy: “Ghostify keeps read receipts, typing bubbles, and supported story views under your control. It runs locally in your browser: no account, no relay, open source.”
Primary CTA: Add to Chrome
Secondary CTA: Add to Edge
GitHub/source should be a quiet text link, not a third primary button.
Show a realistic browser-like product scene, not a 3D laptop.
Include Messenger, Facebook, and Instagram tabs.
Show the Ghostify extension icon in browser chrome.
Ghostify popup opens from the extension icon and stays fixed where a browser extension popup should be.
The popup must not be draggable.
The popup must use the real Ghostify mark.
The popup groups: Instagram: Hide Seen, Hide Typing, Hide Story Views Messenger: Hide Seen, Hide Typing Facebook: Hide Seen, Hide Typing, Hide Story Views
Messenger must not have story controls.
Mascot interaction layer
A separate Ghostify mascot roams slowly across the page.
It should pause, drift, and feel alive but not annoying.
It should be draggable.
If thrown, it has gentle physics: slight bounce, friction, then settles.
The mascot must sit above everything in z-index, including navbar, so the user can always grab it.
Speech bubble follows the mascot and stays centered relative to it.
Speech bubble must never get cut off at viewport edges.
Idle phrases: “quiet mode is on.” “move me. i’ll settle.” “no account. local controls.” “i’m keeping watch.”
When a user types in the demo, the mascot glides smoothly to center, does a small dance/orbit motion, and says: “typing stayed quiet.”
When a user opens a chat, it says: “seen stayed back.”
When a supported story is viewed, it says: “story stayed quiet.”
If a feature is turned off and a signal goes through, it should say: “that one went through.”
Success/failure feedback must come from the mascot, not from ugly badges inside the product UI.
Do not use bright green success pills.
Interactive product demo Make this the core of the site, not a diary. The user should be able to interact:
switch platform tabs
open a chat
type in a composer
toggle Ghostify controls
view a story on Facebook or Instagram
see mascot feedback
Each platform must feel different and realistic:

Messenger:

Blue Messenger identity, not pink.
Left chat list with avatars, active states, timestamps, unread dots.
Active thread area with real-looking message bubbles.
Composer at bottom.
No story viewer in Messenger.
Facebook:

facebook.com-like top navigation.
Left chats/messages surface.
Right profile/chat context area where appropriate.
Facebook stories are allowed.
Message UI should feel like Facebook web, not generic Messenger clone.
Instagram:

Instagram left navigation rail.
Story row.
DM list.
DM thread with composer.
Instagram story viewer supported.
Use plausible names, timestamps, messages, and interface density. Do not use lorem ipsum. Do not use internal implementation labels like mark_seen, LSUpdateThreadReadWatermark, SendReadReceipt, etc. This is marketing, not packet documentation.

Features section Three features:
Read without receipts
Type without pressure
Watch stories quietly Make the cards/sections feel premium and specific. Icons must be simple readable UI icons, not emoji. Copy should be human:
“Read the message before it becomes a social obligation.”
“Draft, pause, erase, and rewrite without broadcasting the bubble.”
“Catch up without turning every tap into an announcement.” Avoid generic “powerful privacy controls” copy.
Platform section Show “one promise across three messy surfaces.” This should feel like a real product grid or interactive switcher, not a technical matrix. Do not show signal keyword tables. Do not make every panel look identical. Show enough of each platform that users immediately recognize the context.

Privacy section Keep it convincing but not bloated:

No Ghostify account
No Ghostify server
Local settings
Open source Tone: “boring in the right places.” Make this trustworthy without becoming a compliance dashboard.
Lightweight section Add a memorable section: Headline: “Small enough to disappear.” Show: 22.34 KiB 0 Ghostify servers Copy: “Tiny enough to feel like a browser control, not another app to manage.” This section should be visually distinctive, not just two stat cards.

FAQ Use direct questions:

Is Ghostify affiliated with Meta?
Does Ghostify collect my messages or login?
Why does it need site permissions?
Will it break sending messages?
Will protections always work?
What should I do after updating? Keep answers concise and honest.
Final CTA Headline: “Add Ghostify to your browser.” Copy: “Free, open source, and built for the web versions of Messenger, Facebook, and Instagram.” Buttons:
Add to Chrome
Add to Edge Quiet link:
Source on GitHub Do not use “Start ghosting, for free.”
Motion and scroll:

Use scroll sections that settle neatly per viewport.
Avoid scroll traps.
Add parallax only when it supports the ghost/quiet-control concept.
Use CSS View Transition-style page/section transitions where appropriate.
Use Motion/Framer Motion-style transitions for interactive demo states.
Use Three.js only for subtle spatial/depth effects: liquid glass, faint refraction, atmospheric field, or interactive background depth. Do not build a laggy 3D laptop.
Support reduced motion.
Design system requirements: Create tokens for:

colors
typography
spacing
radii
shadows/material
motion durations/easing
z-index layers
dark theme surfaces
success/failure states without bright green
shadcn/ui implementation handoff: Design components should map naturally to shadcn/ui primitives:

Button
Toggle/Switch
Tabs
Tooltip
Accordion
Card only where truly appropriate
Dialog only if needed But do not let shadcn’s default look dominate. The design should be custom and brand-led.
Hard bans:

No emoji as UI.
No “Reading...” text.
No “typing appears.”
No “seen signal sent normally.”
No “sent normally.”
No “Opened privately” pill cut off by the phone/browser edge.
No fake 3D laptop.
No generic dashboard.
No centered boxed page with huge empty left/right margins.
No repeated left-text/right-card layout across all sections.
No bright green success badges.
No internal signal keywords in marketing sections.
No low-quality mascot.
No section where the user cannot tell what it is saying.
Responsive requirements: Create desktop and mobile versions. Check:

1920x1080
1536x864
1440x900
1365x768
390x844 No horizontal overflow. No clipped buttons. No clipped mascot bubble. No clipped mockup. Header remains readable.
Output requirements: Produce a polished Figma Make design/prototype with:

Desktop landing page
Mobile landing page
Interaction notes for mascot, platform switching, popup, typing, seen, and story-view states
Design token notes for implementation
Component notes for Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui + Motion + CSS View Transitions + Three.js
A short self-critique after the design:
What still feels generic?
What is the strongest visual memory?
What could break on laptop viewports?
What should the developer preserve exactly?
Before finalizing, revise once using the visual-qa-critic, typography-art-director, layout-composition-director, product-mockup-realism, and responsive-qa-inspector criteria.

