export type PlatformKey = "instagram" | "messenger" | "facebook";

export type SignalAction = "seen" | "typing" | "story";

export type SettingId =
  | "ig-seen"
  | "ig-typing"
  | "ig-story"
  | "msg-seen"
  | "msg-typing"
  | "msg-story";

export type DemoPerson = {
  id: "mira" | "theo" | "lina" | "nova" | "rafi";
  name: string;
  short: string;
  avatarClass: string;
  messages: Record<PlatformKey, string>;
  preview: Record<PlatformKey, string>;
};

export type MatrixRow = {
  platform: "Instagram" | "Messenger" | "Facebook";
  control: "Seen" | "Typing" | "Story views";
  signal: string;
  status: "supported" | "partial" | "platform-dependent" | "unsupported";
  evidence: string;
  interception: string;
  caveat: string;
  lastAudited: "2026-05-24";
};

export const STAGE_COPY = {
  heading: "Browse normally. Keep privacy signals local.",
  support:
    "Ghostify lets you choose when seen, typing, and story-view signals leave your browser on Instagram, Messenger, and Facebook.",
  trust: ["Open source", "No account", "No tracking", "Local settings", "Manifest V3"],
} as const;

export const STORE_LINKS = {
  chrome:
    "https://chromewebstore.google.com/detail/ghostify-hide-seen-typing/flpnibonbhdmnpgflnbemgghghhblmpm?utm_source=item-share-cb",
  edge:
    "https://microsoftedge.microsoft.com/addons/detail/ghostify-hide-seen-typ/mgbppdkolkeelimnemlbpmfdddhoeeal",
  github: "https://github.com/Hendrizzzz/Ghostify",
  issues: "https://github.com/Hendrizzzz/Ghostify/issues",
  privacy: "https://github.com/Hendrizzzz/Ghostify/blob/main/PRIVACY.md",
  license: "https://github.com/Hendrizzzz/Ghostify/blob/main/LICENSE",
} as const;

export const PEOPLE: Record<DemoPerson["id"], DemoPerson> = {
  mira: {
    id: "mira",
    name: "Mira Vale",
    short: "Mira",
    avatarClass: "avatar-photo-a",
    messages: {
      messenger: "Are you there?",
      facebook: "Can you check this?",
      instagram: "Did you see this?",
    },
    preview: {
      messenger: "Unread message",
      facebook: "Sent from chat drawer",
      instagram: "2 new messages",
    },
  },
  theo: {
    id: "theo",
    name: "Theo Park",
    short: "Theo",
    avatarClass: "avatar-photo-b",
    messages: {
      messenger: "I sent the draft.",
      facebook: "New story is up.",
      instagram: "Quick question.",
    },
    preview: {
      messenger: "Attachment received",
      facebook: "Story posted",
      instagram: "Active recently",
    },
  },
  lina: {
    id: "lina",
    name: "Lina Cruz",
    short: "Lina",
    avatarClass: "avatar-photo-c",
    messages: {
      messenger: "Ping me when you read this.",
      facebook: "Look at this story.",
      instagram: "Sent an attachment.",
    },
    preview: {
      messenger: "New message",
      facebook: "Shared a post",
      instagram: "Sent an attachment",
    },
  },
  nova: {
    id: "nova",
    name: "Nova Reid",
    short: "Nova",
    avatarClass: "avatar-photo-d",
    messages: {
      messenger: "On my way.",
      facebook: "Story just went live.",
      instagram: "New story.",
    },
    preview: {
      messenger: "Active now",
      facebook: "Story posted",
      instagram: "Suggested",
    },
  },
  rafi: {
    id: "rafi",
    name: "Rafi Moss",
    short: "Rafi",
    avatarClass: "avatar-photo-e",
    messages: {
      messenger: "Can you reply?",
      facebook: "Can you reply here?",
      instagram: "Can you reply?",
    },
    preview: {
      messenger: "Missed call",
      facebook: "Missed call",
      instagram: "Sent a reel",
    },
  },
};

export const SETTING_FOR: Record<PlatformKey, Record<SignalAction, SettingId>> = {
  instagram: { seen: "ig-seen", typing: "ig-typing", story: "ig-story" },
  messenger: { seen: "msg-seen", typing: "msg-typing", story: "msg-story" },
  facebook: { seen: "msg-seen", typing: "msg-typing", story: "msg-story" },
};

