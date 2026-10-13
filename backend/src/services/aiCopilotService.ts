import { store } from './store.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface FarmContextSnapshot {
  totalCattle: number;
  healthyCount: number;
  sickCount: number;
  pregnantCount: number;
  quarantinedCount: number;
  highRiskCattle: Array<{ id: string; tag: string; name: string; breed: string; issue: string; temp: number }>;
  todayMilkLiters: number;
  sevenDayAvgLiters: number;
  overdueVaccinesCount: number;
  upcomingDeliveries: Array<{ tag: string; name: string; dueDate: string; daysLeft: number }>;
}

export class AICopilotService {
  /**
   * Builds real-time comprehensive farm context from in-memory store
   */
  public getFarmContext(): FarmContextSnapshot {
    const allCattle = store.cattle || [];
    const healthRecords = store.healthRecords || [];
    const milkLogs = store.milkLogs || [];
    const breedingRecords = store.breedingRecords || [];
    const vaccinations = store.vaccinations || [];

    const healthyCount = allCattle.filter((c: any) => c.health_status === 'healthy' || c.status === 'healthy').length;
    const sickCount = allCattle.filter((c: any) => c.health_status === 'sick' || c.status === 'sick' || c.health_status === 'under_treatment').length;
    const pregnantCount = allCattle.filter((c: any) => c.health_status === 'pregnant' || c.status === 'pregnant' || breedingRecords.some((b: any) => b.cattle_id === c.id && b.pregnancy_confirmed)).length;
    const quarantinedCount = allCattle.filter((c: any) => c.health_status === 'quarantined' || c.status === 'quarantined').length;

    // Identify high risk cattle
    const highRiskCattle: any[] = [];
    for (const c of allCattle) {
      const records = healthRecords.filter((h: any) => h.cattle_id === c.id);
      const latest = records[0];
      const temp = latest?.body_temp_c ? Number(latest.body_temp_c) : 38.5;
      const isEmergency = records.some((h: any) => h.is_emergency);
      const isSick = c.health_status === 'sick' || c.health_status === 'quarantined';

      if (isEmergency || isSick || temp > 39.5 || temp < 37.5) {
        highRiskCattle.push({
          id: c.id,
          tag: c.tag_number || c.tag_id || 'FE-UNKNOWN',
          name: c.name || 'Unnamed',
          breed: c.breed || 'Standard',
          issue: isEmergency ? 'Emergency case logged' : temp > 39.5 ? `Elevated fever (${temp}°C)` : 'Clinical health alert',
          temp,
        });
      }
    }

    // Today's milk & 7-day average
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = milkLogs.filter((m: any) => m.date === todayStr || m.created_at?.startsWith(todayStr));
    const todayMilkLiters = todayLogs.reduce((sum: number, log: any) => sum + (Number(log.quantity_liters) || Number(log.quantity) || 0), 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentLogs = milkLogs.filter((m: any) => (m.date || m.created_at) >= sevenDaysAgo);
    const recentTotal = recentLogs.reduce((sum: number, log: any) => sum + (Number(log.quantity_liters) || Number(log.quantity) || 0), 0);
    const sevenDayAvgLiters = recentLogs.length > 0 ? Math.round((recentTotal / 7) * 10) / 10 : todayMilkLiters || 45.0;

    // Overdue vaccines
    const overdueVaccinesCount = vaccinations.filter((v: any) => v.next_due_date && v.next_due_date < todayStr).length;

    // Upcoming deliveries in next 30 days
    const upcomingDeliveries: any[] = [];
    for (const b of breedingRecords) {
      if (b.pregnancy_confirmed && b.expected_calving_date) {
        const due = new Date(b.expected_calving_date);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 45) {
          const cow = allCattle.find((c: any) => c.id === b.cattle_id);
          upcomingDeliveries.push({
            tag: cow?.tag_number || cow?.tag_id || 'FE-DAM',
            name: cow?.name || 'Dam',
            dueDate: b.expected_calving_date,
            daysLeft: diffDays,
          });
        }
      }
    }

    return {
      totalCattle: allCattle.length,
      healthyCount,
      sickCount,
      pregnantCount,
      quarantinedCount,
      highRiskCattle,
      todayMilkLiters: Math.round(todayMilkLiters * 10) / 10,
      sevenDayAvgLiters,
      overdueVaccinesCount,
      upcomingDeliveries,
    };
  }

