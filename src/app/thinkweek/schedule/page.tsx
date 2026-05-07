import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Think Week 2025 — Schedule",
  description:
    "The full schedule for Think Week 2025. April 14–17 at Shawnigan Lake, BC.",
};

type ScheduleItem = {
  time: string;
  title: string;
  description?: string;
  emoji: string;
  type: "meal" | "session" | "activity" | "logistics" | "free";
};

type Day = {
  date: string;
  label: string;
  theme: string;
  color: string;
  items: ScheduleItem[];
};

const schedule: Day[] = [
  {
    date: "Tuesday, April 14",
    label: "Day 1",
    theme: "Arrival Day",
    color: "from-amber-500 to-orange-600",
    items: [
      {
        time: "4:00 – 5:00 PM",
        title: "Arrivals",
        description: "Welcome packets and a big table of books to browse.",
        emoji: "🏡",
        type: "logistics",
      },
      {
        time: "5:00 PM",
        title: "Who's In The Room",
        description:
          "Everyone shares who they are and the problem they can't stop thinking about.",
        emoji: "👋",
        type: "session",
      },
      {
        time: "5:30 PM",
        title: "Dinner at Andrew's House",
        description:
          "First night together. Conversation cards on every table.",
        emoji: "🍽",
        type: "meal",
      },
      {
        time: "Evening",
        title: "Unstructured",
        description: "",
        emoji: "🌙",
        type: "free",
      },
    ],
  },
  {
    date: "Wednesday, April 15",
    label: "Day 2",
    theme: "Deep Dive",
    color: "from-blue-500 to-indigo-600",
    items: [
      {
        time: "7:00 AM",
        title: "Coffee Bar Opens",
        emoji: "☕",
        type: "meal",
      },
      {
        time: "8:00 AM",
        title: "Breakfast",
        description: "",
        emoji: "🍳",
        type: "meal",
      },
      {
        time: "9:00 – 11:00 AM",
        title: "Session with Rory",
        description:
          "\"Having a Courageous Conversation with Yourself\" — a 2-hour guided session with Rory. You'll see.",
        emoji: "🧘",
        type: "session",
      },
      {
        time: "11:00 AM – 12:00 PM",
        title: "Coffee Break",
        description: "",
        emoji: "☕",
        type: "meal",
      },
      {
        time: "12:00 – 1:00 PM",
        title: "Lunch",
        description: "",
        emoji: "🥗",
        type: "meal",
      },
      {
        time: "1:00 – 2:30 PM",
        title: "Breakouts",
        description:
          "Small groups, real topics. We'll mix you with people you haven't talked to yet.",
        emoji: "🌲",
        type: "session",
      },
      {
        time: "2:30 – 5:15 PM",
        title: "Free Time",
        description: "Pickleball, hike, swim, sauna, ping pong, read, or just sit by the lake and stare at nothing.",
        emoji: "🌊",
        type: "free",
      },
      {
        time: "5:30 PM",
        title: "Group Dinner Out",
        description: "Quattro Bambino Pizzeria.",
        emoji: "🍷",
        type: "meal",
      },
    ],
  },
  {
    date: "Thursday, April 16",
    label: "Day 3",
    theme: "Workshop Day",
    color: "from-emerald-500 to-teal-600",
    items: [
      {
        time: "7:00 AM",
        title: "Coffee Bar Opens",
        emoji: "☕",
        type: "meal",
      },
      {
        time: "8:00 AM",
        title: "Breakfast",
        description: "",
        emoji: "🍳",
        type: "meal",
      },
      {
        time: "9:00 – 10:00 AM",
        title: "Lightning Talks",
        description:
          "Eight people, five minutes each. Teach us something only you know.",
        emoji: "⚡",
        type: "session",
      },
      {
        time: "10:00 – 10:30 AM",
        title: "Coffee Break",
        description: "",
        emoji: "☕",
        type: "meal",
      },
      {
        time: "10:30 AM – 12:00 PM",
        title: "Hot Seat Mastermind",
        description:
          "A few people bring a real challenge. The whole room helps.",
        emoji: "🎯",
        type: "session",
      },
      {
        time: "12:00 – 1:00 PM",
        title: "Lunch",
        description: "",
        emoji: "🥗",
        type: "meal",
      },
      {
        time: "1:00 – 2:30 PM",
        title: "Group Hike (Optional)",
        description: "",
        emoji: "🥾",
        type: "activity",
      },
      {
        time: "2:30 – 6:30 PM",
        title: "Free Time",
        description: "",
        emoji: "🌊",
        type: "free",
      },
      {
        time: "6:30 PM",
        title: "\"Finale\" Dinner at Andrew's House",
        description: "The last supper. Different cards on the tables this time.",
        emoji: "🍽",
        type: "meal",
      },
    ],
  },
  {
    date: "Friday, April 17",
    label: "Day 4",
    theme: "Synthesis & Send-Off",
    color: "from-violet-500 to-purple-600",
    items: [
      {
        time: "7:00 AM",
        title: "Coffee Bar Opens",
        emoji: "☕",
        type: "meal",
      },
      {
        time: "8:00 AM",
        title: "Breakfast",
        description: "",
        emoji: "🍳",
        type: "meal",
      },
      {
        time: "9:00 AM",
        title: "Closing Circle",
        description:
          "What are you taking with you? Last session of the week.",
        emoji: "📝",
        type: "session",
      },
      {
        time: "10:00 AM",
        title: "Pack Up + Goodbyes",
        description: "",
        emoji: "☕",
        type: "logistics",
      },
      {
        time: "10:30 AM",
        title: "Depart",
        description: "",
        emoji: "👋",
        type: "logistics",
      },
    ],
  },
];

