# Jerry Wu Personal Studio — Incremental Design Map

Status: design direction, before implementation  
Principle: evolve the existing site; do not rebuild it

## 1. Core identity

Jerry is presented through three inseparable modes:

- **Thinker / 思考者** — writing, research, observation, judgment
- **Builder / 建造者** — products, experiments, data tools, interfaces
- **Performer / 表演者** — voice, band, stage, physical presence

These are not three decorative labels or three homepage cards. They are the site's hidden content structure:

| Page | Primary role | Page responsibility |
| --- | --- | --- |
| Home | The meeting point | Let visitors sense all three modes in one first impression |
| About | The explanation | Show why thinking, building, and performing belong to the same person |
| Blog | Thinker | Make Jerry's curiosity and judgment visible |
| Projects | Builder | Show ideas becoming useful, testable things |
| Performance | Performer | Bring physical presence, emotion, collaboration, and risk |
| Contact | The invitation | End quietly and make the next human action obvious |

Internal identity sentence:

> A thinker, builder, and performer working between music, data, and design.

This sentence is a design compass. It does not have to appear verbatim in the interface.

## 2. Art direction

### Visual thesis

一个建立在暖灰纸面上的个人工作室：结构安静而清晰，灰蓝与灰绿像记忆一样浮现，墨迹和水面保留缓慢、偶然、仍在变化的能量。

In shorthand:

> Stillness with a pulse — 安静，但仍有脉搏。

### Content plan

1. **First impression:** Jerry Wu and the coexistence of music, data, and design.
2. **Orientation:** clear paths into thinking, building, and performing.
3. **Evidence:** real writing, working projects, and real performance photography.
4. **Invitation:** a quiet, direct way to continue the conversation.

### Interaction thesis

- Ink and water move almost below conscious attention; they create atmosphere, not spectacle.
- Color appears through proximity and attention: hover, focus, active navigation, or an important image.
- Content responds immediately; environmental motion can be slow, but interaction feedback must never feel delayed.

## 3. Existing assets to protect

The following are part of the site's identity and should not be replaced without a specific reason:

- the current page structure and routes;
- the full-viewport ink-pool homepage composition;
- the editorial serif and sans-serif relationship;
- the About page's first-person writing and section structure;
- the toned photography that returns to color on hover;
- the Projects page's water / reflection concept;
- authentic live-performance photography, including intense stage color;
- the desktop sidebar as a calm, persistent orientation device;
- the site's card-light, text-and-image-led character.

## 4. Global iteration rules

### 4.1 Color roles

Do not merely make the website beige. Build relationships between colored greys.

| Role | Direction | Intended use |
| --- | --- | --- |
| Paper | warm mineral off-white | main background and calm space |
| Surface | light mushroom / stone grey | subtle region separation |
| Primary ink | deep warm charcoal | primary text, never pure black |
| Secondary ink | softened warm grey | descriptions and metadata |
| Quiet accent | grey green | active state, small markers, selected details |
| Cool accent | grey blue | water, links, focus, reflective moments |
| Living accent | image-derived color | rare emotional spike from performance or photography |

Rules:

- One viewport should normally have only one active accent.
- Grey green and grey blue should not compete in the same small region.
- Natural performance color may be intense, but the surrounding interface stays quiet.
- Color must communicate attention or meaning, not fill empty space.
- Pure white, pure black, neon, and blue-purple product gradients are outside the system.

### 4.2 Typography

- Keep the current two-family limit: editorial serif plus functional sans serif.
- Serif carries identity, titles, and reflective language.
- Sans serif carries navigation, metadata, categories, and utility.
- Do not use artistic typography to reduce legibility.
- Page titles should be recognizable as one family, even when Projects retains a small distorted-water treatment.

### 4.3 Material

- Preferred: paper, pigment, diluted ink, fog, water reflection, soft photographic grain.
- Use shadows as atmospheric depth, not as plastic elevation.
- Avoid glass panels, generic translucent cards, glossy bubbles, and strong neumorphism.
- Texture should be felt before it is noticed.

### 4.4 Motion

- Preserve the homepage's slow ink drift.
- Preserve reduced-motion support.
- Use at most one environmental motion and one interaction motion in the same region.
- Hover and focus may reveal color, clarity, or a fine line; avoid routine scaling of every element.
- Projects may respond like a surface under pressure, but must not feel like draggable toys.

