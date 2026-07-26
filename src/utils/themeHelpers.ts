import { ReadingPreferences, ReadingTheme } from '../types';

export function getThemeClasses(theme: ReadingTheme): {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  cardBg: string;
  cardHover: string;
  accent: string;
  buttonBg: string;
  buttonText: string;
  inputBg: string;
  pillBg: string;
  pillText: string;
} {
  switch (theme) {
    case 'creme':
      return {
        bg: 'bg-[#F4EFE6]',
        text: 'text-[#3D352E]',
        textMuted: 'text-[#7A6E63]',
        border: 'border-[#DFD6C9]',
        cardBg: 'bg-[#EDE7DB]',
        cardHover: 'hover:bg-[#E5DDCF]',
        accent: 'text-[#8A6A47]',
        buttonBg: 'bg-[#3D352E]',
        buttonText: 'text-[#F4EFE6]',
        inputBg: 'bg-[#EDE7DB]',
        pillBg: 'bg-[#E5DDCF]',
        pillText: 'text-[#5E4F41]'
      };
    case 'alba':
      return {
        bg: 'bg-[#FFFFFF]',
        text: 'text-[#1E1E1E]',
        textMuted: 'text-[#666666]',
        border: 'border-[#EBEBEB]',
        cardBg: 'bg-[#F8F8F8]',
        cardHover: 'hover:bg-[#F2F2F2]',
        accent: 'text-[#333333]',
        buttonBg: 'bg-[#1E1E1E]',
        buttonText: 'text-[#FFFFFF]',
        inputBg: 'bg-[#F8F8F8]',
        pillBg: 'bg-[#EEEEEE]',
        pillText: 'text-[#333333]'
      };
    case 'noturno':
      return {
        bg: 'bg-[#181A1B]',
        text: 'text-[#E2E0DD]',
        textMuted: 'text-[#8F9397]',
        border: 'border-[#2D3032]',
        cardBg: 'bg-[#202325]',
        cardHover: 'hover:bg-[#262A2D]',
        accent: 'text-[#C5BEB5]',
        buttonBg: 'bg-[#E2E0DD]',
        buttonText: 'text-[#181A1B]',
        inputBg: 'bg-[#202325]',
        pillBg: 'bg-[#2A2D30]',
        pillText: 'text-[#D5D1C8]'
      };
    case 'papiro':
    default:
      return {
        bg: 'bg-[#FBF9F5]',
        text: 'text-[#2C2A29]',
        textMuted: 'text-[#6D6863]',
        border: 'border-[#EAE3D9]',
        cardBg: 'bg-[#F3EFE9]',
        cardHover: 'hover:bg-[#EBE5DC]',
        accent: 'text-[#7D6E60]',
        buttonBg: 'bg-[#2C2A29]',
        buttonText: 'text-[#FBF9F5]',
        inputBg: 'bg-[#F3EFE9]',
        pillBg: 'bg-[#EBE5DC]',
        pillText: 'text-[#59524B]'
      };
  }
}

export function getTypographyClasses(prefs: ReadingPreferences): {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  maxWidth: string;
} {
  const fontMap = {
    serif: 'font-["Lora",serif]',
    sans: 'font-["Plus_Jakarta_Sans",sans-serif]',
    display: 'font-["Playfair_Display",serif]',
  };

  const sizeMap = {
    sm: 'text-base md:text-lg',
    md: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-3xl',
  };

  const lineMap = {
    normal: 'leading-[1.6]',
    relaxed: 'leading-[1.85]',
    loose: 'leading-[2.1]',
  };

  const widthMap = {
    compact: 'max-w-[60ch]',
    standard: 'max-w-[70ch]',
    wide: 'max-w-[85ch]',
  };

  return {
    fontFamily: fontMap[prefs.fontFamily] || fontMap.serif,
    fontSize: sizeMap[prefs.fontSize] || sizeMap.md,
    lineHeight: lineMap[prefs.lineHeight] || lineMap.relaxed,
    maxWidth: widthMap[prefs.maxWidth] || widthMap.standard,
  };
}
