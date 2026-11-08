/**
 * Official Madhya Pradesh School Education Department & Central Government Holiday Calendar
 * Valid Range: 20-October-2026 to 01-January-2028 (1.5 Years Window)
 * All dates prior to 20 October 2026 are omitted/deleted.
 */

export interface SchoolHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'festival' | 'gazetted' | 'vacation' | 'state';
  description: string;
}

export const CALENDAR_START_DATE = '2026-10-20';
export const CALENDAR_END_DATE = '2028-01-01';

// Session Months spanning from October 2026 to January 2028 (16 Months, 1.5 Years)
export const ACADEMIC_CALENDAR_MONTHS = [
  { id: '2026-10', name: 'अक्टूबर 2026', shortName: 'अक्टूबर', year: 2026, month: 10, startDay: 20 },
  { id: '2026-11', name: 'नवम्बर 2026', shortName: 'नवम्बर', year: 2026, month: 11, startDay: 1 },
  { id: '2026-12', name: 'दिसम्बर 2026', shortName: 'दिसम्बर', year: 2026, month: 12, startDay: 1 },
  { id: '2027-01', name: 'जनवरी 2027', shortName: 'जनवरी', year: 2027, month: 1, startDay: 1 },
  { id: '2027-02', name: 'फ़रवरी 2027', shortName: 'फ़रवरी', year: 2027, month: 2, startDay: 1 },
  { id: '2027-03', name: 'मार्च 2027', shortName: 'मार्च', year: 2027, month: 3, startDay: 1 },
  { id: '2027-04', name: 'अप्रैल 2027', shortName: 'अप्रैल', year: 2027, month: 4, startDay: 1 },
  { id: '2027-05', name: 'मई 2027', shortName: 'मई', year: 2027, month: 5, startDay: 1 },
  { id: '2027-06', name: 'जून 2027', shortName: 'जून', year: 2027, month: 6, startDay: 1 },
  { id: '2027-07', name: 'जुलाई 2027', shortName: 'जुलाई', year: 2027, month: 7, startDay: 1 },
  { id: '2027-08', name: 'अगस्त 2027', shortName: 'अगस्त', year: 2027, month: 8, startDay: 1 },
  { id: '2027-09', name: 'सितम्बर 2027', shortName: 'सितम्बर', year: 2027, month: 9, startDay: 1 },
  { id: '2027-10', name: 'अक्टूबर 2027', shortName: 'अक्टूबर', year: 2027, month: 10, startDay: 1 },
  { id: '2027-11', name: 'नवम्बर 2027', shortName: 'नवम्बर', year: 2027, month: 11, startDay: 1 },
  { id: '2027-12', name: 'दिसम्बर 2027', shortName: 'दिसम्बर', year: 2027, month: 12, startDay: 1 },
  { id: '2028-01', name: 'जनवरी 2028', shortName: 'जनवरी', year: 2028, month: 1, startDay: 1, endDay: 1 },
];

