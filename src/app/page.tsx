import Link from "next/link";
import Image from "next/image";
import PhotoGallery from "@/components/PhotoGallery";
import NavBar from "@/components/NavBar";
import FadeIn from "@/components/FadeIn";
import CountUp from "@/components/CountUp";
import QuoteReveal from "@/components/QuoteReveal";
import ScrollProgress from "@/components/ScrollProgress";
import HeroParallax from "@/components/HeroParallax";

const comingThisYear: { name: string; role: string; knownFor: string; image?: string }[] = [
  { name: "Tim Heidecker", role: "Comedian", knownFor: "Tim and Eric", image: "/images/speakers/tim-heidecker.jpg" },
  { name: "Hannibal Buress", role: "Comedian", knownFor: "The Eric Andre Show", image: "/images/speakers/hannibal-buress.jpg" },
  { name: "Josh Johnson", role: "Comedian", knownFor: "The Daily Show", image: "/images/speakers/josh-johnson.jpg" },
  { name: "Kevin Rose", role: "Investor", knownFor: "Digg, True Ventures", image: "/images/speakers/kevin-rose.jpg" },
  { name: "Dr. Rhonda Patrick", role: "Scientist", knownFor: "FoundMyFitness", image: "/images/speakers/dr-rhonda-patrick.jpg" },
  { name: "Steph Smith", role: "Growth", knownFor: "Nvidia", image: "/images/speakers/steph-smith.jpg" },
  { name: "Dan Mangan", role: "Musician", knownFor: "Juno Winner, Side Door", image: "/images/speakers/dan-mangan.jpg" },
  { name: "Matthew Dicks", role: "Storyteller", knownFor: "Storyworthy", image: "/images/speakers/matthew-dicks.jpg" },
  { name: "Jayson Gaignard", role: "Community Builder", knownFor: "Mastermind Talks", image: "/images/speakers/jayson-gaignard.jpg" },
  { name: "Nick Gray", role: "Author", knownFor: "The 2-Hour Cocktail Party", image: "/images/speakers/nick-gray.jpg" },
  { name: "Brianne Kimmel", role: "Investor", knownFor: "Worklife Ventures", image: "/images/speakers/brianne-kimmel.jpg" },
  { name: "Rasa Izadnegahdar", role: "Global Health Director", knownFor: "Gates Foundation", image: "/images/speakers/rasa-izadnegahdar.jpg" },
  { name: "Simran Kaur", role: "Podcast Host", knownFor: "Girls That Invest", image: "/images/speakers/simran-kaur.jpg" },
  { name: "Kate Snyder", role: "Creative Director", knownFor: "Studio Roslyn", image: "/images/speakers/kate-snyder.jpg" },
  { name: "Greg Lansky", role: "Artist", knownFor: "Contemporary Art", image: "/images/speakers/greg-lansky.jpg" },
  { name: "Brit MacRae", role: "Actress", knownFor: "KINO", image: "/images/speakers/brit-macrae.jpg" },
  { name: "Ann Makosinski", role: "Filmmaker", knownFor: "Inventor, BBC Host", image: "/images/speakers/ann-makosinski.jpg" },
  { name: "Dr. Ashley Mason", role: "Psychologist", knownFor: "UCSF", image: "/images/speakers/ashley-mason.jpg" },
  { name: "Jaiya Varshney", role: "Founder", knownFor: "Tydra Biomaterial Labs", image: "/images/speakers/jaiya-varshney.jpg" },
  { name: "Jason Verners", role: "Magician", knownFor: "Close-Up Magic", image: "/images/speakers/jason-verners.jpg" },
  { name: "Marine Coursac", role: "Biologist & Photographer", knownFor: "ConnectEarth", image: "/images/speakers/marine-coursac.jpg" },
];

