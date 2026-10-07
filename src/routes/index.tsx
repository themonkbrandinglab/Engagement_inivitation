import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, CalendarDays, Download, MapPin, Menu, Share2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { downloadCalendar, event, getCountdown, googleCalendarUrl } from '@/lib/invitation';
import dawnImage from '@/assets/lotus-dawn.webp';
import lotusScene from '@/assets/lotus-scene.webp';
import portraitDawn from '@/assets/lotus-portrait.webp';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Aruna & Aravind — An Engagement Invitation' },
    { name: 'description', content: 'With immense joy, join Aruna & Aravind for their engagement on 21 October 2026, 7 PM at Sri Vishnu Park, Bengaluru.' },
    { property: 'og:title', content: 'Aruna & Aravind — 21 October 2026' },
    { property: 'og:description', content: 'A celebration of love and togetherness. You are warmly invited to our engagement at Sri Vishnu Park, Bengaluru, 7–9:30 PM IST.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Invitation,
});

function Countdown() {
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown> | null>(null);
  useEffect(() => {
    const update = () => setCountdown(getCountdown(Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (countdown?.finished) return <p className="countdown-heading">Today is the day.</p>;
  return <div className="countdown" aria-label="Countdown to the engagement">
    {(['days', 'hours', 'minutes', 'seconds'] as const).map(unit => <div className="countdown-item" key={unit}>
      <span className="countdown-number">{countdown ? String(countdown[unit]).padStart(2, '0') : '—'}</span>
      <span className="countdown-label">{unit}</span>
    </div>)}
  </div>;
}

function Invitation() {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [copyOpen, setCopyOpen] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const entryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (entryTimer.current) clearTimeout(entryTimer.current); }, []);
  useEffect(() => {
    if (!entered) return;
    const observer = new IntersectionObserver(entries => entries.forEach(item => {
      if (item.isIntersecting) { item.target.classList.add('is-visible'); observer.unobserve(item.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [entered]);

  function enter(target = 'home') {
    setMenuOpen(false);
    if (entered) {
      if (target === 'calendar') { setCalendarOpen(true); return; }
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (leaving) return;
    setLeaving(true);
    entryTimer.current = setTimeout(() => {
      setEntered(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        if (target === 'calendar') setCalendarOpen(true);
        else if (target !== 'home') document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      });
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750);
  }

  async function share() {
    const shareUrl = new URL(window.location.href);
    shareUrl.hash = '';
    const url = shareUrl.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: 'With immense joy, join us for our engagement on 21 October 2026, 7 PM, at Sri Vishnu Park, Bengaluru.', url });
        setShareStatus('Shared with love.');
        return;
      } catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Invitation link copied.');
    } catch {
      setInvitationUrl(url);
      setCopyOpen(true);
    }
  }

  const header = <header className={`site-header ${entered ? 'hero-header' : ''}`}>
    <div className="monogram" aria-label="Aruna and Aravind">A<span>&</span>A</div>
    <div className="header-caption">An invitation to togetherness</div>
    <Button variant="invitationQuiet" className="menu-control" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><span>MENU</span><Menu size={19} /></Button>
  </header>;

  return <div className="invitation">
    {!entered ? <section className={`opening ${leaving ? 'opening-leaving' : ''}`} aria-label="Engagement invitation opening">
      <picture className="opening-picture"><source media="(max-aspect-ratio: 1/1)" srcSet={portraitDawn} /><img className="opening-image" src={dawnImage} alt="Blush lotus flowers on a tranquil pond in the first light of dawn" width={1536} height={1024} fetchPriority="high" /></picture>
      {header}
      <div className="opening-content">
        <span className="spark entry-reveal delay-1" aria-hidden="true">✦</span>
        <p className="opening-intro entry-reveal delay-2">With immense joy,</p>
        <p className="opening-prelude entry-reveal delay-3">we invite you to grace the Engagement Ceremony of</p>
        <h1 className="opening-names entry-reveal delay-4"><span>Aruna</span><span className="ampersand">&</span><span>Aravind</span></h1>
        <p className="opening-message entry-reveal delay-5">as they begin their journey towards a lifetime of love and togetherness.</p>
        <p className="opening-date entry-reveal delay-5">21 • 10 • 2026</p>
        <Button variant="invitation" className="enter-button entry-reveal delay-6" onClick={() => enter()}><span>ENTER</span><ArrowDown size={14} /></Button>
      </div>
      <div className="opening-foot"><span>Bengaluru, India</span><span>Two hearts. A beautiful beginning.</span></div>
    </section> : <main className="main-invitation">
      <section className="main-hero" id="home">
        <img src={lotusScene} alt="Blush lotus blossoms on a serene pond in warm golden dawn light" className="main-hero-image" width={1024} height={1536} fetchPriority="high" />
        {header}
        <div className="hero-title"><h1>Aruna <span>×</span> Aravind</h1><p className="eyebrow">Are getting engaged</p></div>
      </section>

      <section className="section date-section" id="details">
        <div className="reveal">
          <span className="spark" aria-hidden="true">✦</span>
          <p className="eyebrow">Save the date</p>
          <h2 className="date-heading">21<sup>st</sup> October 2026</h2>
          <p className="event-time">Wednesday · 7:00 PM – 9:30 PM IST</p>
          <Button variant="invitation" onClick={() => setCalendarOpen(true)}><CalendarDays />Add to calendar<ArrowUpRight /></Button>
          <div className="thin-rule" />
          <p className="countdown-heading">Until our beautiful beginning</p>
          <Countdown />
        </div>
      </section>

      <section className="section venue-section" id="venue">
        <div className="reveal">
          <MapPin className="venue-pin" strokeWidth={1.3} aria-hidden="true" />
          <p className="eyebrow">The celebration awaits</p>
          <h2 className="venue-heading">Sri Vishnu Park</h2>
          <p className="venue-address">Double Road<br />Kengal Hanumanthaiah Rd, Shanti Nagar<br />Bengaluru, Karnataka 560027</p>
          <Button variant="invitationOutline" asChild><a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin />View location<ArrowUpRight /></a></Button>
          <p className="venue-note">A special place. An unforgettable evening.</p>
        </div>
      </section>

      <section className="section love-section" id="invitation">
        <div className="reveal">
          <p className="eyebrow">Together is a beautiful place to be</p>
          <h2 className="love-heading">We would love<br />to have you<br /><em>with us.</em></h2>
          <p className="love-message">Your presence will make<br />our celebration even more special.</p>
          <Button variant="invitationOutline" onClick={share}>{shareStatus ? <Check /> : <Share2 />}Share invitation</Button>
          <p className="share-status" role="status">{shareStatus}</p>
        </div>
      </section>

      <footer className="footer"><p className="footer-names">Aruna & Aravind</p><p className="footer-date">21 • 10 • 2026</p><span className="spark" aria-hidden="true">✦</span><p className="eyebrow">With love</p></footer>
    </main>}

    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
      <DialogContent className="calendar-modal">
        <span className="spark" aria-hidden="true">✦</span><DialogTitle>Aruna & Aravind</DialogTitle>
        <DialogDescription className="calendar-modal-description">21 October 2026 · Bengaluru</DialogDescription>
        <nav className="menu-links" aria-label="Invitation navigation">{[['Home', 'home'], ['Details', 'details'], ['Venue', 'venue'], ['Calendar', 'calendar']].map(([label, target]) => <Button variant="invitationQuiet" key={target} onClick={() => enter(target)}>{label}</Button>)}</nav>
      </DialogContent>
    </Dialog>

    <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
      <DialogContent className="calendar-modal">
        <span className="spark" aria-hidden="true">✦</span><DialogTitle>Save our special day</DialogTitle>
        <DialogDescription className="calendar-modal-description">Aruna & Aravind — Engagement<br />21 October 2026 · 7:00 PM – 9:30 PM<br />Sri Vishnu Park, Bengaluru</DialogDescription>
        <div className="calendar-options">
          <Button variant="invitation" asChild><a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer"><CalendarDays />Google Calendar<ArrowUpRight /></a></Button>
          <Button variant="invitationOutline" onClick={downloadCalendar}><CalendarDays />Apple Calendar<ArrowRight /></Button>
          <Button variant="invitationOutline" onClick={downloadCalendar}><Download />Download Calendar (.ICS)<ArrowDown /></Button>
        </div>
        <p className="calendar-timezone">All times in Asia/Kolkata (IST, UTC +5:30)</p>
      </DialogContent>
    </Dialog>

    <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
      <DialogContent className="calendar-modal"><DialogTitle>Share the love</DialogTitle><DialogDescription>Select and copy this invitation link.</DialogDescription><input className="copy-url" aria-label="Invitation link" value={invitationUrl} readOnly onFocus={e => e.target.select()} /></DialogContent>
    </Dialog>
  </div>;
}