// Comprehensive Gazetted Holidays list for Madhya Pradesh and Central Govt (20-Oct-2026 to 01-Jan-2028)
export const MP_CENTRAL_HOLIDAYS_MAP: Record<string, SchoolHoliday> = {
  // Year 2026 (From 20 October 2026)
  '2026-10-20': { date: '2026-10-20', name: 'दशहरा / महानवमी अवकाश', type: 'festival', description: 'दुर्गा पूजा महानवमी पर्व अवकाश' },
  '2026-10-21': { date: '2026-10-21', name: 'विजयादशमी (दशहरा)', type: 'gazetted', description: 'विजयादशमी राष्ट्रीय एवं राज्य अवकाश' },
  '2026-10-22': { date: '2026-10-22', name: 'दशहरा उत्सव उपरांत अवकाश', type: 'festival', description: 'दुर्गा प्रतिमा विसर्जन एवं दशहरा उत्सव' },
  '2026-10-23': { date: '2026-10-23', name: 'दशहरा कालीन अतिरिक्त अवकाश', type: 'state', description: 'मध्य प्रदेश शासन घोषित अवकाश' },
  '2026-10-31': { date: '2026-10-31', name: 'महर्षि वाल्मीकि जयंती', type: 'gazetted', description: 'वाल्मीकि जयंती राज्य अवकाश' },
  '2026-11-01': { date: '2026-11-01', name: 'मध्य प्रदेश स्थापना दिवस', type: 'state', description: 'म.प्र. स्थापना दिवस राजकीय अवकाश' },
  '2026-11-08': { date: '2026-11-08', name: 'धनतेरस पर्व', type: 'festival', description: 'दीपावली पंचपर्व प्रारंभ' },
  '2026-11-09': { date: '2026-11-09', name: 'नरक चतुर्दशी / रूप चौदस', type: 'festival', description: 'दीपावली पूर्व संध्या' },
  '2026-11-10': { date: '2026-11-10', name: 'दीपावली (लक्ष्मी पूजन)', type: 'gazetted', description: 'दीपावली राष्ट्रीय महापर्व' },
  '2026-11-11': { date: '2026-11-11', name: 'गोवर्धन पूजा / अन्नकूट', type: 'festival', description: 'गोवर्धन पूजा राजकीय अवकाश' },
  '2026-11-12': { date: '2026-11-12', name: 'भाई दूज (यम द्वितीया)', type: 'festival', description: 'भाई दूज पर्व अवकाश' },
  '2026-11-15': { date: '2026-11-15', name: 'जनजातीय गौरव दिवस', type: 'gazetted', description: 'भगवान बिरसा मुंडा जयंती' },
  '2026-11-24': { date: '2026-11-24', name: 'गुरु नानक जयंती / कार्तिक पूर्णिमा', type: 'gazetted', description: 'श्री गुरु नानक देव जी प्रकाश पर्व' },
  '2026-12-25': { date: '2026-12-25', name: 'क्रिसमस डे (Christmas)', type: 'gazetted', description: 'ईसा मसीह जयंती अवकाश' },
  '2026-12-26': { date: '2026-12-26', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2026-12-27': { date: '2026-12-27', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2026-12-28': { date: '2026-12-28', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2026-12-29': { date: '2026-12-29', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2026-12-30': { date: '2026-12-30', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2026-12-31': { date: '2026-12-31', name: 'शीतकालीन अवकाश (वर्ष समाप्ति)', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },

  // Year 2027
  '2027-01-01': { date: '2027-01-01', name: 'नववर्ष अवकाश (New Year)', type: 'gazetted', description: 'नववर्ष 2027 का स्वागत अवकाश' },
  '2027-01-14': { date: '2027-01-14', name: 'मकर संक्रांति / पोंगल', type: 'festival', description: 'मकर संक्रांति राज्य अवकाश' },
  '2027-01-23': { date: '2027-01-23', name: 'नेताजी सुभाष चंद्र बोस जयंती', type: 'gazetted', description: 'पराक्रम दिवस' },
  '2027-01-26': { date: '2027-01-26', name: 'गणतंत्र दिवस (Republic Day)', type: 'gazetted', description: 'राष्ट्रीय पर्व गणतंत्र दिवस' },
  '2027-02-06': { date: '2027-02-06', name: 'महाशिवरात्रि', type: 'gazetted', description: 'भगवान शिव उपासना महापर्व' },
  '2027-02-11': { date: '2027-02-11', name: 'वसंत पंचमी / माँ सरस्वती पूजन', type: 'festival', description: 'विद्या दायिनी माँ सरस्वती जन्मोत्सव' },
  '2027-02-21': { date: '2027-02-21', name: 'संत रविदास जयंती', type: 'gazetted', description: 'संत शिरोमणि रविदास जयंती' },
  '2027-03-22': { date: '2027-03-22', name: 'होलिका दहन', type: 'festival', description: 'फाल्गुन पूर्णिमा होलिका दहन' },
  '2027-03-23': { date: '2027-03-23', name: 'होली / धुलेंडी', type: 'gazetted', description: 'रंगोत्सव होली राष्ट्रीय अवकाश' },
  '2027-03-27': { date: '2027-03-27', name: 'रंगपंचमी', type: 'state', description: 'मध्य प्रदेश विशिष्ट पर्व अवकाश' },
  '2027-03-28': { date: '2027-03-28', name: 'गुड फ्राइडे (Good Friday)', type: 'gazetted', description: 'गुड फ्राइडे राष्ट्रीय अवकाश' },
  '2027-04-07': { date: '2027-04-07', name: 'चैत्र नवरात्रि / गुड़ी पड़वा', type: 'festival', description: 'भारतीय नववर्ष विक्रम संवत' },
  '2027-04-14': { date: '2027-04-14', name: 'डॉ. बी.आर. आंबेडकर जयंती', type: 'gazetted', description: 'संविधान निर्माता जयंती अवकाश' },
  '2027-04-16': { date: '2027-04-16', name: 'श्री राम नवमी', type: 'gazetted', description: 'भगवान श्री राम जन्मोत्सव' },
  '2027-04-19': { date: '2027-04-19', name: 'महावीर जयंती', type: 'gazetted', description: 'भगवान महावीर जन्म कल्याणक' },
  '2027-05-01': { date: '2027-05-01', name: 'मई दिवस / अंतर्राष्ट्रीय श्रम दिवस', type: 'gazetted', description: 'श्रम दिवस अवकाश' },

  // Summer Vacation: 1 May 2027 to 15 June 2027 (MP School Education Standard)
  ...generateVacationRange('2027-05-02', '2027-06-15', 'ग्रीष्मकालीन अवकाश (Summer Vacation)', 'म.प्र. स्कूल शिक्षा विभाग ग्रीष्मकालीन अवकाश'),

  '2027-06-16': { date: '2027-06-16', name: 'शाला प्रवेशोत्सव / सत्र आरंभ', type: 'state', description: 'विद्यालय का नया शैक्षणिक सत्र' },
  '2027-06-18': { date: '2027-06-18', name: 'मुहर्रम (Muharram)', type: 'gazetted', description: 'मुहर्रम राष्ट्रीय अवकाश' },
  '2027-08-15': { date: '2027-08-15', name: 'स्वतंत्रता दिवस (Independence Day)', type: 'gazetted', description: '79वाँ स्वतंत्रता दिवस राष्ट्रीय पर्व' },
  '2027-08-17': { date: '2027-08-17', name: 'रक्षाबंधन', type: 'festival', description: 'रक्षाबंधन पर्व अवकाश' },
  '2027-08-25': { date: '2027-08-25', name: 'श्री कृष्ण जन्माष्टमी', type: 'gazetted', description: 'भगवान श्री कृष्ण जन्मोत्सव' },
  '2027-09-04': { date: '2027-09-04', name: 'मिलाद-उन-नबी (ईद-ए-मिलाद)', type: 'gazetted', description: 'पैगंबर मोहम्मद साहब जन्मदिवस' },
  '2027-09-14': { date: '2027-09-14', name: 'अनंत चतुर्दशी (गणेश विसर्जन)', type: 'festival', description: 'गणेशोत्सव समापन अवकाश' },
  '2027-10-02': { date: '2027-10-02', name: 'महात्मा गांधी जयंती', type: 'gazetted', description: 'राष्ट्रपिता महात्मा गांधी जयंती' },
  '2027-10-08': { date: '2027-10-08', name: 'दशहरा / महाअष्टमी', type: 'festival', description: 'दुर्गा पूजा अवकाश' },
  '2027-10-09': { date: '2027-10-09', name: 'महानवमी अवकाश', type: 'festival', description: 'नवमी पूजन' },
  '2027-10-10': { date: '2027-10-10', name: 'विजयादशमी (दशहरा)', type: 'gazetted', description: 'विजयादशमी राष्ट्रीय अवकाश' },
  '2027-10-28': { date: '2027-10-28', name: 'धनतेरस पर्व अवकाश', type: 'festival', description: 'दीपावली उत्सव प्रारंभ' },
  '2027-10-29': { date: '2027-10-29', name: 'नरक चतुर्दशी', type: 'festival', description: 'रूप चौदस' },
  '2027-10-30': { date: '2027-10-30', name: 'दीपावली (Diwali)', type: 'gazetted', description: 'दीपावली राष्ट्रीय महापर्व' },
  '2027-10-31': { date: '2027-10-31', name: 'गोवर्धन पूजा', type: 'festival', description: 'अन्नकूट महोत्सव' },
  '2027-11-01': { date: '2027-11-01', name: 'भाई दूज एवं म.प्र. स्थापना दिवस', type: 'state', description: 'भाई दूज एवं मध्य प्रदेश स्थापना दिवस' },
  '2027-11-14': { date: '2027-11-14', name: 'गुरु नानक जयंती / बाल दिवस', type: 'gazetted', description: 'श्री गुरु नानक देव जी प्रकाश पर्व' },
  '2027-12-25': { date: '2027-12-25', name: 'क्रिसमस डे (Christmas)', type: 'gazetted', description: 'क्रिसमस पर्व अवकाश' },
  '2027-12-26': { date: '2027-12-26', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2027-12-27': { date: '2027-12-27', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2027-12-28': { date: '2027-12-28', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2027-12-29': { date: '2027-12-29', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2027-12-30': { date: '2027-12-30', name: 'शीतकालीन अवकाश', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },
  '2027-12-31': { date: '2027-12-31', name: 'शीतकालीन अवकाश (वर्ष समाप्ति)', type: 'vacation', description: 'विद्यालय शीतकालीन अवकाश' },

  // Year 2028 (till 1 Jan 2028)
  '2028-01-01': { date: '2028-01-01', name: 'नववर्ष अवकाश (New Year 2028)', type: 'gazetted', description: 'नववर्ष 2028 का स्वागत अवकाश' },
};

function generateVacationRange(startDate: string, endDate: string, name: string, description: string): Record<string, SchoolHoliday> {
  const result: Record<string, SchoolHoliday> = {};
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    result[key] = {
      date: key,
      name,
      type: 'vacation',
      description,
    };
    curr.setDate(curr.getDate() + 1);
  }

  return result;
}

/**
 * Checks if a date falls strictly within the requested window [2026-10-20 to 2028-01-01]
 * Any date before 20 October 2026 is deleted/excluded.
 */
export function isDateInAcademicRange(dateStr: string): boolean {
  if (!dateStr) return false;
  const clean = dateStr.slice(0, 10);
  return clean >= CALENDAR_START_DATE && clean <= CALENDAR_END_DATE;
}

/**
 * Returns holiday details for a given date in 'YYYY-MM-DD'
 */
export function getSchoolHolidayInfo(dateStr: string): SchoolHoliday | null {
  if (!dateStr || !isDateInAcademicRange(dateStr)) return null;
  const clean = dateStr.slice(0, 10);
  return MP_CENTRAL_HOLIDAYS_MAP[clean] || null;
}