### 4.5 Mobile

- No horizontal clipping or masked overflow.
- A mobile visitor must reach page identity/content before a tall navigation block consumes the first viewport.
- Homepage title and primary paths must fit naturally at 320–430px widths.
- Organic shapes must adapt to content rather than forcing text into narrow interiors.

## 5. Page-by-page iteration map

### Home — convergence of all three identities

**One job:** make Jerry memorable before asking visitors to choose a section.

Preserve:

- full-screen ink field;
- quiet-left / expressive-right composition;
- Jerry Wu musical mark;
- five direct paths into the site;
- slow background drift.

Color-only adjustment:

- shift the neutral wash toward warmer mineral paper;
- retain grey blue in the ink field;
- introduce grey green only as a rare active or focus state;
- soften glass-like navigation veils so they feel closer to pigment washes than panels.

Small experiment:

- test identity-led hero copy that implies the thinker / builder / performer triad without listing three labels;
- test whether the navigation paths can read as editorial entries rather than five translucent cards;
- test a subtle difference in accent behavior for Blog, Projects, and Performance while keeping one shared system.

Do not:

- add a three-card identity section;
- add a résumé summary, statistics, or technology badges to the first viewport;
- replace the ink image with a generic gradient.

Acceptance:

- in five seconds, a visitor should understand that Jerry works across music, data, and design;
- the first viewport remains one composition, not a hero plus a component grid;
- it works without clipping at 320–430px widths.

### About — the point where the three identities become one person

**One job:** explain the internal connection between Jerry's interests and practices.

Preserve:

- “Now / I've Built / I Care About / I'm Drawn To” structure;
- first-person voice;
- gallery of real personal and performance images;
- desaturated-to-natural-color hover behavior;
- the line of thought represented by “structure but still breathe.”

Color-only adjustment:

- use warmer text and paper values;
- allow individual photographs to contribute a controlled grey-green, grey-blue, or muted clay echo;
- use section dividers sparingly through value changes rather than borders.

Small experiment:

- make the three modes legible through sequencing of content, without explicitly labeling every section Thinker / Builder / Performer;
- test one short opening sentence that connects music, data, and interfaces before biographical detail;
- let image color return at different strengths, based on emotional importance.

Do not:

- convert the page into a conventional résumé timeline;
- split the three identities into independent biography cards;
- over-filter every photo into the same beige tone.

Acceptance:

- the page should feel personal before it feels impressive;
- all three modes are evident by the end of the first two content sections;
- the gallery supports the story instead of acting as decoration.

### Blog — thinker

**One job:** reveal curiosity, breadth, and judgment through writing.

Preserve:

- chronological editorial list;
- visible dates and topics;
- summaries that make each essay scannable;
- cardless timeline structure.

Color-only adjustment:

- use a quiet grey-green or grey-blue for the currently attended article, not every tag;
- make metadata recede through value rather than tiny type alone;
- keep article titles in warm ink.

Small experiment:

- create subtle thematic rhythms between music, technology, and markets using accent behavior rather than permanent category colors;
- test a soft wash appearing behind only the hovered/focused title line;
- strengthen title hierarchy without making the page louder.

Do not:

- turn articles into a thumbnail card grid;
- assign a saturated color to every category;
- add decorative imagery that does not explain an article.

Acceptance:

- titles are the first scan layer, summaries the second, metadata the third;
- a long list still feels paced rather than monotonous;
- keyboard focus is as clear as hover.

### Projects — builder

**One job:** show ideas becoming working systems and experiments.

Preserve:

- the moonlit pool metaphor;
- uneven spatial arrangement on desktop;
- the featured-project distinction;
- responsive transformation into a readable sequence;
- the connection between music, finance, data, and tools.

Color-only adjustment:

- replace bright white droplets with differentiated mineral greys;
- use grey blue for water depth and grey green for one selected or featured state;
- reduce the white highlight range and cool plastic sheen;
- keep body copy warm enough to feel part of the wider site.

Small experiment:

- reinterpret cards as reflections, pigment deposits, or soft stones at the water surface;
- reduce shadow elevation and move depth into tonal temperature;
- let interaction create a ripple or color clarification instead of primarily lifting/scaling the card.

Do not:

- remove the pool and replace it with a standard project grid;
- make text conform to shapes so aggressively that reading suffers;
- increase gloss, blur, or toy-like drag behavior.