function initialsFor(name: string) {
  return name
    .replace(/^Dr\.\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const notablePeople = [
  { name: "Hannibal Buress", role: "Comedian", knownFor: "The Eric Andre Show", image: "/images/speakers/hannibal-buress.jpg" },
  { name: "Sam Reich", role: "CEO", knownFor: "Dropout", image: "/images/speakers/sam-reich.jpg" },
  { name: "Greg Isenberg", role: "CEO", knownFor: "Late Checkout", image: "/images/speakers/greg-isenberg.jpg" },
  { name: "Dr. Rhonda Patrick", role: "Scientist", knownFor: "FoundMyFitness", image: "/images/speakers/dr-rhonda-patrick.jpg" },
  { name: "Matthew Buchanan", role: "Co-Founder", knownFor: "Letterboxd", image: "/images/speakers/matthew-buchanan.jpg" },
  { name: "Patrick Campbell", role: "Founder", knownFor: "ProfitWell", image: "/images/speakers/patrick-campbell.jpg" },
  { name: "Shaan Puri", role: "Co-Host", knownFor: "My First Million", image: "/images/speakers/shaan-puri.jpg" },
  { name: "Bill Oakley", role: "Writer", knownFor: "The Simpsons", image: "/images/speakers/bill-oakley.jpg" },
  { name: "Darya Rose", role: "Neuroscientist", knownFor: "Foodist", image: "/images/speakers/darya-rose.jpeg" },
  { name: "Steph Smith", role: "Podcast Host", knownFor: "a16z Podcast", image: "/images/speakers/steph-smith.jpg" },
  { name: "Chris Sparling", role: "Co-Founder", knownFor: "Tiny", image: "/images/speakers/chris-sparling.jpg" },
  { name: "Nick Gray", role: "Author", knownFor: "The 2-Hour Cocktail Party", image: "/images/speakers/nick-gray.jpg" },
  { name: "Matthew Dicks", role: "Storyteller", knownFor: "Storyworthy", image: "/images/speakers/matthew-dicks.jpg" },
  { name: "Adam Lisagor", role: "Director", knownFor: "Sandwich", image: "/images/speakers/adam-lisagor.jpg" },
  { name: "Cyan Banister", role: "Investor", knownFor: "Founders Fund", image: "/images/speakers/cyan-banister.jpg" },
  { name: "Jon Glaser", role: "Comedian", knownFor: "Delocated", image: "/images/speakers/jon-glaser.jpg" },
  { name: "Josh Johnson", role: "Comedian", knownFor: "The Daily Show", image: "/images/speakers/josh-johnson.jpg" },
  { name: "Jason Verners", role: "Magician", knownFor: "", image: "/images/speakers/jason-verners.jpg" },
];

const featuredTestimonials = [
  {
    quote:
      "I\u2019ve been to Davos, Sun Valley, and TED \u2014 this was better.",
    name: "IP3 Attendee",
    descriptor: "",
    image: "",
  },
  {
    quote:
      "Interesting People is exactly what a conference should be, but often isn\u2019t.",
    name: "Steph Smith",
    descriptor: "Growth, Nvidia",
    image: "/images/speakers/steph-smith.jpg",
  },
  {
    quote:
      "Met a roomful of people who were genuinely incredible human beings: Smart. Kind. Generous. Curious. Open minded. A collection of damn unicorns.",
    name: "Matthew Dicks",
    descriptor: "Author of Storyworthy",
    image: "/images/speakers/matthew-dicks.jpg",
  },
];

const faqs = [
  {
    q: "What actually happens at the event?",
    a: "Three days of structured and unstructured time together. Hand-picked dinner groups with conversation prompts to skip the small talk. A storytelling workshop with Moth champion Matthew Dicks. Comedy night. Lake swims. Late-night conversations that turn into friendships. No panels. No keynotes. No lanyards.",
  },
  {
    q: "Where and when is IP4?",
    a: "July 27\u201329, 2026 in Victoria, Canada. Somewhere beautiful, walkable, and away from the noise.",
  },
  {
    q: "How many people attend?",
    a: "Around 150. Small enough to meet everyone, large enough to be surprised. We\u2019re deliberate about the mix \u2014 ages, backgrounds, geographies, industries.",
  },
  {
    q: "Why do I have to record a video?",
    a: "Because resumes lie and bios are performative. A 90-second unedited video tells us more about who you actually are than any written application ever could. It filters for people willing to be real \u2014 and that vulnerability sets the tone for the whole weekend.",
  },
  {
    q: "Is this a networking event?",
    a: "God no. Networking is for guys named Chadwick who hand out business cards at funerals. This is about making actual friends with people who are interesting and kind. If you\u2019re here to collect contacts, this isn\u2019t for you.",
  },
  {
    q: "What if I\u2019m not a founder or executive?",
    a: "Good. We\u2019re not selecting for titles. Teachers, artists, scientists, writers, community organizers \u2014 some of the most interesting people at IP3 had nothing to do with startups.",
  },
  {
    q: "What is the weather generally like during this time of year?",
    a: "Pretty much perfect. Late July is Victoria\u2019s sweet spot \u2014 the driest, sunniest stretch of the year. Expect warm, sunny days in the mid-to-upper 20s\u00b0C (mid-to-upper 70s\u00b0F) with low humidity and almost no rain. Evenings cool down to around 12\u00b0C (54\u00b0F), so bring a layer. It\u2019s the kind of weather where you never check the forecast and it never matters.",
  },
  {
    q: "What do I pack?",
    a: "Whatever makes you feel like you. The weekend covers a lot of ground \u2014 a casual cocktail party the first night, a sauna and swimming, dinner and an evening of entertainment, a day on the lake and sand, and watersports. Think one or two things you can get wet in, something you\u2019d wear to a nice dinner, and layers for the evenings \u2014 we\u2019re on an island on the Pacific Coast, and it cools down once the sun drops. No dress code. No one\u2019s checking.",
  },
  {
    q: "What is your refund policy?",
    a: "We do not offer refunds on IP4 tickets. However, if you\u2019re unable to attend, you\u2019re welcome to transfer your ticket to someone else. Please email hello@interestingpeople.com with the name and email of the person you\u2019d like to transfer your ticket to, and we\u2019ll update the registration accordingly. Transfer requests must be submitted at least 14 days before the event.",
  },
];

function TestimonialBlock({
  quote,
  name,
  descriptor,
  image,
  bg = "bg-white",
}: {
  quote: string;
  name: string;
  descriptor: string;
  image: string;
  bg?: string;
}) {
  return (
    <section className={`py-10 md:py-14 ${bg}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-xl md:text-3xl lg:text-4xl text-stone-800 leading-relaxed font-serif italic text-balance">
          &ldquo;<QuoteReveal text={quote} />&rdquo;
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          {image && (
            <div className="w-12 h-12 rounded-full overflow-hidden relative bg-stone-200 flex-shrink-0">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          <div>
            <p className="font-semibold text-stone-900 text-sm">{image ? name : `\u2014 ${name}`}</p>
            {descriptor && <p className="text-xs text-stone-400">{descriptor}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnglePhotos({
  images,
}: {
  images: { src: string; alt: string; rotate: string }[];
}) {
  return (
    <div className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 flex justify-center items-center gap-4 md:gap-8">
        {images.map((img, i) => (
          <div
            key={i}
            className={`w-64 h-44 sm:w-72 sm:h-48 md:w-80 md:h-56 relative rounded-lg overflow-hidden shadow-xl flex-shrink-0 ${img.rotate} ${i === 1 ? "hidden md:block translate-y-4" : ""} ${i === 2 ? "hidden lg:block -translate-y-2" : ""}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover object-top"
              sizes="(min-width: 768px) 320px, 256px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <NavBar />
      <ScrollProgress />

      {/* Hero */}
      <section className="relative w-full h-screen flex flex-col justify-end overflow-hidden">
        <Image
          src="/images/ip3/lakefront-sunset.jpeg"
          alt="Lakefront sunset at IP3"
          fill
          sizes="100vw"
          className="object-cover animate-ken-burns"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <HeroParallax className="relative z-10 max-w-6xl mx-auto px-6 w-full pb-12 md:pb-24">
          <h1 className="animate-hero text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight text-balance [text-shadow:_0_2px_14px_rgba(0,0,0,0.9)]">
            Make interesting friends.
          </h1>
          <p className="animate-hero-delay-1 mt-4 md:mt-5 text-base md:text-xl text-white/80 leading-relaxed max-w-2xl text-pretty [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)]">
            150 people selected for{" "}
            <span className="text-white font-bold">curiosity</span> and{" "}
            <span className="text-white font-bold">warmth</span>, hanging out in one of the world&apos;s most beautiful places.
          </p>
          <div className="animate-hero-delay-2 mt-6 md:mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_40px_rgba(0,0,0,0.6)] cursor-pointer w-full sm:w-auto"
            >
              Apply to Attend
            </Link>
            <p className="text-sm text-white/60">
              July 27&ndash;29, 2026 &middot; Victoria, Canada
            </p>
          </div>
        </HeroParallax>
      </section>

      {/* Testimonial — Shaan Puri */}
      <TestimonialBlock {...featuredTestimonials[1]} bg="bg-stone-50" />

      {/* Coming This Year */}
      <section className="bg-white py-16 md:py-32" id="coming">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-xs sm:text-sm font-medium tracking-[0.15em] text-violet-600 uppercase mb-4">IP4 &middot; July 27&ndash;29, 2026</p>
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4 text-balance">
              Who&apos;s coming this year.
            </h2>
            <p className="text-base md:text-lg text-stone-500 max-w-2xl mb-10 md:mb-12 text-pretty">
              A few of the 150 joining us in Victoria. More to come &mdash; and a handful you&apos;ll only meet when you&apos;re there.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-6 md:gap-8">
            {comingThisYear.map((person, i) => (
              <FadeIn key={person.name} delay={i * 30}>
                <div className="text-center group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-3 relative bg-stone-200 transition-transform duration-300 group-hover:scale-105 will-change-transform">
                    {person.image ? (
                      <Image
                        src={person.image}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 128px, 96px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 text-stone-500 font-serif text-2xl md:text-3xl select-none">
                        {initialsFor(person.name)}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-stone-900 text-sm">{person.name}</p>
                  {person.role && (
                    <p className="text-xs text-stone-400">{person.role}</p>
                  )}
                  {person.knownFor && (
                    <p className="text-xs text-stone-500">{person.knownFor}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial — Steph Smith */}
      <TestimonialBlock {...featuredTestimonials[0]} bg="bg-stone-50" />

      {/* Angled photos — performances & speakers */}
      <AnglePhotos
        images={[
          { src: "/images/ip3/comedy-night-wide.jpeg", alt: "Comedy night at IP3", rotate: "-rotate-3" },
          { src: "/images/ip3/outdoor-hangout.jpeg", alt: "Outdoor hangout at IP3", rotate: "rotate-2" },
          { src: "/images/ip3/animated-conversation.jpeg", alt: "Animated conversation at IP3", rotate: "-rotate-1" },
        ]}
      />

      {/* A Note from Andrew */}
      <section className="bg-stone-50 py-16 md:py-32" id="about">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4 text-balance">How it all started.</h2>
            <p className="text-xs sm:text-sm font-medium tracking-[0.15em] text-stone-400 uppercase mb-6">A note from Andrew</p>
            <div className="text-base md:text-xl text-stone-700 leading-relaxed space-y-6">
              <p>
                In 2010, I was twenty-four, sitting at a big circular table at my first tech
                conference. Cheesy gold chairs, greyhound bus pattern cushions, hotel banquet
                hall. The VC next to me &mdash; white button-down, Patagonia vest, of course &mdash; asked
                about my startup. I told him I&apos;d bootstrapped it.
              </p>
              <p>
                &ldquo;Ah,&rdquo; he said. &ldquo;A <em>lifestyle business</em>.&rdquo;
              </p>
              <p>
                Then he turned his back on me and started talking to someone else. Left me
                sitting there, cheeks flushed, awkwardly sandwiched between two other conversations.
              </p>
              <p>
                I&apos;ve never forgotten how that felt. Being dismissed based on an arbitrary
                status game. <span className="text-stone-900 font-medium">(Also: screw that guy.)</span>
              </p>
              <p>
                So I built the opposite. Like Harvard, but instead of needing a trust
                fund and a last name that&apos;s on a building somewhere, you just need to
                be interesting and nice.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden relative bg-stone-200 flex-shrink-0">
                <Image
                  src="/images/speakers/andrew-wilkinson.jpg"
                  alt="Andrew Wilkinson"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-semibold text-stone-900">Andrew Wilkinson</p>
                <p className="text-sm text-stone-400">Founder, Interesting People</p>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-xl md:text-3xl font-bold text-stone-900 tracking-tight mb-1 text-balance">What happens when 150 interesting people put their phones away.</p>
            <p className="text-sm md:text-base text-stone-400 mb-4 text-pretty">Show and tell. Comedy. Music. Incredible food. Magic (yes, literally).</p>
          </FadeIn>
          <FadeIn delay={100}>
          <PhotoGallery />
          </FadeIn>
        </div>
      </section>

      {/* Social Proof Wall */}
      <section className="bg-stone-900 py-16 md:py-32 overflow-hidden cv-auto-lg">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-10 text-center text-balance">
            People rave about Interesting People.
          </h2>
          </FadeIn>

          {/* Hero quote */}
          <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-2xl md:text-4xl lg:text-5xl font-serif italic text-white/70 leading-snug max-w-3xl mx-auto text-balance">
              &ldquo;<QuoteReveal text="I usually find events a waste of time, but Interesting People was the opposite." />&rdquo;
            </p>
            <p className="text-white/40 text-sm mt-6">
              &mdash; Greg Isenberg, CEO, Late Checkout
            </p>
          </div>
          </FadeIn>

          {/* Quote grid — 2x2, big and juicy */}
          <FadeIn delay={100}>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
            {[
              { quote: "It\u2019s rare that you go to an event where the bulk of people aren\u2019t on their phone.", name: "Jayson Gaignard", role: "Founder, Mastermind Talks", image: "/images/speakers/jayson-gaignard.avif" },
              { quote: "A great collection of smart people working on interesting things.", name: "Nick Gray", role: "Author & Founder", image: "/images/speakers/nick-gray.jpg" },
              { quote: "So many inspiring conversations, connections made, learnings and insight.", name: "Tessa McLoughlin", role: "Founder & Director, KWENCH", image: "/images/speakers/tessa-mcloughlin.avif" },
              { quote: "I had a blast.", name: "Shaan Puri", role: "Co-host, My First Million", image: "/images/speakers/shaan-puri.jpg" },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10">
                <p className="text-lg md:text-2xl text-white leading-relaxed mb-6 md:mb-8 text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  {t.image ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden relative bg-stone-700 flex-shrink-0">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-white/50 text-lg font-medium">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{t.name}</p>
                    <p className="text-white/40 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </FadeIn>

          {/* Big stat */}
          <FadeIn>
          <div className="text-center">
            <p className="text-6xl sm:text-7xl md:text-9xl font-bold text-white tracking-tight"><CountUp target={94} suffix="%" /></p>
            <p className="text-base md:text-xl text-white/60 mt-4 text-pretty">
              of attendees said they&apos;d come back in a heartbeat.
            </p>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Scarcity bar */}
      <div className="bg-blue-600 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
          <p className="text-white font-medium text-base md:text-xl text-balance">
            Only <CountUp target={150} duration={1000} /> spots. We&apos;re looking for interesting, not impressive.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center min-h-11 text-base text-blue-100 underline underline-offset-2 hover:text-white transition-colors"
          >
            Apply to attend &rarr;
          </Link>
        </div>
      </div>

      {/* The IP Difference — red/green treatment */}
      <section className="py-16 md:py-32 bg-stone-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Column headers — desktop only */}
          <FadeIn>
          <div className="hidden md:grid md:grid-cols-2 md:gap-0 mb-2">
            <div className="md:pr-8 md:border-r md:border-stone-200">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-400 tracking-tight">Most Conferences</h2>
            </div>
            <div className="md:pl-8">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tight">Interesting People</h2>
            </div>
          </div>

          {/* Mobile heading */}
          <div className="md:hidden mb-6">
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight text-balance">This is not that.</h2>
          </div>
          </FadeIn>

          <div className="space-y-0 divide-y divide-stone-200 border-t border-stone-200">
            {[
              { theirs: "Curated by status and who you know", ours: "Curated by curiosity, depth, and emotional intelligence" },
              { theirs: "Panels where one person talks, everyone else scrolls", ours: "80% of the time you\u2019re connecting, not listening" },
              { theirs: "\u201CNetworking breaks\u201D that feel like speed dating", ours: "Shared meals, walks, and activities that create real bonds" },
              { theirs: "Sad conference center buffets and rubber chicken", ours: "Chef-curated meals you\u2019ll actually talk about after" },
              { theirs: "You leave with 50 LinkedIn connections you\u2019ll ignore", ours: "You leave with 5 people you\u2019ll actually stay in touch with" },
              { theirs: "Fluorescent-lit convention centers with no windows", ours: "Beautiful venues surrounded by nature in Victoria, BC" },
              { theirs: "Optimized for sponsors and optics", ours: "Optimized for genuine human connection" },
            ].map((row, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-2 md:gap-0 py-5 md:py-0">
                <FadeIn direction="left" delay={i * 100} className="md:py-6 md:pr-8 md:border-r md:border-stone-200 flex items-start md:items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 md:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-red-400 line-through decoration-red-300 text-sm md:text-base text-pretty">{row.theirs}</p>
                </FadeIn>
                <FadeIn direction="right" delay={i * 100 + 100} className="md:py-6 md:pl-8 flex items-start md:items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 md:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-stone-900 font-medium text-sm md:text-base text-pretty">{row.ours}</p>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial — Matthew Dicks */}
      <section className="py-10 md:py-14 bg-white">
        <FadeIn>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xl md:text-3xl lg:text-4xl text-stone-800 leading-relaxed font-serif italic text-balance">
            &ldquo;<QuoteReveal text="Met a roomful of people who were genuinely incredible human beings: Smart. Kind. Generous. Curious. Open minded. A collection of damn unicorns." />&rdquo;
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden relative bg-stone-200 flex-shrink-0">
              <Image
                src={featuredTestimonials[2].image}
                alt={featuredTestimonials[2].name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm not-italic">{featuredTestimonials[2].name}</p>
              <p className="text-xs text-stone-400 not-italic">{featuredTestimonials[2].descriptor}</p>
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* The Process */}
      <section className="bg-white py-16 md:py-32" id="process">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6 text-balance">
            Ten minutes. That&apos;s it.
          </h2>
          <p className="text-base md:text-lg text-stone-500 max-w-2xl mb-12 md:mb-16 text-pretty">
            We made the bar to apply low and the bar to get in high. It&apos;s intentionally
            simple, intentionally uncomfortable, and intentionally human.
          </p>
          </FadeIn>

          <FadeIn delay={100}>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            <div>
              <span className="text-5xl font-bold text-blue-600/20 leading-none">01</span>
              <h3 className="text-xl font-semibold text-stone-900 mt-3 mb-3">Tell us who you are</h3>
              <p className="text-stone-500 leading-relaxed">
                Your name, where you&apos;re from, and a short bio. No resume. No LinkedIn.
                We want to know what makes you tick, not what makes you look good on paper.
              </p>
            </div>

            <div>
              <span className="text-5xl font-bold text-blue-600/20 leading-none">02</span>
              <h3 className="text-xl font-semibold text-stone-900 mt-3 mb-3">Record a 90-second video</h3>
              <p className="text-stone-500 leading-relaxed">
                Two questions. 45 seconds each. One take. No do-overs. We want to
                see the real you &mdash; how you think on your feet, not how well you
                rehearse.
              </p>
            </div>

            <div>
              <span className="text-5xl font-bold text-blue-600/20 leading-none">03</span>
              <h3 className="text-xl font-semibold text-stone-900 mt-3 mb-3">We watch. We respond.</h3>
              <p className="text-stone-500 leading-relaxed">
                A real human watches every single video. No AI screening. No keyword filters.
                We&apos;ll email you either way &mdash; yes, no, or waitlist.
              </p>
            </div>
          </div>
          </FadeIn>

          <FadeIn delay={200}>
          <div className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-stone-200 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center min-h-12 px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              Start Your Application
            </Link>
            <p className="text-sm text-stone-400 text-center sm:text-left">
              Applications reviewed on a rolling basis. Apply early.
            </p>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* What We Look For */}
      <section className="py-16 md:py-32 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
          <div className="flex flex-col md:flex-row md:items-start md:gap-16 mb-12 md:mb-16">
            <div className="md:flex-1">
              <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6 text-balance">
                What gets you in.
              </h2>
              <p className="text-base md:text-lg text-stone-500 mb-6 text-pretty">
                When we review applications, we ask one question: did this person make us
                feel warm and gooey inside?
              </p>
              <p className="text-base md:text-lg text-stone-500 mb-6 text-pretty">
                We immediately cross people off when we see red flags like:{" "}
                <span className="text-stone-700 font-medium">&ldquo;Chief Innovation Officer.&rdquo;</span>{" "}
                <span className="text-stone-700 font-medium">&ldquo;Futurist.&rdquo;</span>{" "}
                <span className="text-stone-700 font-medium">&ldquo;Catalyst.&rdquo;</span>{" "}
                <span className="text-stone-700 font-medium">&ldquo;Change Maker.&rdquo;</span>{" "}
                And the most dreaded of all:{" "}
                <span className="text-stone-700 font-medium">&ldquo;Forbes 30 Under 30.&rdquo;</span>
              </p>
              <p className="text-base md:text-lg text-stone-500 text-pretty">
                We&apos;re not looking for titles. We&apos;re looking for three things.
              </p>
            </div>

            {/* Fake LinkedIn card with red sharpie slashes */}
            <div className="hidden md:block md:w-72 lg:w-80 flex-shrink-0 mt-8 md:mt-4">
              <div className="relative bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden rotate-2">
                {/* LinkedIn-style header */}
                <div className="h-16 bg-gradient-to-r from-blue-700 to-blue-500" />
                <div className="px-5 pb-5">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-stone-300 border-4 border-white -mt-8 mb-3 overflow-hidden relative">
                    <Image
                      src="/images/chad-worthington.jpg"
                      alt="Chad Worthington III"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <p className="font-bold text-stone-900 text-sm">Chad Worthington III</p>
                  <p className="text-xs text-stone-500 mt-0.5">Chief Innovation Officer</p>
                  <p className="text-xs text-stone-400 mt-0.5">Forbes 30 Under 30 | TEDx Speaker</p>
                  <p className="text-xs text-stone-400">Disruptor | Thought Leader | Catalyst</p>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">500+ connections</span>
                  </div>
                </div>
                {/* NOPE stamp */}
                <div className="absolute top-12 right-3 pointer-events-none">
                  <div className="border-4 border-red-600 rounded-md px-4 py-1.5 rotate-[-12deg] opacity-90">
                    <span className="text-red-600 text-2xl font-black tracking-widest uppercase">NOPE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FadeIn>

          <FadeIn delay={100}>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <span className="number-accent text-5xl md:text-6xl font-bold">01</span>
              <h3 className="text-2xl font-semibold text-stone-900 mt-4 mb-4">Curiosity</h3>
              <p className="text-stone-500 leading-relaxed">
                The kind of person who makes you lean in at dinner. Who asks surprising
                questions. Who has depth, not just credentials. Who goes down rabbit
                holes for the joy of it.
              </p>
            </div>

            <div className="group">
              <span className="number-accent text-5xl md:text-6xl font-bold">02</span>
              <h3 className="text-2xl font-semibold text-stone-900 mt-4 mb-4">Warmth</h3>
              <p className="text-stone-500 leading-relaxed">
                Interesting people make others feel interesting too. They remember
                the small detail you mentioned in passing. They show up fully and
                contribute rather than spectate.
              </p>
            </div>

            <div className="group">
              <span className="number-accent text-5xl md:text-6xl font-bold">03</span>
              <h3 className="text-2xl font-semibold text-stone-900 mt-4 mb-4">Not Being a Douche</h3>
              <p className="text-stone-500 leading-relaxed">
                People who read rooms. Who can disagree without making it personal.
                Who connect without performing. Who make the space better just by
                being in it.
              </p>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-16 md:py-32 cv-auto-lg" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4 text-balance">
              Pick your experience.
            </h2>
            <p className="text-base md:text-lg text-stone-500 max-w-xl mx-auto text-pretty">
              Every tier includes all sessions, meals, and activities. The difference is where you sleep and who you dine with.
            </p>
          </div>
          </FadeIn>

          <FadeIn delay={100}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Local */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 flex flex-col">
              <p className="text-sm font-medium tracking-[0.2em] text-stone-400 uppercase mb-2"><span className="mr-1.5">🏠</span>Local</p>
              <p className="text-4xl font-bold text-stone-900 mb-2">$5,999</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🍽 All meals</span>
                <span className="text-xs text-stone-400">Victoria residents only</span>
              </div>
              <p className="text-stone-500 leading-relaxed mb-6 flex-grow text-sm">
                You live here, you sleep at home. Full access to every session, meal, and activity &mdash; just no hotel room. Must have a Victoria, BC address and actually live here.
              </p>
              <ul className="text-sm text-stone-600 space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  All sessions &amp; activities
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  All meals &amp; refreshments
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-stone-300 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-stone-400">No accommodation</span>
                </li>
              </ul>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center min-h-12 px-6 py-3.5 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
              >
                Apply
              </Link>
            </div>

            {/* Regular */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 flex flex-col">
              <p className="text-sm font-medium tracking-[0.2em] text-stone-400 uppercase mb-2"><span className="mr-1.5">🎟️</span>Regular</p>
              <p className="text-4xl font-bold text-stone-900 mb-2">$9,999</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🏨 5-star hotel</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🍽 All meals</span>
              </div>
              <p className="text-stone-500 leading-relaxed mb-6 flex-grow text-sm">
                Three days, all-in. 5-star hotel, every meal, every session, every late-night conversation.
              </p>
              <ul className="text-sm text-stone-600 space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  All sessions &amp; activities
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  All meals &amp; refreshments
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  3 nights at a 5-star hotel
                </li>
              </ul>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center min-h-12 px-6 py-3.5 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
              >
                Apply Now
              </Link>
            </div>

            {/* VIP */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-6 md:p-8 flex flex-col relative">
              <span className="absolute -top-3 left-6 md:left-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                The Full Treatment
              </span>
              <p className="text-sm font-medium tracking-[0.2em] text-blue-600 uppercase mb-2"><span className="mr-1.5">✨</span>VIP</p>
              <p className="text-4xl font-bold text-stone-900 mb-2">$14,999</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🏨 5-star hotel</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🍽 All meals</span>
                <span className="text-xs text-stone-400">Limited to 20</span>
              </div>
              <p className="text-stone-500 leading-relaxed mb-6 flex-grow text-sm">
                Everything in Regular, elevated. Best room, black car, front-row seats, a private dinner with speakers, and a personal concierge you can text anytime to handle whatever you need.
              </p>
              <ul className="text-sm text-stone-600 space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Everything in Regular
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Upgraded room
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Black car airport transfer
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Private dinner with speakers &amp; Andrew
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  24/7 personal text concierge
                </li>
              </ul>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center min-h-12 px-6 py-3.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
              >
                Apply for VIP
              </Link>
            </div>
          </div>
          </FadeIn>

          <FadeIn delay={200}>
          {/* Patron & Pay What You Can */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-6 md:px-8 py-6 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-stone-900">
                  <span className="mr-1.5">💛</span>Become a Patron &mdash; $19k+
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  Get the full VIP experience. Every dollar above cost funds the comedians, musicians, artists, and scientists who make this weekend unforgettable.
                </p>
                <div className="flex gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🏨 5-star hotel</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🍽 All meals</span>
                </div>
              </div>
              <Link
                href="/patron"
                className="inline-flex items-center justify-center min-h-11 px-6 py-3 bg-stone-900 text-white rounded-full font-medium text-sm hover:bg-stone-800 transition-all mt-5 w-full"
              >
                Learn More
              </Link>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl px-6 md:px-8 py-6 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-stone-900">
                  <span className="mr-1.5">🤝</span>Pay What You Can
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  Same 5-star hotel, same meals, same everything &mdash; just a price that matches your reality. Funded by our Patrons so the room stays interesting.
                </p>
                <div className="flex gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🏨 5-star hotel</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🍽 All meals</span>
                </div>
              </div>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center min-h-11 px-6 py-3 bg-stone-900 text-white rounded-full font-medium text-sm hover:bg-stone-800 transition-all mt-5 w-full"
              >
                Apply
              </Link>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-32 bg-stone-50 cv-auto-md" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-10 md:mb-16 text-balance">
            Questions we hear a lot.
          </h2>
          </FadeIn>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 60}>
              <details className="group border-b border-stone-200">
                <summary className="flex items-center justify-between gap-4 py-5 md:py-6 min-h-12 cursor-pointer list-none">
                  <h3 className="text-base md:text-lg font-medium text-stone-900 text-pretty">{faq.q}</h3>
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0 transition-transform group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <p className="pb-6 text-sm md:text-base text-stone-500 leading-relaxed pr-2 md:pr-12 text-pretty">{faq.a}</p>
              </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-lg font-bold text-stone-900 mb-1">
                Interesting People<sup className="text-blue-600 text-xs">4</sup>
              </p>
              <p className="text-sm text-stone-400">
                A gathering for the genuinely curious.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 sm:gap-x-8 gap-y-1 text-sm">
              <Link href="/apply" className="inline-flex items-center min-h-11 text-stone-500 hover:text-stone-900 transition-colors">
                Apply
              </Link>
              <Link href="/privacy" className="inline-flex items-center min-h-11 text-stone-500 hover:text-stone-900 transition-colors">
                Privacy
              </Link>
              <Link href="#about" className="inline-flex items-center min-h-11 text-stone-500 hover:text-stone-900 transition-colors">
                About
              </Link>
              <Link href="#faq" className="inline-flex items-center min-h-11 text-stone-500 hover:text-stone-900 transition-colors">
                FAQ
              </Link>
              <a href="mailto:hello@interestingpeople.com" className="inline-flex items-center min-h-11 text-stone-500 hover:text-stone-900 transition-colors break-all">
                hello@interestingpeople.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-100 text-sm text-stone-400">
            Applications reviewed on a rolling basis. We respond to everyone.
          </div>
        </div>
      </footer>
    </main>
  );
}
