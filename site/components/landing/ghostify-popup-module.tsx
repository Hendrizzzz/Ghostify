"use client";

import Image from "next/image";

import type { SettingId } from "./demo-stage-data";

const GROUPS: Array<{
  id: "instagram" | "messenger";
  title: string;
  rows: Array<{ id: SettingId; label: string; icon: "seen" | "typing" | "story" }>;
}> = [
  {
    id: "instagram",
    title: "Instagram",
    rows: [
      { id: "ig-seen", label: "Hide Seen", icon: "seen" },
      { id: "ig-typing", label: "Hide Typing", icon: "typing" },
      { id: "ig-story", label: "Hide Story Views", icon: "story" },
    ],
  },
  {
    id: "messenger",
    title: "Messenger / Facebook",
    rows: [
      { id: "msg-seen", label: "Hide Seen", icon: "seen" },
      { id: "msg-typing", label: "Hide Typing", icon: "typing" },
      { id: "msg-story", label: "Hide Story Views", icon: "story" },
    ],
  },
];

export function GhostifyPopupModule({
  settings,
  activeSetting,
  onToggle,
}: {
  settings: Record<SettingId, boolean>;
  activeSetting: SettingId;
  onToggle: (id: SettingId) => void;
}) {
  return (
    <aside className="ghostify-popup-plane" aria-label="Ghostify popup controls">
      <div className="popup-shell">
        <header className="popup-header">
          <Image src="/ghostify-icon32.png" alt="" width={24} height={24} />
          <h2>Ghostify</h2>
        </header>

        {GROUPS.map((group) => (
          <section className="popup-platform" key={group.id} aria-label={group.title}>
            <div className="popup-platform-label">
              <span aria-hidden="true" className={`popup-platform-icon ${group.id}`} />
              <span>{group.title}</span>
            </div>
            <div className="popup-card">
              {group.rows.map((row) => (
                <button
                  type="button"
                  role="switch"
                  className={`popup-row ${activeSetting === row.id ? "is-focus" : ""}`}
                  data-setting-row={row.id}
                  aria-checked={settings[row.id]}
                  onClick={() => onToggle(row.id)}
                  key={row.id}
                >
                  <span className="row-label">
                    <span className={`feature-icon ${row.icon}-icon`} aria-hidden="true" />
                    <span>{row.label}</span>
                  </span>
                  <span className="switch" aria-hidden="true">
                    <span className={settings[row.id] ? "track checked" : "track"} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <footer className="popup-footer">v2.0.1</footer>
      </div>
    </aside>
  );
}
