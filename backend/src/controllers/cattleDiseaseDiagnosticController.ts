import { Request, Response } from 'express';
import { cattleDiseaseDiagnosticService, SYMPTOMS_LIST } from '../services/cattleDiseaseDiagnosticService.js';

export const getSymptomsList = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      total: SYMPTOMS_LIST.length,
      symptoms: SYMPTOMS_LIST,
    });
  } catch (error: any) {
    console.error('Error fetching symptoms list:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve clinical symptoms list.',
    });
  }
};

export const diagnoseSymptoms = async (req: Request, res: Response) => {
  try {
    const { cattleId, symptoms, vitals } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'At least one clinical symptom must be selected for diagnosis triage.',
      });
    }

    const diagnosis = cattleDiseaseDiagnosticService.diagnose({
      cattleId,
      symptoms,
      vitals,
    });

    return res.status(200).json(diagnosis);
  } catch (error: any) {
    console.error('Error diagnosing cattle symptoms:', error);
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to compute diagnostic analysis.',
    });
  }
};
