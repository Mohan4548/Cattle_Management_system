import { Request, Response } from 'express';
import { cattleHealthRiskService } from '../services/cattleHealthRiskService.js';

export const getHealthRisk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Cattle ID parameter is required.'
      });
    }

    const healthRiskResult = await cattleHealthRiskService.getHealthRisk(id);
    return res.status(200).json(healthRiskResult);
  } catch (error: any) {
    if (error?.message === 'INVALID_CATTLE_ID') {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Invalid cattle ID provided.'
      });
    }
    if (error?.message === 'CATTLE_NOT_FOUND') {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Cattle record not found for health risk analysis.'
      });
    }

    console.error('Error calculating health risk:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to process health risk analysis at this time.'
    });
  }
};

export const getAIHealthInsights = async (req: Request, res: Response) => {
  try {
    const insights = await cattleHealthRiskService.getAIHealthInsights();
    return res.status(200).json(insights);
  } catch (error: any) {
    console.error('Error fetching AI Health Insights:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to retrieve AI Health Insights at this time.'
    });
  }
};
