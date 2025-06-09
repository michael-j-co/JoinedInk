export interface SeasonalInfo {
  name: string;
  icon: string;
  suggestedThemes: string[];
  description: string;
}

export const getCurrentSeason = (): string => {
  const month = new Date().getMonth(); // 0-11 (0=January, 1=February, etc.)
  const day = new Date().getDate();
  
  // Clear seasonal boundaries with no overlaps
  // Spring: March 20 - June 20
  if (month < 2 || (month === 2 && day < 20)) {
    return 'winter';
  } else if (month < 5 || (month === 5 && day < 21)) {
    return 'spring';
  } else if (month < 8 || (month === 8 && day < 22)) {
    return 'summer';
  } else if (month < 11 || (month === 11 && day < 21)) {
    return 'autumn';
  } else {
    return 'winter';
  }
};

export const getSeasonalInfo = (season: string): SeasonalInfo => {
  const seasonalData: Record<string, SeasonalInfo> = {
    spring: {
      name: 'Spring',
      icon: '🌸',
      suggestedThemes: ['spring-bloom', 'cherry-blossom', 'spring-fresh'],
      description: 'Fresh, blooming themes perfect for new beginnings and renewal'
    },
    summer: {
      name: 'Summer',
      icon: '☀️',
      suggestedThemes: ['summer-breeze', 'golden-hour', 'ocean-mist'],
      description: 'Bright, warm themes that capture the joy and energy of summer'
    },
    autumn: {
      name: 'Autumn',
      icon: '🍂',
      suggestedThemes: ['autumn-leaves', 'harvest-gold', 'cozy-amber'],
      description: 'Rich, warm themes reflecting the cozy beauty of fall'
    },
    winter: {
      name: 'Winter',
      icon: '❄️',
      suggestedThemes: ['winter-frost', 'snowy-evening', 'candlelight'],
      description: 'Cool, serene themes perfect for winter moments and celebrations'
    }
  };

  return seasonalData[season] || seasonalData.spring;
};

export const getHolidayThemes = (): { [key: string]: string[] } => {
  return {
    valentine: ['valentine-blush', 'soft'],
    christmas: ['festive-pine', 'winter-frost'],
    thanksgiving: ['thanksgiving-warmth', 'harvest-gold'],
    easter: ['spring-bloom', 'cherry-blossom'],
    halloween: ['cozy-amber', 'autumn-leaves']
  };
};

export const getSeasonalRecommendation = (currentSeason?: string): string => {
  const season = currentSeason || getCurrentSeason();
  const seasonalInfo = getSeasonalInfo(season);
  
  // Return the first suggested theme for the current season
  return seasonalInfo.suggestedThemes[0] || 'clean';
};

export const isSeasonalTheme = (themeId: string): boolean => {
  const seasonalKeywords = ['spring', 'summer', 'autumn', 'winter', 'cherry', 'harvest', 'golden-hour', 'ocean', 'frost', 'snowy', 'candlelight'];
  return seasonalKeywords.some(keyword => themeId.includes(keyword));
};

export const getThemeSeasonality = (themeId: string): string | null => {
  // Input validation: return null if themeId is falsy or not a string
  if (!themeId || typeof themeId !== 'string') {
    return null;
  }
  
  if (themeId.includes('spring') || themeId.includes('cherry')) return 'spring';
  if (themeId.includes('summer') || themeId.includes('golden-hour') || themeId.includes('ocean')) return 'summer';
  if (themeId.includes('autumn') || themeId.includes('harvest') || themeId.includes('cozy')) return 'autumn';
  if (themeId.includes('winter') || themeId.includes('frost') || themeId.includes('snowy') || themeId.includes('candlelight')) return 'winter';
  return null;
}; 