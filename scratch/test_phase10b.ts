import { store } from '../backend/src/services/store.js';
import { cattleBreedingAnalysisService } from '../backend/src/services/cattleBreedingAnalysisService.js';

async function runPhase10BTests() {
  console.log('====================================================');
  console.log('FARMEASE PHASE 10B: PREGNANCY TIMELINE & ESTIMATED DELIVERY TEST');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
      process.exitCode = 1;
    }
  }

  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // ----------------------------------------------------
  // TEST 1: 1st Trimester Confirmed Pregnancy (Day 30)
  // ----------------------------------------------------
  const cowT1 = {
    id: 'test-cow-t1',
    tag_number: 'FE-COW-T1',
    name: 'Kamadhenu',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2021-01-10',
    weight_kg: 450,
    health_status: 'pregnant',
    lactation_stage: 'early',
    created_at: new Date().toISOString()
  };
  store.cattle.push(cowT1);

  const insDateT1 = formatDate(30);
  store.breedingRecords.unshift({
    id: 'br-t1-ins',
    cattle_id: cowT1.id,
    cattle_tag: cowT1.tag_number,
    event_type: 'Insemination',
    event_date: insDateT1,
    sire_info: 'BULL-GIR-01'
  });
  store.breedingRecords.unshift({
    id: 'br-t1-check',
    cattle_id: cowT1.id,
    cattle_tag: cowT1.tag_number,
    event_type: 'Pregnancy Check',
    event_date: insDateT1,
    pregnancy_confirmed: true,
    outcome: 'Successful'
  });

  const insightT1 = await cattleBreedingAnalysisService.getBreedingInsight(cowT1.id);
  assert(
    insightT1.pregnancyStatus === 'CONFIRMED',
    '1st Trimester cow reports CONFIRMED pregnancy',
    `Status: ${insightT1.pregnancyStatus}`
  );
  assert(
    insightT1.pregnancyDetails?.trimesterCode === 'TRIMESTER_1',
    'Day 30 is categorized as TRIMESTER_1',
    `TrimesterCode: ${insightT1.pregnancyDetails?.trimesterCode}`
  );
  assert(
    insightT1.pregnancyDetails?.daysPregnant === 30,
    'Days pregnant equals 30',
    `DaysPregnant: ${insightT1.pregnancyDetails?.daysPregnant}`
  );
  assert(
    insightT1.estimatedDeliveryWindow !== undefined &&
    insightT1.estimatedDeliveryWindow.start < insightT1.estimatedDeliveryDate! &&
    insightT1.estimatedDeliveryWindow.end > insightT1.estimatedDeliveryDate!,
    'Delivery window spans +/- 8 days around baseline expected delivery date'
  );
  assert(
    insightT1.dryOffDate !== undefined,
    'Dry off date calculated (Insemination + 223 days)',
    `DryOffDate: ${insightT1.dryOffDate}`
  );
  assert(
    insightT1.pregnancyDetails?.careRecommendations?.some(r => r.includes('ultrasound pregnancy confirmation')),
    'Includes 1st Trimester care recommendations'
  );

  // ----------------------------------------------------
  // TEST 2: 2nd Trimester Confirmed Pregnancy (Day 120)
  // ----------------------------------------------------
  const cowT2 = {
    id: 'test-cow-t2',
    tag_number: 'FE-COW-T2',
    name: 'Gauri',
    breed: 'Sahiwal',
    gender: 'female',
    date_of_birth: '2020-03-15',
    weight_kg: 480,
    health_status: 'pregnant',
    lactation_stage: 'mid',
    created_at: new Date().toISOString()
  };
  store.cattle.push(cowT2);

  const insDateT2 = formatDate(120);
  store.breedingRecords.unshift({
    id: 'br-t2-ins',
    cattle_id: cowT2.id,
    cattle_tag: cowT2.tag_number,
    event_type: 'Insemination',
    event_date: insDateT2,
    sire_info: 'BULL-SAHIWAL-02'
  });
  store.breedingRecords.unshift({
    id: 'br-t2-check',
    cattle_id: cowT2.id,
    cattle_tag: cowT2.tag_number,
    event_type: 'Pregnancy Check',
    event_date: insDateT2,
    pregnancy_confirmed: true,
    outcome: 'Successful'
  });

  const insightT2 = await cattleBreedingAnalysisService.getBreedingInsight(cowT2.id);
  assert(
    insightT2.pregnancyDetails?.trimesterCode === 'TRIMESTER_2',
    'Day 120 is categorized as TRIMESTER_2',
    `TrimesterCode: ${insightT2.pregnancyDetails?.trimesterCode}`
  );
  assert(
    insightT2.pregnancyDetails?.progressPercentage === Math.round((120 / 283) * 100),
    'Progress percentage matches gestation ratio (~42%)',
    `Progress%: ${insightT2.pregnancyDetails?.progressPercentage}%`
  );

  // ----------------------------------------------------
  // TEST 3: 3rd Trimester Confirmed Pregnancy (Day 200)
  // ----------------------------------------------------
  const cowT3 = {
    id: 'test-cow-t3',
    tag_number: 'FE-COW-T3',
    name: 'Nandini',
    breed: 'Red Sindhi',
    gender: 'female',
    date_of_birth: '2019-06-20',
    weight_kg: 460,
    health_status: 'pregnant',
    lactation_stage: 'late',
    created_at: new Date().toISOString()
  };
  store.cattle.push(cowT3);

  const insDateT3 = formatDate(200);
  store.breedingRecords.unshift({
    id: 'br-t3-ins',
    cattle_id: cowT3.id,
    cattle_tag: cowT3.tag_number,
    event_type: 'Insemination',
    event_date: insDateT3,
    sire_info: 'BULL-RS-05'
  });
  store.breedingRecords.unshift({
    id: 'br-t3-check',
    cattle_id: cowT3.id,
    cattle_tag: cowT3.tag_number,
    event_type: 'Pregnancy Check',
    event_date: insDateT3,
    pregnancy_confirmed: true,
    outcome: 'Successful'
  });

  const insightT3 = await cattleBreedingAnalysisService.getBreedingInsight(cowT3.id);
  assert(
    insightT3.pregnancyDetails?.trimesterCode === 'TRIMESTER_3',
    'Day 200 is categorized as TRIMESTER_3',
    `TrimesterCode: ${insightT3.pregnancyDetails?.trimesterCode}`
  );
  assert(
    insightT3.pregnancyDetails?.careRecommendations?.some(r => r.includes('Prepare for dry-off at Day 223')),
    'Includes 3rd Trimester care recommendations'
  );

  // ----------------------------------------------------
  // TEST 4: Dry Period Confirmed Pregnancy (Day 235)
  // ----------------------------------------------------
  const cowDry = {
    id: 'test-cow-dry',
    tag_number: 'FE-COW-DRY',
    name: 'Kapila',
    breed: 'Holstein Friesian',
    gender: 'female',
    date_of_birth: '2018-11-05',
    weight_kg: 550,
    health_status: 'pregnant',
    lactation_stage: 'dry',
    created_at: new Date().toISOString()
  };
  store.cattle.push(cowDry);

  const insDateDry = formatDate(235);
  store.breedingRecords.unshift({
    id: 'br-dry-ins',
    cattle_id: cowDry.id,
    cattle_tag: cowDry.tag_number,
    event_type: 'Insemination',
    event_date: insDateDry,
    sire_info: 'BULL-HF-99'
  });
  store.breedingRecords.unshift({
    id: 'br-dry-check',
    cattle_id: cowDry.id,
    cattle_tag: cowDry.tag_number,
    event_type: 'Pregnancy Check',
    event_date: insDateDry,
    pregnancy_confirmed: true,
    outcome: 'Successful'
  });

  const insightDry = await cattleBreedingAnalysisService.getBreedingInsight(cowDry.id);
  assert(
    insightDry.pregnancyDetails?.trimesterCode === 'DRY_PERIOD',
    'Day 235 is categorized as DRY_PERIOD',
    `TrimesterCode: ${insightDry.pregnancyDetails?.trimesterCode}`
  );
  assert(
    insightDry.pregnancyDetails?.careRecommendations?.some(r => r.includes('Stop milking and apply dry-cow mastitis therapy')),
    'Includes Dry Period recommendations'
  );

  // ----------------------------------------------------
  // TEST 5: Unconfirmed Pregnancy Handling
  // ----------------------------------------------------
  const cowUnconfirmed = {
    id: 'test-cow-unconf',
    tag_number: 'FE-COW-UNCONF',
    name: 'Bhavani',
    breed: 'Kankrej',
    gender: 'female',
    date_of_birth: '2022-04-12',
    weight_kg: 410,
    health_status: 'healthy',
    lactation_stage: 'heifer',
    created_at: new Date().toISOString()
  };
  store.cattle.push(cowUnconfirmed);

  const insDateUnconf = formatDate(45);
  store.breedingRecords.unshift({
    id: 'br-unconf-ins',
    cattle_id: cowUnconfirmed.id,
    cattle_tag: cowUnconfirmed.tag_number,
    event_type: 'Insemination',
    event_date: insDateUnconf,
    sire_info: 'BULL-KAN-01'
  });

  const insightUnconf = await cattleBreedingAnalysisService.getBreedingInsight(cowUnconfirmed.id);
  assert(
    insightUnconf.pregnancyStatus === 'UNCONFIRMED',
    'Unconfirmed pregnancy returns UNCONFIRMED status',
    `PregnancyStatus: ${insightUnconf.pregnancyStatus}`
  );
  assert(
    insightUnconf.pregnancyDetails?.isPregnant === false,
    'isPregnant is false for unconfirmed pregnancy',
    `IsPregnant: ${insightUnconf.pregnancyDetails?.isPregnant}`
  );
  assert(
    insightUnconf.insights.some(i => i.includes('Pregnancy confirmation not recorded')),
    'Insights report that pregnancy confirmation is not recorded'
  );
  assert(
    insightUnconf.disclaimer.toLowerCase().includes('decision-support tool'),
    'Disclaimer contains decision-support phrasing'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase10BTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