export const PROOF_COPY: Record<
  SignalAction,
  {
    protected: { status: string; detail: string; preview: string; outgoing: string; proof: string };
    exposed: { status: string; detail: string; preview: string; outgoing: string; proof: string };
  }
> = {
  seen: {
    protected: {
      status: "No seen receipt",
      detail: "Their chat stays unread while you read here.",
      preview: "Read locally",
      outgoing: "Reading. Not broadcasting yet.",
      proof: "No seen receipt appears",
    },
    exposed: {
      status: "Seen just now",
      detail: "Their thread can show that you opened it.",
      preview: "Seen can be sent",
      outgoing: "Reading. Seen can be sent.",
      proof: "Seen just now",
    },
  },
  typing: {
    protected: {
      status: "No typing bubble",
      detail: "They do not see a typing indicator while you draft.",
      preview: "Typing stays private",
      outgoing: "Drafting privately in this browser.",
      proof: "Typing stays hidden",
    },
    exposed: {
      status: "Typing appears",
      detail: "Their thread can show you typing.",
      preview: "Typing visible",
      outgoing: "Typing indicator visible.",
      proof: "Typing appears",
    },
  },
  story: {
    protected: {
      status: "No viewer added",
      detail: "Their viewer list does not include this view.",
      preview: "Story view kept local",
      outgoing: "Viewing story without broadcasting.",
      proof: "Viewer list unchanged",
    },
    exposed: {
      status: "Viewer added",
      detail: "Their viewer list can show that you viewed it.",
      preview: "Viewer can be added",
      outgoing: "Story view visible.",
      proof: "Viewer added",
    },
  },
};

export const MATRIX_ROWS: MatrixRow[] = [
  {
    platform: "Instagram",
    control: "Seen",
    signal: "mark_seen / thread_seen",
    status: "platform-dependent",
    evidence: "dist/config/patterns.json, src/utils/network.js",
    interception: "content script, page script, network hook",
    caveat: "Instagram request shapes can change.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Instagram",
    control: "Typing",
    signal: "direct_v2/threads/broadcast/typing / typing_indicator",
    status: "platform-dependent",
    evidence: "dist/config/patterns.json, src/utils/network.js",
    interception: "content script, page script, network hook",
    caveat: "Depends on the current Direct implementation.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Instagram",
    control: "Story views",
    signal: "stories/reel/seen / xdt_mark_story_reel_seen",
    status: "platform-dependent",
    evidence: "dist/config/patterns.json, src/utils/network.js",
    interception: "content script, page script, network hook",
    caveat: "Viewer endpoints can move.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Messenger",
    control: "Seen",
    signal: "sendReadReceipt / LSUpdateThreadReadWatermark / mark_seen",
    status: "platform-dependent",
    evidence: "src/messenger_patch.js, src/utils/network.js",
    interception: "document-start Messenger patch, network hook",
    caveat: "Refresh already-open Messenger tabs after extension updates.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Messenger",
    control: "Typing",
    signal: "sendchatstate / typing_indicator",
    status: "platform-dependent",
    evidence: "src/messenger_patch.js, dist/config/patterns.json",
    interception: "document-start Messenger patch, network hook",
    caveat: "Messenger internals can change.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Messenger",
    control: "Story views",
    signal: "viewer_seen / mark_story_seen",
    status: "partial",
    evidence: "dist/config/patterns.json",
    interception: "bundled rules and network hook where applicable",
    caveat: "Story coverage is caveated.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Facebook",
    control: "Seen",
    signal: "change_read_status / read_receipt / mark_seen",
    status: "platform-dependent",
    evidence: "dist/config/patterns.json, src/utils/network.js",
    interception: "document-start Messenger patch, network hook",
    caveat: "Facebook UI variants can change.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Facebook",
    control: "Typing",
    signal: "sendtypingindicator / typing_status",
    status: "platform-dependent",
    evidence: "dist/config/patterns.json, src/utils/network.js",
    interception: "document-start Messenger patch, network hook",
    caveat: "Typing endpoints can change.",
    lastAudited: "2026-05-24",
  },
  {
    platform: "Facebook",
    control: "Story views",
    signal: "StoriesUpdateSeenMutation / mark_story_seen",
    status: "partial",
    evidence: "dist/config/patterns.json",
    interception: "bundled rules and network hook where applicable",
    caveat: "Story coverage is caveated.",
    lastAudited: "2026-05-24",
  },
];
