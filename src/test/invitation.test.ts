import { describe, expect, it } from 'vitest';
import { calendarIcs, event, getCountdown, googleCalendarUrl } from '@/lib/invitation';

describe('Engagement date and calendar rules', () => {
  it('counts down to 21 October 2026 at 7 PM IST', () => {
    expect(getCountdown(Date.parse('2026-10-20T13:29:59Z'))).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 1, finished: false });
  });
  it('finishes at the event start and never returns negative values', () => {
    expect(getCountdown(Date.parse('2026-10-21T13:30:00Z')).finished).toBe(true);
    expect(getCountdown(Date.parse('2026-10-22T13:30:00Z'))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
  });
  it('sets the Google Calendar event to 7–9:30 PM IST with the correct venue', () => {
    const params = new URL(googleCalendarUrl()).searchParams;
    expect(params.get('dates')).toBe('20261021T133000Z/20261021T160000Z');
    expect(params.get('ctz')).toBe('Asia/Kolkata');
    expect(params.get('text')).toBe('Aruna & Aravind — Engagement');
    expect(params.get('location')).toBe('Sri Vishnu Park, Double Road, Kengal Hanumanthaiah Rd, Shanti Nagar, Bengaluru, Karnataka 560027');
    expect(params.get('details')).toContain('https://maps.app.goo.gl/HfaUzbeWzvNvEfdo7');
  });
  it('exports valid folded ICS with explicit Kolkata event times', () => {
    const ics = calendarIcs(new Date('2026-10-07T03:05:00Z'));
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('DTSTART;TZID=Asia/Kolkata:20261021T190000\r\n');
    expect(unfolded).toContain('DTEND;TZID=Asia/Kolkata:20261021T213000\r\n');
    expect(unfolded).toContain('DTSTAMP:20261007T030500Z');
    expect(unfolded).toContain('SUMMARY:Aruna & Aravind — Engagement');
    expect(unfolded).toContain('URL:' + event.mapsUrl);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.split('\r\n').every(line => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
});