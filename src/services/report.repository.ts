import type { AnyReport, IReportRepository } from "./types";

/**
 * Browser-persisted repository.
 *
 * The repository interface is storage-agnostic — swapping to SQLite/Postgres
 * via server functions only requires a new IReportRepository implementation
 * registered in the container.
 */
export class LocalStorageReportRepository implements IReportRepository {
  private readonly key = "asip.reports.v1";

  private read(): AnyReport[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as AnyReport[]) : [];
    } catch {
      return [];
    }
  }

  private write(reports: AnyReport[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(reports));
    } catch {
      // Storage quota exceeded — drop the oldest report and retry once.
      const trimmed = reports.slice(0, Math.max(1, reports.length - 1));
      window.localStorage.setItem(this.key, JSON.stringify(trimmed));
    }
    window.dispatchEvent(new CustomEvent("asip:reports-changed"));
  }

  save(report: AnyReport) {
    const all = this.read();
    this.write([report, ...all.filter((r) => r.id !== report.id)].slice(0, 40));
  }

  list() {
    return this.read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  listByKind<K extends AnyReport["kind"]>(kind: K) {
    return this.list().filter((r): r is Extract<AnyReport, { kind: K }> => r.kind === kind);
  }

  getById(id: string) {
    return this.read().find((r) => r.id === id);
  }

  remove(id: string) {
    this.write(this.read().filter((r) => r.id !== id));
  }
}
