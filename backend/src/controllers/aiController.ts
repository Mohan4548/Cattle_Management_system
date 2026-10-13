import { Request, Response } from 'express';
import { aiCopilotService } from '../services/aiCopilotService.js';
import { milkPredictionAIService } from '../services/milkPredictionAIService.js';
import { aiImageDiagnosticService } from '../services/aiImageDiagnosticService.js';

export const chatWithAICopilot = async (req: Request, res: Response) => {
  try {
    const { query, history } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'A message query string is required.'
      });
    }

    const response = await aiCopilotService.generateAnswer(query, history || []);
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error in AI Copilot chat:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process AI Copilot response.'
    });
  }
};

export const getCopilotSuggestions = async (req: Request, res: Response) => {
  try {
    const context = aiCopilotService.getFarmContext();
    const suggestions: string[] = [];

    if (context.highRiskCattle.length > 0) {
      suggestions.push(`Review health risks for ${context.highRiskCattle[0].name}`);
    } else {
      suggestions.push('How can I boost herd milk yield?');
    }

    if (context.upcomingDeliveries.length > 0) {
      suggestions.push(`Calving prep for ${context.upcomingDeliveries[0].name}`);
    } else {
      suggestions.push('Recommend optimal feed ration');
    }

    if (context.overdueVaccinesCount > 0) {
      suggestions.push(`Plan ${context.overdueVaccinesCount} overdue vaccines`);
    } else {
      suggestions.push('Check Mastitis prevention tips');
    }

    return res.status(200).json({
      farmContext: context,
      suggestions
    });
  } catch (error: any) {
    console.error('Error fetching copilot suggestions:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to retrieve suggestions.'
    });
  }
};

export const getMilkForecast = async (req: Request, res: Response) => {
  try {
    const targetYield = req.query.target ? Number(req.query.target) : undefined;
    const forecast = milkPredictionAIService.generateForecast(targetYield);
    return res.status(200).json(forecast);
  } catch (error: any) {
    console.error('Error generating milk forecast:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to generate milk yield forecast.'
    });
  }
};

export const analyzeDiagnosticImage = async (req: Request, res: Response) => {
  try {
    const { preset, imageBase64 } = req.body;
    const result = await aiImageDiagnosticService.analyzeImage(preset, imageBase64);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error analyzing diagnostic image:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to process image diagnosis.'
    });
  }
};
