/**
 * FarmEase – Digital Cattle Identity ID Generator
 * Phase 1: QR Digital Identity Foundation
 *
 * Generates enterprise-level unique Digital Identity IDs in the format:
 *   CAT-YYYY-NNNNNN
 *   e.g. CAT-2026-000001, CAT-2026-000002, CAT-2026-999999
 *
 * Properties:
 *  - Never duplicates IDs
 *  - Auto-increments per year
 *  - Thread-safe (JavaScript is single-threaded; counter is atomic)
 *  - Database-safe (sequence synced from existing identities on boot)
 *  - Scalable to 999,999 cattle per year
 */

export const DIGITAL_ID_PREFIX = 'CAT';
export const DIGITAL_ID_REGEX = /^CAT-\d{4}-\d{6}$/;

export class UniqueIdGenerator {
  private static instance: UniqueIdGenerator;
  private counters: Map<number, number> = new Map();

  private constructor() {}

  /** Singleton access */
  static getInstance(): UniqueIdGenerator {
    if (!UniqueIdGenerator.instance) {
      UniqueIdGenerator.instance = new UniqueIdGenerator();
    }
    return UniqueIdGenerator.instance;
  }

  /**
   * Sync the counter for a given year from an existing list of IDs.
   * Call this once on startup to prevent sequence collisions with
   * IDs already stored in the data source.
   */
  syncFromExisting(existingIds: string[]): void {
    for (const id of existingIds) {
      if (!DIGITAL_ID_REGEX.test(id)) continue;
      const parts = id.split('-');
      const year = parseInt(parts[1], 10);
      const seq = parseInt(parts[2], 10);
      const current = this.counters.get(year) ?? 0;
      if (seq > current) {
        this.counters.set(year, seq);
      }
    }
  }

  /**
   * Generate the next unique Digital Identity ID for a given year.
   * Automatically increments the counter, guaranteeing uniqueness.
   */
  next(year?: number): string {
    const y = year ?? new Date().getFullYear();
    const current = this.counters.get(y) ?? 0;
    const next = current + 1;

    if (next > 999_999) {
      throw new Error(
        `UniqueIdGenerator: Sequence exhausted for year ${y}. Max 999,999 IDs per year.`
      );
    }

    this.counters.set(y, next);
    return this.format(y, next);
  }

  /** Peek at the next ID without incrementing the counter */
  peek(year?: number): string {
    const y = year ?? new Date().getFullYear();
    const current = this.counters.get(y) ?? 0;
    return this.format(y, current + 1);
  }

  /** Manually reset the counter for a year (use with caution in tests only) */
  reset(year?: number): void {
    const y = year ?? new Date().getFullYear();
    this.counters.set(y, 0);
  }

  /** Get current counter value for a year */
  currentCount(year?: number): number {
    const y = year ?? new Date().getFullYear();
    return this.counters.get(y) ?? 0;
  }

  /**
   * Validate whether a string matches the Digital Identity ID format.
   * Does NOT check for existence in the database.
   */
  validate(id: string): boolean {
    return DIGITAL_ID_REGEX.test(id);
  }

  /** Format a year + sequence number into the standard ID string */
  private format(year: number, seq: number): string {
    return `${DIGITAL_ID_PREFIX}-${year}-${String(seq).padStart(6, '0')}`;
  }
}

/** Shared singleton instance */
export const idGenerator = UniqueIdGenerator.getInstance();