const typeStyles: Record<string, string> = {
  meal: "bg-amber-50 border-amber-200 text-amber-900",
  session: "bg-blue-50 border-blue-200 text-blue-900",
  activity: "bg-emerald-50 border-emerald-200 text-emerald-900",
  logistics: "bg-stone-50 border-stone-200 text-stone-700",
  free: "bg-violet-50 border-violet-200 text-violet-900",
};

function ScheduleCard({ item }: { item: ScheduleItem }) {
  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${typeStyles[item.type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
          {item.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono font-medium opacity-60 shrink-0">
              {item.time}
            </span>
          </div>
          <h3 className="font-semibold text-base mt-0.5 leading-tight">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm mt-1 opacity-75 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
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
              className="text-sm text-stone-900 font-medium transition-colors min-h-[44px] inline-flex items-center"
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
      <section className="pt-24 pb-8 sm:pt-32 sm:pb-12 md:pt-40 md:pb-16 text-center px-5 sm:px-6">
        <p className="text-xs sm:text-sm font-medium text-blue-600 uppercase tracking-widest mb-3 sm:mb-4 animate-fade-in">
          April 14–17, 2025
        </p>
        <h1 className="text-[2.5rem] leading-[1.05] sm:text-4xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight">
          The Schedule
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Four days of conversations, workshops, and lakeside hangs.
          <br className="hidden md:block" />
          Structured enough to be useful. Loose enough to breathe.
        </p>
      </section>

      {/* Legend */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 mb-10 sm:mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {[
            { label: "Meals", style: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "Sessions", style: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Activities", style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { label: "Free / Flex", style: "bg-violet-50 border-violet-200 text-violet-700" },
            { label: "Logistics", style: "bg-stone-50 border-stone-200 text-stone-500" },
          ].map((item) => (
            <span
              key={item.label}
              className={`px-3 py-1.5 rounded-full border font-medium ${item.style}`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
        <div className="space-y-12 sm:space-y-16">
          {schedule.map((day, dayIdx) => (
            <section key={day.date} className="relative">
              {/* Day header */}
              <div className="sticky top-16 z-10 bg-stone-50/95 backdrop-blur-sm pb-4 pt-2">
                <div className="flex items-center gap-4">
                  <div
                    className={`bg-gradient-to-br ${day.color} text-white px-4 py-2 rounded-xl shadow-lg`}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                      {day.label}
                    </span>
                    <p className="text-lg font-bold leading-tight -mt-0.5">
                      {day.theme}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-stone-900">
                      {day.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative ml-2 pl-8 border-l-2 border-stone-200">
                <div className="space-y-3">
                  {day.items.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          item.type === "session"
                            ? "bg-blue-500"
                            : item.type === "meal"
                            ? "bg-amber-400"
                            : item.type === "activity"
                            ? "bg-emerald-500"
                            : item.type === "free"
                            ? "bg-violet-400"
                            : "bg-stone-300"
                        }`}
                      />
                      <ScheduleCard item={item} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Day connector */}
              {dayIdx < schedule.length - 1 && (
                <div className="flex items-center justify-center mt-12 gap-2 text-stone-300">
                  <div className="w-8 border-t border-stone-200" />
                  <span className="text-lg">✦</span>
                  <div className="w-8 border-t border-stone-200" />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Pre-arrival ask */}
      <section className="bg-stone-900 text-white py-14 sm:py-20 px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 sm:mb-4">
            Before you arrive
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Come with one question
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-400 leading-relaxed">
            Something you&apos;ve been turning over that doesn&apos;t have an easy answer.
            You&apos;ll carry it through the week.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 sm:px-6 text-center text-sm text-stone-400">
        <p>
          Think Week 2025 · Shawnigan Lake, BC ·{" "}
          <a
            href="https://luma.com/think-week-2025"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            Event Page
          </a>
        </p>
      </footer>
    </main>
  );
}