Acceptance:

- project names and purposes remain readable before the metaphor is understood;
- the pool feels related to the homepage ink field;
- the interface remains credible as a portfolio, not only memorable as an experiment.

### Performance — performer

**One job:** provide physical presence, collaboration, risk, and emotional contrast.

Preserve:

- real performance and rehearsal photography;
- large image-led presentation;
- direct titles and compact contextual information;
- vivid stage lighting when it is authentic to the image.

Color-only adjustment:

- let each photograph temporarily supply the page's living accent;
- keep frames, captions, and surrounding space in the restrained global palette;
- correct text contrast over bright magenta and other unstable image regions.

Small experiment:

- test a slower photographic reveal or crop shift rather than uniform image zoom;
- use muted image previews that open into fuller color only on attention, where appropriate;
- create more deliberate pauses between performances.

Do not:

- globally desaturate the archive;
- place text over visually busy regions without a stable contrast plane;
- turn the page into a generic masonry gallery.

Acceptance:

- Performance is the most alive page without feeling like a different website;
- captions remain readable over every image;
- the natural color spike feels intentional because the surrounding UI is restrained.

### Contact — quiet invitation

**One job:** make a human next step feel easy and personal.

Preserve:

- minimal content;
- clear email and external links;
- generous breathing room;
- centered, low-pressure tone.

Color-only adjustment:

- use one quiet accent for active links;
- give the empty field a barely visible relationship to the site's ink or paper material;
- keep contact information in strong warm charcoal.

Small experiment:

- introduce one personal closing line connected to thinking, building, or making music;
- add a very small residual ink/water trace, as if the visual system is settling;
- test left alignment inside the centered field if it feels more conversational.

Do not:

- add a large form unless there is a real workflow for receiving it;
- add social-icon decoration without meaningful destinations;
- fill the open space simply because it is empty.

Acceptance:

- contact details are immediately usable;
- the page feels like Jerry's closing note, not a generic template;
- the visual system resolves rather than introducing a new idea.

## 6. Implementation sequence

### Batch 0 — stabilize the existing experience

No art-direction change yet.

- fix mobile horizontal clipping and content-width behavior;
- reduce the mobile navigation's first-viewport cost;
- unify navigation order;
- unify visible brand treatment;
- change inconsistent “Abstract Studio” metadata to Jerry Wu;
- update stale footer years and encoding artifacts;
- confirm keyboard focus and reduced-motion behavior.

### Batch 1 — introduce the Morandi color system

Keep layout and content unchanged.

- define semantic color tokens for paper, surface, primary ink, secondary ink, grey green, grey blue, and image-derived accent;
- migrate shared background, text, navigation, rules, and focus states to those tokens;
- compare all pages side by side in desktop and mobile screenshots;
- verify text contrast before adding texture or motion.

### Batch 2 — reconcile material language

- tune homepage navigation veils;
- tune Projects water and droplet material;
- define consistent photo treatment between About and Performance;
- give Blog and Contact one restrained visual signature each.

### Batch 3 — identity and copy refinement

- refine homepage headline and supporting language around the three-mode identity;
- refine About opening sequence;
- remove generic or repeated copy;
- keep the interface language personal, not self-consciously “artistic.”

### Batch 4 — motion refinement

- keep only motion that improves presence, hierarchy, or affordance;
- align timing and easing across pages;
- test touch, keyboard, reduced-motion, and lower-powered mobile behavior;
- remove interactions that read as ornamental or toy-like.

## 7. Review checklist

Evaluate every iteration with these questions:

- Can the page's job be understood by scanning headings only?
- Does the page express thinker, builder, performer, or their meeting point?
- Is there one dominant visual idea rather than several competing effects?
- If all texture and motion are removed, does the composition remain strong?
- Is the accent genuinely rare?
- Does the image or interaction carry narrative meaning?
- Does the page still feel like Jerry rather than “Morandi style” or “Radiohead style”?
- Does the mobile version preserve calm, legibility, and orientation?
- Did this iteration strengthen an existing asset instead of replacing it?

## 8. First implementation boundary

The safest first coding pass is **Batch 0 only**. It improves consistency and mobile integrity without changing the site's art direction. Batch 1 should begin only after Batch 0 screenshots establish a reliable baseline.

