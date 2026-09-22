export interface AcademicAiRecommendationPayload {
  classData: {
    className: string;
    examName: string;
    total: number;
    appeared: number;
    passed: number;
    failed: number;
    passRate: number;
    avgPercentage: number;
  };
  subjectStats: Array<{
    name: string;
    avgMarks: number;
    maxMarks: number;
    avgPercentage: number;
    minMarks: number;
    passedCount: number;
    failedCount: number;
    passRate: number;
  }>;
  overallStats?: {
    totalStudents: number;
    totalPassed: number;
    totalFailed: number;
    passRate: string | number;
    overallAvg: string | number;
  };
  prompt?: string;
}

export interface AiRecommendationResponse {
  success: boolean;
  source: 'gemini-3.8-flash' | 'diagnostic-engine';
  text: string;
  error?: string;
}

export async function fetchAiAcademicRecommendations(
  payload: AcademicAiRecommendationPayload
): Promise<AiRecommendationResponse> {
  try {
    const res = await fetch('/api/ai-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return {
          success: true,
          source: data.source || 'gemini-3.8-flash',
          text: data.text,
        };
      }
    }
  } catch (err: any) {
    console.warn('Network call to AI advisor API failed, generating client-side diagnosis:', err.message);
  }

  // Client-side instant diagnostic engine fallback
  return {
    success: true,
    source: 'diagnostic-engine',
    text: generateClientDiagnosticAnalysis(payload),
  };
}

export function generateClientDiagnosticAnalysis(payload: AcademicAiRecommendationPayload): string {
  const { classData, subjectStats } = payload;
  const className = classData?.className || 'सम्पूर्ण विद्यालय';
  const passRate = classData?.passRate ?? 0;
  const avg = classData?.avgPercentage ?? 0;

  // Identify weakest and highest fail subjects
  let weakestSubject: any = null;
  let highestFailSubject: any = null;
  let strongestSubject: any = null;

  if (subjectStats && subjectStats.length > 0) {
    const sortedByAvg = [...subjectStats].sort((a, b) => a.avgPercentage - b.avgPercentage);
    weakestSubject = sortedByAvg[0];
    strongestSubject = sortedByAvg[sortedByAvg.length - 1];

    const sortedByFails = [...subjectStats].sort((a, b) => b.failedCount - a.failedCount);
    highestFailSubject = sortedByFails[0];
  }

  let text = `### 📊 शैक्षणिक विश्लेषण व AI सुधारात्मक कार्ययोजना (Diagnostic Insights & Plan)\n\n`;
  text += `**विश्लेषित इकाई:** ${className} | **उत्तीर्ण दर:** ${passRate}% | **कक्षा औसत:** ${avg}%\n\n`;

  text += `#### 🔍 1. मुख्य समस्या का बिंदु (Root-Cause Identification):\n`;
  if (highestFailSubject && highestFailSubject.failedCount > 0) {
    text += `- **सर्वाधिक विफलता वाला विषय:** **${highestFailSubject.name}** में कुल **${highestFailSubject.failedCount} विद्यार्थी** उत्तीर्णांक प्राप्त करने में असफल रहे हैं (उत्तीर्ण दर मात्र ${highestFailSubject.passRate}%)।\n`;
  }
  if (weakestSubject && weakestSubject.name !== highestFailSubject?.name) {
    text += `- **न्यूनतम औसत प्राप्तांक:** **${weakestSubject.name}** में विद्यार्थियों का औसत प्राप्तांक मात्र **${weakestSubject.avgPercentage}%** रहा है।\n`;
  }
  text += `- **सैद्धांतिक (थ्योरी) बनाम प्रोजेक्ट का अंतर:** प्रोजेक्ट/आंतरिक मूल्यांकन में विद्यार्थी अच्छे अंक प्राप्त कर रहे हैं, किंतु मुख्य सैद्धांतिक परीक्षा में 1/3 (जैसे 80 में 27 अंक) की न्यूनतम अनिवार्यता कई छात्रों के फेल होने का मुख्य कारण बनी है।\n\n`;

  text += `#### 🎯 2. व्यावहारिक सुधारात्मक कदम (Actionable Remedial Strategy):\n`;
  text += `1. **जीरो पीरियड / उपचारात्मक शिक्षण (Remedial Classes):** कमजोर विषयों (${highestFailSubject?.name || 'मुख्य विषयों'}) हेतु नियमित समय सारिणी में प्रतिदिन 40 मिनट की विशेष उपचारात्मक कक्षा लगाई जाए।\n`;
  text += `2. **चैप्टर-वाइज 20-अंकीय मॉक टेस्ट:** लंबी परीक्षा के तनाव को कम करने के लिए प्रति सप्ताह एक चैप्टर का 20 अंकों का टेस्ट लें, जिससे 27+ अंक पार करने की तकनीक छात्रों को समझ आए।\n`;
  text += `3. **न्यूमेरिकल, सूत्र व फॉर्मेट अभ्यास:** कॉमर्स/गणित/विज्ञान के विद्यार्थियों को फॉर्मूला शीट और स्टेप-वाइज अंक विभाजन का गहन अभ्यास कराएं।\n`;
  text += `4. **अभिभावक समन्वय (Targeted PTM):** जिन विद्यार्थियों के 2 या अधिक विषयों में थ्योरी अंक कम हैं, उनके माता-पिता को व्यक्तिगत रूप से बुलाकर प्रगति चार्ट साझा करें।\n\n`;

  if (strongestSubject) {
    text += `#### ⭐ 3. सकारात्मक पक्ष (Strength):\n`;
    text += `- **${strongestSubject.name}** में छात्रों ने श्रेष्ठ प्रदर्शन (${strongestSubject.avgPercentage}% औसत) किया है, इस विषय की अध्ययन पद्धति को अन्य कमजोर विषयों में भी लागू किया जा सकता है।\n`;
  }

  return text;
}
