import type { Channel, Seniority } from "@/lib/types";

const SENIORITY_STYLES: Record<Seniority, string> = {
  Junior: "bg-sky-50 text-sky-700 ring-sky-200",
  "Semi-Senior": "bg-amber-50 text-amber-700 ring-amber-200",
  Senior: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function SeniorityBadge({ seniority }: { seniority: Seniority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${SENIORITY_STYLES[seniority]}`}
    >
      {seniority}
    </span>
  );
}

const CHANNEL_STYLES: Record<Channel, string> = {
  LinkedIn: "bg-[#0A66C2]/10 text-[#0A66C2]",
  Instagram: "bg-[#E1306C]/10 text-[#C13584]",
  TikTok: "bg-slate-900/10 text-slate-800",
  "Todas las redes":
    "bg-gradient-to-r from-[#0A66C2]/15 via-[#E1306C]/15 to-slate-900/15 text-slate-700",
};

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${CHANNEL_STYLES[channel]}`}
    >
      {channel}
    </span>
  );
}