  /**
   * Process natural language query and formulate expert veterinarian response
   */
  public async generateAnswer(userQuery: string, history: AIChatMessage[] = []): Promise<{
    reply: string;
    actionUrl?: string;
    actionLabel?: string;
    suggestedFollowups?: string[];
  }> {
    const context = this.getFarmContext();

    // ── Try Gemini 1.5 Flash Cloud Model if API Key is configured ──
    if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: `You are the FarmEase AI Copilot, a leading bovine veterinarian and dairy agronomy specialist.
You have real-time live access to the farmer's herd records:
- Total Herd: ${context.totalCattle} cattle (${context.healthyCount} Healthy, ${context.sickCount} Sick/Under Watch, ${context.pregnantCount} Pregnant)
- High-Risk Animals: ${JSON.stringify(context.highRiskCattle)}
- Today's Milk Output: ${context.todayMilkLiters} Liters (7-day average: ${context.sevenDayAvgLiters} L)
- Overdue Vaccinations: ${context.overdueVaccinesCount}
- Upcoming Calving Deliveries: ${JSON.stringify(context.upcomingDeliveries)}

Provide structured, empathetic, clinically accurate, practical veterinary & dairy agronomy guidance.
Format with clean Markdown headers, bullet points, and actionable first-aid steps. Reference cattle IDs when relevant.`
        });

        const chat = model.startChat({
          history: history.slice(-6).map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          }))
        });

        const result = await chat.sendMessage(userQuery);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return {
            reply: text,
            suggestedFollowups: [
              'Check herd vaccination status',
              'How to optimize feed for higher yield?',
              'Review upcoming calving dates'
            ]
          };
        }
      } catch (geminiError: any) {
        console.warn('Gemini 1.5 Flash call failed, falling back to Agritech Neural Engine:', geminiError?.message || geminiError);
      }
    }

    const queryLower = userQuery.toLowerCase().trim();

    // 1. High-risk or Sick cattle inquiry
    if (queryLower.includes('sick') || queryLower.includes('risk') || queryLower.includes('health') || queryLower.includes('fever') || queryLower.includes('emergency')) {
      if (context.highRiskCattle.length > 0) {
        const cattleList = context.highRiskCattle
          .map(c => `• **${c.name}** (\`${c.tag}\` - ${c.breed}): ${c.issue}`)
          .join('\n');

        return {
          reply: `🚨 **Live Farm Health Risk Alert**\n\nThere are currently **${context.highRiskCattle.length} cattle** requiring immediate clinical attention:\n\n${cattleList}\n\n**Recommended Clinical Steps:**\n1. Isolate cattle with active fever (>39.5°C) to prevent contagious spread.\n2. Re-check rectal temperature and rumination every 4 hours.\n3. Verify hydration with clean electrolyte water.\n4. Consult your registered veterinarian before administering systemic antibiotics.`,
          actionUrl: '/ai-insights?tab=health',
          actionLabel: 'View Health Risk Intelligence',
          suggestedFollowups: [
            'How do I treat high fever in cows?',
            'What is the recommended feed for sick cattle?',
            'Check mastitis symptoms'
          ]
        };
      } else {
        return {
          reply: `✅ **Herd Health Baseline is Normal**\n\nAll **${context.totalCattle} cattle** in your herd are currently within baseline health parameters:\n• **${context.healthyCount}** Healthy\n• **${context.pregnantCount}** Pregnant (routine monitoring)\n• **0** Active emergency cases\n\n${context.overdueVaccinesCount > 0 ? `⚠️ *Note:* You have **${context.overdueVaccinesCount} overdue vaccination(s)** that should be scheduled.` : 'All vaccination schedules are up to date!'}`,
          actionUrl: '/health',
          actionLabel: 'Open Health Records',
          suggestedFollowups: [
            'Show upcoming vaccination dates',
            'How can I boost overall herd immunity?',
            'Check milk production performance'
          ]
        };
      }
    }

    // 2. Milk yield & production boost inquiry
    if (queryLower.includes('milk') || queryLower.includes('yield') || queryLower.includes('production') || queryLower.includes('liters')) {
      return {
        reply: `🥛 **Milk Production & Yield Intelligence**\n\n**Current Harvest Metrics:**\n• Today's Recorded Yield: **${context.todayMilkLiters} L**\n• 7-Day Rolling Average: **${context.sevenDayAvgLiters} L / day**\n• Active Milking Herd: **${Math.max(context.totalCattle - context.sickCount - context.quarantinedCount, 0)} cows**\n\n**AI Recommendations to Boost Milk Yield (by +15% to +20%):**\n1. **Feed Balance:** Ensure each lactating cow receives **3–4 kg of concentrates** per 10 L of milk produced, mixed with 20–25 kg green fodder (sorghum, silage, or lucerne).\n2. **Clean Water Ad-Libitum:** Dairy cows require **4–5 liters of clean water for every 1 liter of milk**.\n3. **Milking Regularity:** Maintain strict 12-hour intervals between morning and evening milking to maximize udder alveolar pressure release.\n4. **Bypass Fat & Mineral Mix:** Add 100g of chelated mineral mixture daily to sustain peak lactation persistency.`,
        actionUrl: '/ai-insights?tab=milk',
        actionLabel: 'View 30-Day Milk Yield Forecast',
        suggestedFollowups: [
          'Calculate feed ration for high yield',
          'Why did milk yield drop suddenly?',
          'Which cows are due for delivery soon?'
        ]
      };
    }

    // 3. Feed & Nutrition formulation
    if (queryLower.includes('feed') || queryLower.includes('diet') || queryLower.includes('nutrition') || queryLower.includes('ration') || queryLower.includes('fodder')) {
      return {
        reply: `🌾 **Scientific Dairy Cattle Feed Formulation Plan**\n\nFor a standard dairy cow (450–500 kg body weight producing 12–16 L milk/day):\n\n| Component | Daily Requirement | Purpose |\n| :--- | :--- | :--- |\n| **Green Fodder (Legumes & Grasses)** | **20 – 25 kg** | Ruminal bulk & Vitamin A |\n| **Dry Fodder (Straw / Hay)** | **4 – 6 kg** | Effective fiber & saliva buffering |\n| **Balanced Concentrate Pellets** | **4 – 5 kg** | Energy & crude protein (18–20%) |\n| **Chelated Mineral Mixture** | **80 – 100 g** | Reproductive & bone health |\n| **Clean Drinking Water** | **60 – 90 Liters** | Essential for metabolic flow |\n\n💡 *Pro-Tip:* Feed concentrates immediately before or during milking, and never feed moldy hay to prevent aflatoxin contamination in milk.`,
        actionUrl: '/inventory',
        actionLabel: 'Check Feed Inventory Stock',
        suggestedFollowups: [
          'How much feed does a pregnant cow need?',
          'How do I treat bloat caused by wet grass?',
          'Calculate feed cost vs milk profit'
        ]
      };
    }

    // 4. Breeding, Insemination & Calving inquiry
    if (queryLower.includes('breed') || queryLower.includes('pregnan') || queryLower.includes('calv') || queryLower.includes('heat') || queryLower.includes('artificial insemination') || queryLower.includes('ai ')) {
      const deliveriesText = context.upcomingDeliveries.length > 0
        ? context.upcomingDeliveries.map(d => `• **${d.name}** (\`${d.tag}\`): Due on **${d.dueDate}** (in **${d.daysLeft} days**)`).join('\n')
        : '• No calving deliveries due within the next 45 days.';

      return {
        reply: `🧬 **Breeding & Gestation Intelligence**\n\n**Current Herd Reproductive Status:**\n• Confirmed Pregnant: **${context.pregnantCount} cows**\n• Average Bovine Gestation: **283 Days** (± 5 days)\n\n**Upcoming Calving Deliveries:**\n${deliveriesText}\n\n**Heat Detection & Insemination Rules (AM-PM Rule):**\n• Cow observed in standing heat in the **Morning** &rarr; Inseminate in the **Evening**.\n• Cow observed in standing heat in the **Evening** &rarr; Inseminate the next **Morning**.\n• Peak fertility window is **12–18 hours** from the onset of standing heat.`,
        actionUrl: '/ai-insights?tab=breeding',
        actionLabel: 'Open Breeding Intelligence',
        suggestedFollowups: [
          'What are the signs of impending calving?',
          'How to identify silent heat in cattle?',
          'Check prenatal nutrition guidelines'
        ]
      };
    }

    // 5. Mastitis or Udder diseases
    if (queryLower.includes('mastitis') || queryLower.includes('udder') || queryLower.includes('teat') || queryLower.includes('clot')) {
      return {
        reply: `🩺 **Bovine Mastitis Emergency Protocol**\n\nMastitis is an inflammation of the mammary gland typically caused by bacterial invasion (*Staph, Strep, or E. coli*).\n\n**Immediate Clinical Actions:**\n1. **Frequent Stripping:** Hand-strip the affected quarter completely every **2 hours** to evacuate toxic bacterial fluid.\n2. **Segregate Milk:** Do **NOT** mix milk from infected quarters into the bulk milk vat. Withhold from human consumption.\n3. **Cold / Warm Hydrotherapy:** Apply cold compresses if the udder is acutely swollen, hot, and painful.\n4. **Post-Milking Teat Dip:** Dip all 4 teats in 0.5%–1.0% Iodine barrier solution immediately after stripping.\n5. **Vet Consultation:** Request intramammary antibiotic infusion based on California Mastitis Test (CMT) or milk culture.`,
        actionUrl: '/ai-insights?tab=diagnostic',
        actionLabel: 'Launch AI Visual Disease Scanner',
        suggestedFollowups: [
          'Show antibiotics withdrawal time',
          'How to perform California Mastitis Test (CMT)?',
          'Which cattle currently have udder swelling?'
        ]
      };
    }

    // 6. Bloat or Digestive issues
    if (queryLower.includes('bloat') || queryLower.includes('rumen') || queryLower.includes('flank') || queryLower.includes('diarrhea') || queryLower.includes('gas')) {
      return {
        reply: `⚠️ **Emergency Rumen Bloat (Tympanites) Protocol**\n\nBloat is a life-threatening veterinary emergency where gases cannot escape the rumen, exerting pressure on the diaphragm and heart.\n\n**Immediate First-Aid Measures:**\n1. **Keep Animal Upright:** Walk the animal gently uphill if possible to facilitate natural eructation (belching).\n2. **Stomach Tube / Gag:** Place a wooden bit or broom handle in the mouth like a bridle to stimulate saliva flow and chewing motion.\n3. **Anti-Foaming Agent:** For frothy bloat (from young legumes), drench with **250–500 ml of vegetable oil** (groundnut or linseed oil) or commercially available Simethicone drench.\n4. **Trocar & Cannula (Extreme Emergency Only):** If the left flank is taut as a drum and the animal is gasping, an emergency puncture in the center of the left paralumbar fossa may be required by a veterinarian.`,
        actionUrl: '/health',
        actionLabel: 'Log Health Emergency Record',
        suggestedFollowups: [
          'What causes sudden bloat in cattle?',
          'How to prevent bloat when feeding green clover?',
          'Check veterinary emergency contact numbers'
        ]
      };
    }

    // 7. General / Catch-all Agritech AI response
    return {
      reply: `🐄 **FarmEase Agritech AI Assistant**\n\nI have analyzed your farm state with **${context.totalCattle} cattle**:\n• **${context.healthyCount}** Healthy | **${context.sickCount}** Under Watch | **${context.pregnantCount}** Pregnant\n• Today's Milk Output: **${context.todayMilkLiters} Liters**\n\n**How can I help you today?**\n• 🩺 *Diagnose symptoms* (e.g. fever, lameness, udder swelling)\n• 🌾 *Calculate custom feed rations* for maximum milk yield\n• 🧬 *Check breeding & delivery countdowns*\n• 📸 *Analyze cattle disease photos* via AI Image Diagnostic\n• 📊 *Review 30-day milk yield projections*`,
      actionUrl: '/ai-insights',
      actionLabel: 'Open AI Insights Center',
      suggestedFollowups: [
        'Which cattle require medical attention today?',
        'How can I increase daily milk yield?',
        'Show calving delivery countdowns',
        'Recommend feed plan for Jersey cows'
      ]
    };
  }
}

export const aiCopilotService = new AICopilotService();
