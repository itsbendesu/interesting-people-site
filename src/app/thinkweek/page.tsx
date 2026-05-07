import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Think Week 2025 — Attendee Directory",
  description:
    "Meet the attendees of Think Week 2025. A curated retreat for interesting people at Shawnigan Lake, BC.",
};

type Attendee = {
  name: string;
  role: string;
  company: string;
  bio: string[];
  project: string;
  image: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  isHost?: boolean;
};

const hosts: Attendee[] = [
  {
    name: "Andrew Wilkinson",
    role: "Founder & CEO",
    company: "Tiny",
    bio: ["Buys internet businesses for a living", "Wrote a book called Never Enough", "Organizer of this thing you're looking at"],
    project: "",
    image: "/images/thinkweek/andrew-wilkinson.jpg",
    instagram: "https://instagram.com/awilkinson",
    linkedin: "https://linkedin.com/in/awilk",
    website: "https://tiny.com",
    isHost: true,
  },
  {
    name: "Jonathan Becker",
    role: "Founder & President",
    company: "Thrive Digital / Occasional Ventures",
    bio: ["Spent other people's ad budgets at Uber, Asana, and MasterClass", "Co-organizer and pickleball liability"],
    project: "",
    image: "/images/thinkweek/jonathan-becker.jpg",
    linkedin: "https://linkedin.com/in/jonathanbecker",
    website: "https://tiny.com",
    isHost: true,
  },
  {
    name: "Ben Moore",
    role: "President",
    company: "Folly Partners",
    bio: ["Previously built and sold Pixel Union", "The quiet operator who actually makes things work"],
    project: "",
    image: "/images/thinkweek/ben-moore.jpg",
    isHost: true,
  },
];

