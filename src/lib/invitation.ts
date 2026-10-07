export const event = {
  title: 'Aruna & Aravind — Engagement',
  start: '2026-10-21T19:00:00+05:30',
  end: '2026-10-21T21:30:00+05:30',
  location: 'Sri Vishnu Park, Double Road, Kengal Hanumanthaiah Rd, Shanti Nagar, Bengaluru, Karnataka 560027',
  mapsUrl: 'https://maps.app.goo.gl/HfaUzbeWzvNvEfdo7',
};

export function getCountdown(now: number) {
  const remaining = Math.max(0, Math.floor((Date.parse(event.start) - now) / 1000));
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    finished: remaining === 0,
  };
}

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: '20261021T133000Z/20261021T160000Z',
    ctz: 'Asia/Kolkata',
    details: `With immense joy, we invite you to celebrate the engagement of Aruna & Aravind.\nGoogle Maps: ${event.mapsUrl}`,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

// Fold at 75 UTF-8 octets, preserving multi-byte characters and CRLF endings.
function foldIcs(line: string) {
  const encoder = new TextEncoder();
  let output = '';
  let bytes = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (bytes + length > 75) {
      output += '\r\n ';
      bytes = 1;
    }
    output += character;
    bytes += length;
  }
  return output;
}

export function calendarIcs(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Aruna and Aravind//Engagement Invitation//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Kolkata', 'BEGIN:STANDARD',
    'DTSTART:19700101T000000', 'TZOFFSETFROM:+0530', 'TZOFFSETTO:+0530', 'TZNAME:IST',
    'END:STANDARD', 'END:VTIMEZONE',
    'BEGIN:VEVENT', 'UID:aruna-aravind-20261021@engagement.invitation',
    `DTSTAMP:${stamp}`, 'DTSTART;TZID=Asia/Kolkata:20261021T190000',
    'DTEND;TZID=Asia/Kolkata:20261021T213000',
    `SUMMARY:${escapeIcs(event.title)}`, `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(`Celebrate the engagement of Aruna & Aravind.\nGoogle Maps: ${event.mapsUrl}`)}`,
    `URL:${event.mapsUrl}`, 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR',
  ].map(foldIcs).join('\r\n') + '\r\n';
}

export function downloadCalendar() {
  const url = URL.createObjectURL(new Blob([calendarIcs()], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Aruna-and-Aravind-Engagement.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}