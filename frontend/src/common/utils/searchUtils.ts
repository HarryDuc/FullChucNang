export interface SearchScore {
  score: number;
  matches: {
    field: string;
    matchedWords: string[];
    matchCount: number;
    percentage: number;
  }[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

export function calculateSearchScore(searchTerm: string, item: any): SearchScore {
  const normalizedSearch = normalizeText(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);

  let totalScore = 0;
  const matches = [];

  // Fields to search in, with their weights
  const fieldsToSearch = [
    { name: 'name', weight: 1.0 },
    { name: 'description', weight: 0.3 },
    { name: 'category', weight: 0.5 },
    { name: 'tags', weight: 0.7 }
  ];

  for (const field of fieldsToSearch) {
    let fieldValue = item[field.name];

    // Handle arrays (like tags)
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(' ');
    }

    if (!fieldValue) continue;

    const normalizedField = normalizeText(fieldValue.toString());
    let fieldScore = 0;
    const matchedWords = new Set<string>();

    // Calculate matches for each search word
    for (const searchWord of searchWords) {
      // Check for exact word match
      if (normalizedField.includes(searchWord)) {
        fieldScore += 1.0;
        matchedWords.add(searchWord);
        continue;
      }

      // Check for partial word matches in the field's words
      const fieldWords = normalizedField.split(/\s+/);
      for (const fieldWord of fieldWords) {
        // If search word is part of a field word or vice versa
        if (fieldWord.includes(searchWord) || searchWord.includes(fieldWord)) {
          const matchLength = Math.min(searchWord.length, fieldWord.length);
          const maxLength = Math.max(searchWord.length, fieldWord.length);
          const partialScore = matchLength / maxLength * 0.7; // 70% of full score for partial matches
          fieldScore += partialScore;
          matchedWords.add(searchWord);
          break;
        }
      }

      // Calculate character-level similarity as fallback
      if (!matchedWords.has(searchWord)) {
        const chars = searchWord.split('');
        let charMatchCount = 0;
        for (const char of chars) {
          if (normalizedField.includes(char)) {
            charMatchCount++;
          }
        }

        const charMatchPercentage = chars.length > 0 ? charMatchCount / chars.length : 0;
        if (charMatchPercentage > 0.5) { // Only count if more than 50% chars match
          fieldScore += charMatchPercentage * 0.3; // 30% of full score for character matches
          matchedWords.add(searchWord);
        }
      }
    }

    // Apply field weight
    fieldScore *= field.weight;

    // Calculate match percentage based on how many search words were matched
    const matchPercentage = (matchedWords.size / searchWords.length) * 100;

    if (matchedWords.size > 0) {
      matches.push({
        field: field.name,
        matchedWords: Array.from(matchedWords),
        matchCount: matchedWords.size,
        percentage: matchPercentage
      });
      totalScore += fieldScore;
    }
  }

  // Normalize final score but ensure products with any matches are included
  const maxPossibleScore = fieldsToSearch.reduce((sum, field) => sum + field.weight, 0) * searchWords.length;
  totalScore = Math.min(totalScore / maxPossibleScore, 1);

  // Ensure minimum score for any match
  if (matches.length > 0 && totalScore < 0.1) {
    totalScore = 0.1;
  }

  return {
    score: totalScore,
    matches
  };
}