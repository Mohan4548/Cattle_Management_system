import { Request, Response } from 'express';
import { cattleBreedingAnalysisService } from '../services/cattleBreedingAnalysisService.js';

/**
 * GET /api/cattle/:id/breeding-insights
 * Fetches structured AI Breeding Insight and Pregnancy Timeline for a specific cattle
 */
export const getBreedingInsight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ message: 'Valid cattle ID parameter is required' });
    }

    const result = await cattleBreedingAnalysisService.getBreedingInsight(id.trim());
    return res.json(result);
  } catch (error: any) {
    console.error(`Error in getBreedingInsight for cattle ${req.params?.id}:`, error);

    if (error?.message === 'INVALID_CATTLE_ID') {
      return res.status(400).json({ message: 'Invalid cattle ID specified' });
    }

    if (error?.message === 'CATTLE_NOT_FOUND') {
      return res.status(404).json({ message: 'Cattle record not found' });
    }

    return res.status(500).json({
      message: 'Unable to generate breeding insights. Please try again later.'
    });
  }
};

/**
 * GET /api/farm/breeding-insights
 * Fetches aggregate farm-level breeding & pregnancy intelligence dashboard stats
 */
export const getFarmBreedingInsights = async (req: Request, res: Response) => {
  try {
    const result = await cattleBreedingAnalysisService.getFarmBreedingInsights();
    return res.json(result);
  } catch (error: any) {
    console.error('Error in getFarmBreedingInsights:', error);
    return res.status(500).json({
      message: 'Unable to load farm breeding insights. Please try again later.'
    });
  }
};

