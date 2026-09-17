/**
 * FarmEase – useDigitalIdentity React Hook
 * Phase 1: QR Digital Identity Foundation
 *
 * Provides a complete interface for fetching, creating, updating,
 * regenerating, and validating a cattle's Digital Identity.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DigitalIdentity } from '../types/index';
import {
  fetchIdentityByCattleId,
  createOrEnsureIdentity,
  regenerateIdentity as apiRegenerateIdentity,
  validateIdentityId as apiValidateId,
} from '../services/index';

interface UseDigitalIdentityOptions {
  /** If true, automatically fetch the identity on mount */
  autoFetch?: boolean;
}

interface UseDigitalIdentityReturn {
  identity: DigitalIdentity | null;
  loading: boolean;
  error: string | null;
  /** Fetch / refresh the identity from the API */
  fetchIdentity: () => Promise<void>;
  /** Ensure an identity exists (idempotent create) */
  ensureIdentity: () => Promise<DigitalIdentity | null>;
  /** Regenerate identity metadata (admin only; keeps Digital ID permanent) */
  regenerateIdentity: () => Promise<DigitalIdentity | null>;
  /** Validate a Digital Identity ID string via the API */
  validateId: (id: string) => Promise<{ valid: boolean; errors: string[] }>;
  /** Clear any error state */
  clearError: () => void;
}

export function useDigitalIdentity(
  cattleId: string | undefined,
  options: UseDigitalIdentityOptions = {}
): UseDigitalIdentityReturn {
  const { autoFetch = true } = options;

  const [identity, setIdentity] = useState<DigitalIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    if (!cattleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIdentityByCattleId(cattleId);
      setIdentity(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch Digital Identity';
      // 404 is expected for cattle without an identity — not a hard error
      if (err?.response?.status === 404) {
        setIdentity(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [cattleId]);

  const ensureIdentity = useCallback(async (): Promise<DigitalIdentity | null> => {
    if (!cattleId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await createOrEnsureIdentity(cattleId);
      setIdentity(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create Digital Identity';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cattleId]);

  const regenerateIdentity = useCallback(async (): Promise<DigitalIdentity | null> => {
    if (!cattleId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRegenerateIdentity(cattleId);
      setIdentity(data);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to regenerate Digital Identity';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cattleId]);

  const validateId = useCallback(async (id: string) => {
    try {
      const result = await apiValidateId(id);
      return { valid: result.valid, errors: result.errors };
    } catch (err: any) {
      return { valid: false, errors: [err?.message ?? 'Validation failed'] };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (autoFetch && cattleId) {
      fetchIdentity();
    }
  }, [cattleId, autoFetch, fetchIdentity]);

  return {
    identity,
    loading,
    error,
    fetchIdentity,
    ensureIdentity,
    regenerateIdentity,
    validateId,
    clearError,
  };
}
