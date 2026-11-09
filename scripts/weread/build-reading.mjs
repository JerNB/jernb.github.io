// Pure transform: raw WeRead payloads + Jerry's curation → ReadingData (data/reading.json).
// Privacy rules (spec §5.2): secret books never leave this function; thoughts are
// private unless their reviewId is listed in the curation; highlights are public
// unless a book sets highlights:false.

const round1 = x => Math.round(x * 10) / 10;
const round3 = x => Math.round(x * 1000) / 1000;

export function buildReading(raw, curation, { now = new Date().toISOString().slice(0, 10) } = {}) {
  const warnings = [];
  const shelfBooks = raw.shelf?.books ?? [];
  const byTitle = new Map(shelfBooks.map(b => [b.title, b]));
  const secretIds = new Set(shelfBooks.filter(b => b.secret).map(b => b.bookId));
  const seconds = new Map((raw.overall?.readLongest ?? []).filter(x => x.book?.bookId).map(x => [x.book.bookId, x.readTime]));
  const regionOrder = new Map(curation.regions.map(r => [r.id, r.order]));

  const matchedIds = new Set();
  const places = [];
  for (const entry of curation.books) {
    let books;
    if (entry.search !== undefined) {
      const hit = raw.search?.[entry.key];
      if (!hit) { warnings.push(`${entry.key}: search "${entry.search}" found nothing — skipped`); continue; }
      books = [{ ...hit, finishReading: 0, secret: 0, fromSearch: true }];
    } else {
      books = (entry.match ?? []).map(t => byTitle.get(t)).filter(Boolean);
      const missing = (entry.match ?? []).filter(t => !byTitle.has(t));
      if (missing.length) warnings.push(`${entry.key}: not on shelf: ${missing.join(', ')}`);
      if (!books.length) { if (!missing.length) warnings.push(`${entry.key}: no match — skipped`); continue; }
    }
    books.forEach(b => matchedIds.add(b.bookId));
    if (books.some(b => b.secret)) continue;                       // private, never shown
    const read = entry.read ?? books.some(b => b.finishReading === 1);
    if (!read) continue;
    if (!regionOrder.has(entry.region)) { warnings.push(`${entry.key}: unknown region ${entry.region} — skipped`); continue; }

    const ids = books.map(b => b.bookId);
    const secs = ids.map(id => seconds.get(id)).filter(v => v !== undefined);
    const words = ids.map(id => raw.info?.[id]?.wordCount).filter(v => typeof v === 'number');
    places.push({
      key: entry.key, label: entry.label, region: entry.region, place: entry.place,
      author: books[0].author ?? null, cover: books[0].cover ?? null,
      readerLink: books[0].readerLink ?? null,
      hours: secs.length ? round1(secs.reduce((a, b) => a + b, 0) / 3600) : null,
      wordCount: words.length ? words.reduce((a, b) => a + b, 0) : null,
      tiba: pickTiba(entry, ids, raw),
      objectId: (curation.objects ?? []).find(o => o.books.includes(entry.key))?.id ?? null,
    });
  }
  places.sort((a, b) => regionOrder.get(a.region) - regionOrder.get(b.region) || a.key.localeCompare(b.key));

  const study = places.map(p => ({ key: p.key, label: p.label, author: p.author, wordCount: p.wordCount }));
  for (const b of shelfBooks) {
    if (b.finishReading === 1 && !b.secret && !matchedIds.has(b.bookId)) {
      warnings.push(`finished but not curated (study only): ${b.title}`);
      study.push({ key: `shelf-${b.bookId}`, label: b.title, author: b.author ?? null, wordCount: raw.info?.[b.bookId]?.wordCount ?? null });
    }
  }

  const placed = new Set(places.map(p => p.key));
  const regionHours = new Map();
  for (const p of places) if (p.hours !== null) regionHours.set(p.region, (regionHours.get(p.region) ?? 0) + p.hours);
  const maxHours = Math.max(0, ...regionHours.values());
  const regions = [...curation.regions].sort((a, b) => a.order - b.order).map(r => ({
    ...r, density: regionHours.has(r.id) && maxHours > 0 ? round3(regionHours.get(r.id) / maxHours) : 0.5,
  }));

  const privateSecs = [...secretIds].reduce((a, id) => a + (seconds.get(id) ?? 0), 0);
  const nb = raw.notebooks?.books ?? [];
  const count = b => (b.reviewCount ?? 0) + (b.noteCount ?? 0) + (b.bookmarkCount ?? 0);
  const totalNotes = raw.notebooks?.totalNoteCount ?? nb.reduce((a, b) => a + count(b), 0);
  const privateNotes = nb.filter(b => secretIds.has(b.bookId)).reduce((a, b) => a + count(b), 0);

  return {
    generatedAt: now,
    regions,
    places,
    study,
    objects: (curation.objects ?? []).map(o => ({ id: o.id, label: o.label, region: 'xingnang', books: o.books.filter(k => placed.has(k)) })),
    links: (curation.links ?? []).filter(l => placed.has(l.from) && placed.has(l.to)),
    stats: {
      hours: Math.floor(((raw.overall?.totalReadTime ?? 0) - privateSecs) / 3600),
      readDays: raw.overall?.readDays ?? 0,
      booksRead: study.length,
      notes: totalNotes - privateNotes,
    },
    warnings,
  };
}

function pickTiba(entry, ids, raw) {
  const reviews = ids.flatMap(id => raw.reviews?.[id]?.reviews ?? []).map(r => r.review ?? r);
  for (const rid of entry.tibaReviewIds ?? []) {
    const r = reviews.find(x => x.reviewId === rid);
    if (r) return { quote: r.abstract || null, mine: r.content || null };
  }
  if (entry.tiba) return { quote: null, mine: entry.tiba };
  if (entry.highlights === false) return null;
  const marks = ids.flatMap(id => raw.bookmarks?.[id]?.updated ?? []);
  const m = (entry.tibaHighlightId && marks.find(x => x.bookmarkId === entry.tibaHighlightId)) || marks[0];
  return m ? { quote: m.markText, mine: null } : null;
}
