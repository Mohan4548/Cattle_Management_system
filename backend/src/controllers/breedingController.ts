import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { BreedingRecord, Cattle } from '../types/index.js';

export const getBreedingRecords = async (req: Request, res: Response) => {
  const { cattle_id } = req.query;
  let result = [...store.breedingRecords];

  if (cattle_id) {
    result = result.filter(b => b.cattle_id === cattle_id);
  }

  // Calculate live days remaining for expected calving dates
  const now = new Date();
  result.forEach(r => {
    if (r.expected_calving_date && r.outcome !== 'Successful' && r.outcome !== 'Failed') {
      const exp = new Date(r.expected_calving_date);
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      r.days_remaining = diffDays > 0 ? diffDays : 0;
    }
  });

  return res.json(result);
};

export const createBreedingRecord = async (req: Request, res: Response) => {
  const { 
    cattle_id, 
    event_type, 
    event_date, 
    sire_info, 
    sire_tag,
    dam_tag,
    outcome, 
    technician_name, 
    notes 
  } = req.body;

  if (!cattle_id || !event_type || !event_date) {
    return res.status(400).json({ message: 'Cattle ID, event type, and event date are required' });
  }

  const cattle = store.cattle.find(c => c.id === cattle_id);

  let expectedCalvingDate: string | undefined;
  if (event_type === 'Insemination' || event_type === 'Pregnancy Check') {
    // Gestation period for cattle is ~283 days
    const baseDate = new Date(event_date);
    baseDate.setDate(baseDate.getDate() + 283);
    expectedCalvingDate = baseDate.toISOString().split('T')[0];
  }

  const newRecord: BreedingRecord = {
    id: `br-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    event_type,
    event_date,
    sire_info: sire_info || 'BULL-92 (Jersey High Merit)',
    sire_tag: sire_tag || 'BULL-92',
    dam_tag: dam_tag || cattle?.tag_number || 'FE-CAT-2026-001',
    expected_calving_date: expectedCalvingDate,
    days_remaining: expectedCalvingDate ? 245 : undefined,
    outcome: outcome || 'Pending',
    technician_name: technician_name || 'Dr. Marcus Vance',
    notes,
  };

  store.breedingRecords.unshift(newRecord);

  // Update cattle health status to pregnant if Pregnancy Check is positive
  if (cattle && (event_type === 'Pregnancy Check' || outcome === 'Successful')) {
    cattle.health_status = 'pregnant';
  }

  // Add timeline entry
  if (cattle) {
    cattle.timeline = cattle.timeline || [];
    cattle.timeline.unshift({
      id: `t-${Date.now()}`,
      title: `Breeding Event: ${event_type}`,
      date: event_date,
      category: 'breeding',
      description: `Sire: ${sire_info || 'BULL-92'}. Expected Calving: ${expectedCalvingDate || 'TBD'}`,
    });
  }

  return res.status(201).json(newRecord);
};

// 1-Click Calf Registration into Herd Directory
export const registerCalf = async (req: Request, res: Response) => {
  const { 
    breeding_record_id, 
    calf_name, 
    calf_gender, 
    breed, 
    birth_weight, 
    delivery_type, 
    dam_tag, 
    sire_tag 
  } = req.body;

  const record = store.breedingRecords.find(b => b.id === breeding_record_id);

  // Auto Generate Tag ID for Calf
  const calfTag = `FE-CALF-2026-00${store.cattle.length + 1}`;
  const birthDate = new Date().toISOString().split('T')[0];

  const newCalf: Cattle = {
    id: `cattle-calf-${Date.now()}`,
    tag_number: calfTag,
    name: calf_name || 'Newborn Calf',
    breed: breed || 'Gir Cross',
    gender: calf_gender || 'female',
    date_of_birth: birthDate,
    age: '0 yrs 1 mo',
    weight_kg: Number(birth_weight) || 32,
    height_cm: 75,
    color: 'Reddish Brown',
    horn_type: 'Polled',
    health_status: 'healthy',
    lactation_stage: calf_gender === 'female' ? 'heifer' : 'bull',
    owner_name: 'Green Valley Farm',
    owner_phone: '+91 98765 43210',
    image_url: calf_gender === 'female' 
      ? 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1570042707227-2c9664f33d7b?w=600&auto=format&fit=crop&q=80',
    qr_code_data: calfTag,
    sire_tag: sire_tag || record?.sire_tag || 'BULL-92',
    dam_tag: dam_tag || record?.dam_tag || 'FE-CAT-2026-001',
    notes: `Born via ${delivery_type || 'Normal'} delivery. Linked Dam: ${dam_tag || 'FE-CAT-2026-001'}, Sire: ${sire_tag || 'BULL-92'}`,
    created_at: new Date().toISOString(),
    timeline: [
      {
        id: `t-birth-${Date.now()}`,
        title: 'Calf Born on Farm',
        date: birthDate,
        category: 'birth',
        description: `Born via ${delivery_type || 'Normal'} delivery. Birth Weight: ${birth_weight || 32} kg. Dam: ${dam_tag}, Sire: ${sire_tag}`,
      }
    ]
  };

  store.cattle.unshift(newCalf);

  if (record) {
    record.outcome = 'Successful';
    record.actual_calving_date = birthDate;
    record.calf_id = newCalf.id;
  }

  return res.status(201).json(newCalf);
};