const guests: Attendee[] = [
  {
    name: "Floyd Marinescu",
    role: "CEO & Co-founder",
    company: "C4Media / InfoQ",
    bio: ["Angel investor", "Believes robots should pay taxes so humans don't have to"],
    project: "OpenClaw for automating everything.",
    image: "/images/thinkweek/floyd-marinescu.jpg",
    instagram: "https://instagram.com/floydmarinescu",
    linkedin: "https://linkedin.com/in/floydm",
    website: "https://infoq.com",
  },
  {
    name: "Ben Aston",
    role: "Founder & CEO",
    company: "Black & White Zebra",
    bio: ["Built Black & White Zebra, a portfolio of media brands", "Currently figuring out life after SEO", "British, so naturally polite about it"],
    project: "How to diversify and survive in a post-SEO era.",
    image: "/images/thinkweek/ben-aston.jpg",
    instagram: "https://instagram.com/bdaston",
    linkedin: "https://linkedin.com/in/benaston",
    website: "https://bwz.com",
  },
  {
    name: "Matt Smith",
    role: "Co-founder & Board Advisor",
    company: "Thinkific / Later",
    bio: ["Co-founded Later (acquired) and Thinkific (public)", "Now investing in deep tech he can barely explain to his parents", "Vancouver-based"],
    project: "Spinning up a deep tech seed fund.",
    image: "/images/thinkweek/matt-smith.jpg",
    instagram: "https://instagram.com/mattfromlater",
    linkedin: "https://linkedin.com/in/mattrsmith",
    website: "https://thinkific.com",
  },
  {
    name: "Christopher Smith",
    role: "Founder",
    company: "Signal Prior",
    bio: ["CPA turned family office builder", "Formerly at Westerkirk Capital", "The rare accountant you'd want at a dinner party"],
    project: "Building a multi-family office from scratch.",
    image: "/images/thinkweek/christopher-smith.jpg",
    instagram: "https://instagram.com/smithtopherr",
    linkedin: "https://linkedin.com/in/christopher-smith-cpa-68b47117",
    website: "https://signalprior.com",
  },
  {
    name: "Shiraz Higgins",
    role: "Director & Filmmaker",
    company: "Made You Look Media",
    bio: ["Made the bbno$ videos your kids watch on repeat", "Working on a feature film and a legacy video business"],
    project: "A feature film and a legacy videos business.",
    image: "/images/thinkweek/shiraz-higgins.jpg",
    instagram: "https://instagram.com/shirazzee",
    linkedin: "https://linkedin.com/in/shiraz-x-9492b96b",
    website: "https://directedbyshiraz.com",
  },
  {
    name: "Seetoh Lang",
    role: "VP, Communications",
    company: "Red Bull",
    bio: ["Built Red Bull's global social strategy", "Has a video with 274M views, which he mentions casually"],
    project: "",
    image: "/images/thinkweek/seetoh-lang.jpg",
    instagram: "https://instagram.com/seetohlang",
    linkedin: "https://linkedin.com/in/seetoh-lang-24971b17",
  },
  {
    name: "Rajiv Khaneja",
    role: "Co-founder",
    company: "Arvita",
    bio: ["Bootstrapped AdButler (ad tech)", "Now developing mRNA cancer vaccines for kids at Arvita", "Career pivot of the century"],
    project: "Cancer therapeutics focused on NF1 and an mRNA vaccine approach.",
    image: "/images/thinkweek/rajiv-khaneja.jpg",
    instagram: "https://instagram.com/Rajivk",
    linkedin: "https://linkedin.com/in/rajivkhaneja",
    website: "https://arvita.co",
  },
  {
    name: "Bradley Jawl",
    role: "Co-founder & COO",
    company: "MyHealthspan / Mari Imaging",
    bio: ["Physiotherapist turned health tech founder", "Building Victoria's first private AI-enhanced MRI clinic", "Also runs a farm, because one startup wasn't enough"],
    project: "Mari MRI, West Wind Farm, and Green Pill.",
    image: "/images/thinkweek/bradley-jawl.jpg",
    linkedin: "https://linkedin.com/in/bradley-jawl-54aa9985",
    website: "https://mari.ca",
  },
  {
    name: "Vlad Manchash",
    role: "Principal",
    company: "Tricor Pacific Capital",
    bio: ["Building an AI financial reporting tool on the side", "Buys and grows mid-market companies for a living"],
    project: "AI-enabled financial reporting service.",
    image: "/images/thinkweek/vlad-manchash.jpg",
    instagram: "https://instagram.com/vlad.manchash",
    linkedin: "https://linkedin.com/in/vmanchash",
  },
  {
    name: "Nick Walker",
    role: "Co-owner",
    company: "Frontrunners Footwear",
    bio: ["Runs Frontrunners, Vancouver Island's biggest running store", "Former sponsored runner", "Invented LED safety gear so runners stop getting hit by cars"],
    project: "Expanding Nitevest with headlamps and dog harnesses.",
    image: "/images/thinkweek/nick-walker.jpg",
    instagram: "https://instagram.com/nickwalkervic",
    linkedin: "https://linkedin.com/in/nick-walker-33174761",
  },
  {
    name: "Tim Teh",
    role: "Founder & CEO",
    company: "Kano",
    bio: ["Built Kano into a gaming studio with 30M players", "Now exploring AI productivity", "Based in Victoria"],
    project: "AI productivity.",
    image: "/images/thinkweek/tim-teh.jpg",
    instagram: "https://instagram.com/timteh",
    linkedin: "https://linkedin.com/in/timteh",
    website: "https://kano.ca",
  },
  {
    name: "Aran Seaman",
    role: "COO",
    company: "Eartheasy",
    bio: ["Grew up off-grid on a Canadian island", "His career is basically autobiography"],
    project: "Vertical integration.",
    image: "/images/thinkweek/aran-seaman.jpg",
    instagram: "https://instagram.com/aran_",
    linkedin: "https://linkedin.com/in/Aran-seaman-1a24657",
    website: "https://eartheasy.com",
  },
  {
    name: "Adi Gullia",
    role: "Partner & Co-founder",
    company: "Allevar Partners / Ecom North",
    bio: ["Also runs Ecom North, Canada's DTC founder conference", "Retreats are his natural habitat"],
    project: "Hosting founder retreats and conferences with epic DTC founders.",
    image: "/images/thinkweek/adi-gullia.jpg",
    instagram: "https://instagram.com/adityagullia",
    linkedin: "https://linkedin.com/in/adityagullia",
    website: "https://allevarpartners.com",
  },
  {
    name: "Rob Fraser",
    role: "Founder & CEO",
    company: "Outway",
    bio: ["Founded Outway socks with $1K in student loans", "Never took outside investment", "5x Team Canada cyclist, which explains the stubbornness"],
    project: "Self mastery.",
    image: "/images/thinkweek/rob-fraser.jpg",
    instagram: "https://instagram.com/robfraser_",
    linkedin: "https://linkedin.com/in/robbfraser",
    website: "https://outway.com",
  },
  {
    name: "Taylor Fraser",
    role: "Director of E-commerce",
    company: "Outway",
    bio: ["Built the influencer affiliate strategy behind the brand", "Married to Rob, so dinner talk is either socks or strategy"],
    project: "Building a great brand.",
    image: "/images/thinkweek/taylor-fraser.jpg",
    instagram: "https://instagram.com/tayfrays",
    linkedin: "https://linkedin.com/in/taylor-fraser-b07309201",
    website: "https://outway.com",
  },
  {
    name: "Charlie Grinnell",
    role: "Co-CEO",
    company: "RightMetric",
    bio: ["Helps brands figure out what audiences actually want", "Previously at Red Bull, Aritzia, and Arc'teryx"],
    project: "Expanding RightMetric's audience research and competitive intelligence.",
    image: "/images/thinkweek/charlie-grinnell.jpg",
    instagram: "https://instagram.com/charliegrinnell",
    linkedin: "https://linkedin.com/in/charliegrinnell",
    website: "https://rightmetric.co",
  },
  {
    name: "Josh Franklin",
    role: "Founder",
    company: "RUSH / The Culture Fund",
    bio: ["Runs RUSH and The Culture Fund in Victoria", "Gives micro-loans to bring live events back to the city", "The kind of person who makes a city more interesting"],
    project: "An audio-video DJ series connected to RUSH.",
    image: "/images/thinkweek/josh-franklin.jpg",
    instagram: "https://instagram.com/jfrvnk",
  },
  {
    name: "Osric Chau",
    role: "Actor & Producer",
    company: "",
    bio: ["Actor: Supernatural, Avatar: The Last Airbender", "Former Canadian national wushu team member", "In a year of saying yes to everything, which is how he ended up here"],
    project: "Finding a boring business after reading Andrew's book.",
    image: "/images/thinkweek/osric-chau.jpg",
    instagram: "https://instagram.com/osricchau",
    linkedin: "https://linkedin.com/in/osric-chau-3b1941148",
  },
  {
    name: "Tynan",
    role: "Author & Entrepreneur",
    company: "CruiseSheet",
    bio: ["Owns an island off Nova Scotia", "Goes by one name", "Currently building on the island with friends"],
    project: "Building on a private island in Canada with friends and family.",
    image: "/images/thinkweek/tynan.jpg",
    instagram: "https://instagram.com/tynancom",
    website: "https://cruisesheet.com",
  },
  {
    name: "Joshua McKenty",
    role: "CEO & Co-founder",
    company: "Polyguard AI",
    bio: ["Former NASA cloud architect, co-created OpenStack", "Now building real-time deepfake detection"],
    project: "Human authenticity, online and in person.",
    image: "/images/thinkweek/joshua-mckenty.jpg",
    instagram: "https://instagram.com/jmckenty",
    linkedin: "https://linkedin.com/in/joshuamckenty",
    website: "https://polyguard.ai",
  },
];

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center min-h-[44px] py-1 text-stone-400 hover:text-blue-600 transition-colors text-xs font-medium"
    >
      {label}
    </a>
  );
}

