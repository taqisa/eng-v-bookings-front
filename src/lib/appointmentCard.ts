import { clockParts } from './timeSlots';

export interface AppointmentDetails {
  id: string;
  provider: string;
  specialty?: string;
  service?: string;
  date: string;
  time: string;
  duration?: number | null;
  location?: string | null;
  guest?: string | null;
}

export function appointmentDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function appointmentTime(value: string) {
  const time = clockParts(value);
  return time ? `${time.clock} ${time.period}` : value;
}

// Render only the useful appointment fields, not a screenshot of the page.
// No remote images or patient notes are drawn, so the canvas stays private and exportable.
export async function createAppointmentImage(details: AppointmentDetails): Promise<Blob> {
  
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');
  const drawing: (() => void)[] = [];
  const text = (value: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') => {
    drawing.push(() => {
    ctx.font = `600 ${size}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.direction = 'ltr';
    ctx.fillText(value, x, y, 888);
    });
  };
  const wrap = (value: string, y: number, size = 36) => {
    ctx.font = `600 ${size}px Arial, sans-serif`;
    let line = '';
    for (const word of value.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > 850 && line) {
        text(line, 124, y, size, '#20242b'); y += 55; line = word;
      } else line = next;
    }
    if (line) text(line, 124, y, size, '#20242b');
    return y + 55;
  };
  text('Bookings', 82, 135, 44, '#e9e3d8', 'left');
  text('Appointment card', 998, 132, 32, '#c9b792', 'right');
  text('Your booking is confirmed', 124, 306, 47, '#20242b');
  text('Save this card for your appointment', 124, 366, 25, '#65645f');
  let y = wrap(details.provider, 485, 47);
  if (details.service || details.specialty) y = wrap(details.service || details.specialty || '', y, 29);
  y += 40;
  text('Date', 124, y, 25, '#797365'); y += 53;
  y = wrap(appointmentDate(details.date), y, 33);
  y += 24;
  text('Time', 124, y, 25, '#797365'); y += 73;
  text(appointmentTime(details.time), 124, y, 58, '#20242b'); y += 52;
  if (details.duration) { text(`${details.duration} minutes`, 124, y, 27, '#65645f'); y += 53; }
  if (details.location) { text('Location', 124, y, 25, '#797365'); y = wrap(details.location, y + 49, 29); }
  if (details.guest) y = wrap(details.guest, y + 24, 27);
  const paperBottom = Math.max(1290, y + 130);
  text(`Booking reference: ${details.id.slice(0, 8).toUpperCase()}`, 124, paperBottom - 48, 23, '#797365');
  text('Contact your provider if you need to change your appointment', 124, paperBottom + 78, 23, '#b8b6af');
  canvas.height = paperBottom + 150;
  ctx.fillStyle = '#111319'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f3f0e8'; ctx.beginPath(); ctx.roundRect(64, 210, 952, paperBottom - 210, 24); ctx.fill();
  ctx.strokeStyle = '#cec6b7'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(124, 408); ctx.lineTo(956, 408); ctx.stroke();
  drawing.forEach(draw => draw());
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed')), 'image/png'));
}

export function downloadAppointmentImage(blob: Blob, id: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `bookings-appointment-${id.slice(0, 8)}.png`;
  document.body.append(anchor); anchor.click(); anchor.remove();
  // Give mobile browsers enough time to consume the blob URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
