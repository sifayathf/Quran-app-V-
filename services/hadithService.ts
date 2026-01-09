
import { Hadith, HadithGrading } from '../types';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export const fetchHadithList = async (collection: string): Promise<Hadith[]> => {
  try {
    // Fetch both Arabic and English editions to provide a complete view
    const [araRes, engRes] = await Promise.all([
      fetch(`${BASE_URL}/editions/ara-${collection}.json`),
      fetch(`${BASE_URL}/editions/eng-${collection}.json`)
    ]);

    const araData = await araRes.json();
    const engData = await engRes.json();
    
    // The API structure for these editions is { hadiths: [...] }
    const araList = araData.hadiths || [];
    const engList = engData.hadiths || [];

    // Map them together based on index (they are usually synchronized in this API)
    return engList.slice(0, 40).map((h: any, index: number) => {
      const arabicEntry = araList[index] || {};
      return {
        id: `${collection}-${index}`,
        collection: collection.charAt(0).toUpperCase() + collection.slice(1),
        bookNumber: h.bookNumber || "1",
        hadithNumber: h.hadithNumber || (index + 1).toString(),
        arabicText: arabicEntry.text || "النص العربي غير متوفر",
        englishText: h.text || "No translation available",
        grading: (h.grades?.[0]?.grade as HadithGrading) || 'Sahih',
        gradedBy: h.grades?.[0]?.name || 'Scholarship',
        chapterTitle: h.reference?.book || 'Chapter',
        // Fallback isnad as the Arabic text often starts with the chain
        isnad: arabicEntry.text ? arabicEntry.text.split(' ').slice(0, 15).join(' ') + '...' : undefined
      };
    });
  } catch (error) {
    console.error("Hadith Fetch Error:", error);
    return [];
  }
};