function AttendeeCard({ person }: { person: Attendee }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg hover:border-stone-200 transition-all duration-300 grid grid-rows-[auto_auto_auto_1fr_auto_auto]">
      {/* Photo */}
      <div className="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden">
        <Image
          src={person.image}
          alt={person.name}
          fill
          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {person.isHost && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
            Host
          </div>
        )}
      </div>

      {/* Name */}
      <div className="px-5 pt-5">
        <h3 className="font-semibold text-stone-900 text-lg leading-tight">
          {person.name}
        </h3>
        {(person.role || person.company) && (
          <p className="text-sm text-stone-500 mt-0.5">
            {person.role}
            {person.role && person.company && " \u00b7 "}
            {person.company}
          </p>
        )}
      </div>

      {/* Bio bullets */}
      <div className="px-5">
        {person.bio.length > 0 && (
          <ul className="mt-3 space-y-1">
            {person.bio.map((item, i) => (
              <li key={i} className="text-sm text-stone-600 leading-relaxed flex gap-2">
                <span className="text-stone-300 shrink-0">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Spacer — this row is 1fr so it absorbs extra height */}
      <div />

      {/* Currently obsessed with */}
      <div className="px-5">
        {person.project ? (
          <div className="pt-3 border-t border-stone-100">
            <p className="text-[10px] font-medium text-blue-600 uppercase tracking-widest mb-1">
              Currently obsessed with
            </p>
            <p className="text-sm text-stone-700 font-medium leading-relaxed">
              {person.project}
            </p>
          </div>
        ) : (
          <div className="pt-3 border-t border-stone-100">
            <div className="h-6" />
          </div>
        )}
      </div>

      {/* Social links */}
      <div className="px-5 pb-5 pt-4">
        <div className="flex gap-3 pt-3 border-t border-stone-50">
          {person.instagram && (
            <SocialLink href={person.instagram} label="Instagram" />
          )}
          {person.linkedin && (
            <SocialLink href={person.linkedin} label="LinkedIn" />
          )}
          {person.website && (
            <SocialLink href={person.website} label="Website" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ThinkWeekPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/thinkweek"
            className="font-bold text-base sm:text-lg text-stone-900 tracking-tight inline-flex items-center min-h-[44px]"
          >
            Think Week
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/thinkweek"
              className="hidden md:block text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              Attendee Directory
            </Link>
            <Link
              href="/thinkweek/schedule"
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors min-h-[44px] inline-flex items-center"
            >
              Schedule
            </Link>
            <a
              href="https://luma.com/think-week-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Event Page
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-10 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 text-center px-5 sm:px-6">
        <p className="text-xs sm:text-sm font-medium text-blue-600 uppercase tracking-widest mb-3 sm:mb-4">
          April 14&ndash;17, 2025
        </p>
        <h1 className="text-[2.5rem] leading-[1.05] sm:text-4xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight">
          Think Week
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
          A curated retreat for interesting people.
          <br className="hidden md:block" />
          Shawnigan Lake, British Columbia.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 text-sm text-stone-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            22 attendees
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v9.75" />
            </svg>
            3 nights
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Shawnigan Lake, BC
          </span>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-24 mx-auto border-t border-stone-200" />

      {/* Hosts Section */}
      <section id="hosts" className="py-12 sm:py-16 md:py-20 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-medium text-blue-600 uppercase tracking-widest text-center mb-8 sm:mb-10">
            Your Hosts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {hosts.map((host) => (
              <AttendeeCard key={host.name} person={host} />
            ))}
          </div>
        </div>
      </section>

      {/* Attendees Section */}
      <section id="attendees" className="py-12 sm:py-16 md:py-20 px-5 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-medium text-blue-600 uppercase tracking-widest text-center mb-3">
            The Attendees
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6" style={{ gridAutoRows: "auto" }}>
            {guests.map((guest) => (
              <AttendeeCard key={guest.name} person={guest} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-5 sm:px-6 text-center border-t border-stone-100 bg-stone-50">
        <p className="text-sm text-stone-400">
          Think Week 2025 &middot; Hosted by{" "}
          <a
            href="https://luma.com/think-week-2025"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Andrew Wilkinson &amp; Jonathan Becker
          </a>
        </p>
        <p className="text-xs text-stone-300 mt-2">
          Please don&apos;t share this page publicly.
        </p>
      </footer>
    </main>
  );
}
