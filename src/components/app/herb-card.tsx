import { Leaf, ShieldAlert } from "lucide-react";
import type { Herb } from "@/services/types";

export function HerbCard({ herb }: { herb: Herb }) {
  return (
    <div className="surface-panel flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-success/12 text-xl">
          {herb.emoji}
        </span>
        <div>
          <h4 className="text-sm font-semibold">{herb.commonName}</h4>
          <p className="text-xs text-muted-foreground">{herb.malayalamName}</p>
          <p className="text-xs italic text-muted-foreground">{herb.scientificName}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-xs">
        <Row label="Traditional use" value={herb.traditionalUse} />
        <Row label="Preparation" value={herb.preparation} />
        <Row label="Application" value={herb.application} />
      </dl>

      <div className="mt-4 rounded-lg border border-warning/25 bg-warning/8 p-3 text-xs">
        <p className="flex items-center gap-1.5 font-medium text-warning">
          <ShieldAlert className="size-3.5" /> Safety
        </p>
        <p className="mt-1 text-muted-foreground">{herb.safety}</p>
        <p className="mt-1.5 text-muted-foreground">
          <strong className="text-foreground">Patch test:</strong> {herb.patchTest}
        </p>
      </div>

      <div className="mt-auto pt-4 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          <Leaf className="size-3" /> References
        </p>
        <ul className="mt-1 space-y-0.5">
          {herb.references.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground">{label}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}
