export function clockParts(raw: string) {
  const normalized = raw.replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).trim();
  const match = normalized.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  const pm = /(?:\bpm\b|م)/i.test(normalized);
  const am = /(?:\bam\b|ص)/i.test(normalized);
  if (am || pm) { if (hour < 1 || hour > 12) return null; hour = hour % 12 + (pm ? 12 : 0); }
  return {minutes:hour * 60 + minute, clock:`${String(hour % 12 || 12).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,period:hour < 12 ? 'AM' : 'PM'};
}

export function groupTimeSlots(slots: string[]) {
  const groups = [
    {title:'Morning', slots:[] as string[]}, {title:'Afternoon', slots:[] as string[]},
    {title:'Evening', slots:[] as string[]}, {title:'Other times', slots:[] as string[]},
  ];
  [...new Set(slots)].sort((a,b) => (clockParts(a)?.minutes ?? Infinity) - (clockParts(b)?.minutes ?? Infinity)).forEach(raw => {
    const minutes = clockParts(raw)?.minutes;
    groups[minutes === undefined ? 3 : minutes < 720 ? 0 : minutes < 1080 ? 1 : 2].slots.push(raw);
  });
  return groups.filter(group => group.slots.length);
}
