import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Recommendations API for Academic Diagnostics & Interventions
  app.post('/api/ai-recommendations', async (req, res) => {
    try {
      const { classData, subjectStats, overallStats, prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // If API key is available, call Gemini 3.8 Flash
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const systemPrompt = `आप माँ दुर्गा उच्च. माध्य. विद्यालय सेमरिया, रीवा (म.प्र.) के एक अनुभवी वरिष्ठ शैक्षणिक सलाहकार (Academic Dean & AI Educational Strategist) हैं।
आपको विद्यालय की परीक्षा परिणाम और विषयवार आंकड़े (Class & Subject Performance Metrics) दिए जा रहे हैं।
आपका लक्ष्य है:
1. 'कहाँ गलत है और क्या सुधार करना है' - सटीक और व्यवहारिक निदान (Root-Cause Diagnosis)।
2. विषयवार कमजोरी और थ्योरी बनाम प्रोजेक्ट विसंगतियों का विश्लेषण (विशेषकर कॉमर्स में एकाउंट्स, गणित, अंग्रेजी या विज्ञान विषयों की थ्योरी कटऑफ)।
3. शिक्षक व प्रधानाचार्य हेतु तुरंत लागू करने योग्य 4-5 स्पष्ट सुधारात्मक सुझाव (Actionable Remedial Plan)।
4. कमजोर/फेल छात्रों (At-risk students) हेतु उपचारात्मक शिक्षण (Remedial Coaching) रणनीति।
भाषा: स्पष्ट, उच्च-गुणवत्ता वाली, विनम्र, प्रेरणादायक एवं व्यावहारिक हिंदी (हिंदी + प्रमुख शैक्षणिक तकनीकी शब्द)।
उत्तर को आकर्षक बुलेट पॉइंट्स और शीर्षकों में संरचित करें।`;

          const userContent = prompt || `कक्षा: ${classData?.className || 'सम्पूर्ण विद्यालय'}
परीक्षा: ${classData?.examName || 'त्रैमासिक/अर्द्धवार्षिक परीक्षा'}
कुल विद्यार्थी: ${classData?.total || 0}, उपस्थित: ${classData?.appeared || 0}, उत्तीर्ण: ${classData?.passed || 0}, अनुत्तीर्ण: ${classData?.failed || 0}
उत्तीर्ण प्रतिशत: ${classData?.passRate || 0}%, औसत प्राप्तांक: ${classData?.avgPercentage || 0}%
विषयवार विश्लेषण:
${(subjectStats || []).map((s: any) => `- ${s.name}: औसत ${s.avgMarks}/${s.maxMarks} (${s.avgPercentage}%), फेल विद्यार्थी: ${s.failedCount}, उत्तीर्णांक: ${s.minMarks}`).join('\n')}

कृपया इस कक्षा/विद्यालय के लिए विस्तृत शैक्षणिक सुधार सिफारिशें (Strategic Academic Recommendations) प्रदान करें।`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            return res.json({
              success: true,
              source: 'gemini-3.8-flash',
              text: response.text,
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, using built-in intelligent diagnostic engine:', geminiError.message);
        }
      }

      // Built-in intelligent educational diagnostic engine fallback
      const fallbackText = generateBuiltinRecommendations(classData, subjectStats, overallStats);
      return res.json({
        success: true,
        source: 'diagnostic-engine',
        text: fallbackText,
      });
    } catch (error: any) {
      console.error('Error generating AI recommendation:', error);
      const fallbackText = generateBuiltinRecommendations(req.body?.classData, req.body?.subjectStats, req.body?.overallStats);
      return res.json({
        success: true,
        source: 'diagnostic-engine',
        text: fallbackText,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateBuiltinRecommendations(classData: any, subjectStats: any[] = [], overallStats: any = {}): string {
  const className = classData?.className || 'सम्पूर्ण विद्यालय';
  const passRate = classData?.passRate !== undefined ? Number(classData.passRate) : Number(overallStats?.passRate || 0);
  const avg = classData?.avgPercentage !== undefined ? Number(classData.avgPercentage) : Number(overallStats?.overallAvg || 0);

  // Identify weakest subject
  let weakestSubject: any = null;
  let highestFailSubject: any = null;
  if (subjectStats && subjectStats.length > 0) {
    const sortedByAvg = [...subjectStats].sort((a, b) => a.avgPercentage - b.avgPercentage);
    weakestSubject = sortedByAvg[0];

    const sortedByFails = [...subjectStats].sort((a, b) => b.failedCount - a.failedCount);
    highestFailSubject = sortedByFails[0];
  }

  let text = `### 📊 शैक्षणिक विश्लेषण व AI सुधारात्मक कार्ययोजना (Diagnostic Insights & Plan)\n\n`;
  text += `**विश्लेषित इकाई:** ${className} | **उत्तीर्ण दर:** ${passRate}% | **कक्षा औसत:** ${avg}%\n\n`;

  text += `#### 🔍 1. मुख्य समस्या का बिंदु (Root-Cause Identification):\n`;
  if (weakestSubject && weakestSubject.failedCount > 0) {
    text += `- **कमजोर विषय:** **${weakestSubject.name}** में छात्रों का औसत प्राप्तांक मात्र **${weakestSubject.avgPercentage}%** है तथा इसमें **${weakestSubject.failedCount} विद्यार्थी** उत्तीर्णांक प्राप्त करने में असफल रहे हैं।\n`;
  } else if (highestFailSubject && highestFailSubject.failedCount > 0) {
    text += `- **असफलता का मुख्य केंद्र:** **${highestFailSubject.name}** विषय में सर्वाधिक **${highestFailSubject.failedCount} विद्यार्थी** फेल हुए हैं।\n`;
  } else {
    text += `- समग्र रूप से कक्षा का प्रदर्शन संतोषजनक है, किंतु छात्रों को उच्च अंक (डिस्टिंक्शन 75%+) की श्रेणी में लाने हेतु सैद्धांतिक प्रश्नों के उत्तर लेखन में सुधार की आवश्यकता है।\n`;
  }
  text += `- **सैद्धांतिक (थ्योरी) बनाम प्रोजेक्ट विसंगति:** आंतरिक मूल्यांकन/प्रोजेक्ट में विद्यार्थियों को 75-90% तक अंक प्राप्त हैं, जबकि मुख्य सैद्धांतिक परीक्षा में 33% कटऑफ (जैसे 80 में से 27 अंक) प्राप्त करने में संघर्ष देखा गया है।\n\n`;

  text += `#### 🎯 2. तत्काल सुधारात्मक कदम (Actionable Remedial Strategy):\n`;
  text += `1. **जीरो पीरियड / उपचारात्मक कक्षाएं (Remedial Classes):** कमजोर विषयों (${weakestSubject?.name || 'प्रमुख विषयों'}) के लिए प्रतिदिन अंतिम 40 मिनट की अतिरिक्त संशय निवारण (Doubt Clearing) कक्षा निर्धारित की जाए।\n`;
  text += `2. **साप्ताहिक लघु टेस्ट (Weekly Chapter-wise Assessments):** 80 अंकों की बड़ी परीक्षा के बजाय 20-20 अंकों के साप्ताहिक टॉपिक टेस्ट लें, जिससे छात्रों का भय दूर हो और उत्तीर्णांक (27+) पार करने का आत्मविश्वास बढ़े।\n`;
  text += `3. **न्यूमेरिकल व व्याकरण/कॉन्सेप्ट अभ्यास:** मुख्य सूत्रों, महत्वपूर्ण प्रश्नों के मॉडल उत्तर और पिछले वर्षों के परीक्षा प्रश्नों (PYQs) की बैंक तैयार कर विद्यार्थियों को अभ्यास कराएं।\n`;
  text += `4. **अभिभावक-शिक्षक संवाद (PTM Follow-up):** जिन विद्यार्थियों के 2 या अधिक विषयों में अनुत्तीर्ण होने की संभावना है, उनके अभिभावकों को रिपोर्ट कार्ड के साथ व्यक्तिगत रूप से अवगत कराएं।\n\n`;

  text += `#### 📈 3. शिक्षकों व प्रधानाचार्य हेतु लक्ष्य:\n`;
  text += `- आगामी मुख्य/वार्षिक परीक्षा में **उत्तीर्ण प्रतिशत को ${Math.min(100, Math.round(passRate + 15))}% तक ले जाना** तथा औसत अंक में कम से कम 10% की वृद्धि दर्ज करना।\n`;

  return text;
}

startServer();
