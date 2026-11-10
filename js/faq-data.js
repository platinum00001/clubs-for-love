/* Clubs for Love — FAQ chat content.
 * Edit answers, keywords and chips here. The widget (js/faq-chat.js) only
 * displays and matches this data. Use {email} for the public inbox — it is
 * filled in from config.js at runtime, so this file does not hard-code it.
 */
window.C4L_FAQ = {
  title: "Clubs for Love",
  subtitle: "Questions?",
  greeting: "Hi — I’m a simple helper for Clubs for Love. I can answer common questions about donating clubs, drop-off, pickup, first bags, and more. Tap a topic or type a question.",
  fallback: {
    text: "I don’t have a set answer for that. Write us on the contact page or email {email}, and someone will get back to you.",
    links: [
      { href: "contact.html", label: "Contact page" },
      { href: "mailto:{email}", label: "{email}" }
    ]
  },
  thanks: "You’re welcome. Ask another question any time, or write {email} if you’d rather talk to a person.",
  hello: "Hi. Ask about donating clubs, drop-off, pickup, a first bag, or sponsoring a round — or tap a topic below.",
  chips: [
    { id: "donate", label: "Donate clubs" },
    { id: "dropoff", label: "Drop-off" },
    { id: "pickup", label: "Pickup" },
    { id: "request", label: "Need clubs / get a bag" },
    { id: "sponsor", label: "Sponsor a round" },
    { id: "tax", label: "Tax receipt" },
    { id: "contact", label: "Contact" },
    { id: "volunteer", label: "Volunteer" }
  ],
  topics: [
    {
      id: "donate",
      phrases: [
        "donate clubs", "donate gear", "donate a bag", "donate my clubs",
        "give clubs", "give gear", "give a bag", "give my clubs",
        "what can i donate", "what can i give", "how do i donate",
        "how to donate", "want to donate", "i have clubs"
      ],
      keywords: [
        "donate", "donation", "donating", "donor", "give", "giving",
        "gear", "clubs", "bag", "bags", "shoes", "apparel", "used", "new",
        "irons", "driver", "putter", "jacket", "rain"
      ],
      negative: ["round", "tee", "bay", "sponsor", "green", "lesson", "need", "request", "tax", "receipt"],
      text: "Used or new clubs, shoes, and apparel are welcome. Take a photo, tell us how to collect it, and send the donate form — no login needed.\n\nWe can pick the bag up, or you can drop it off in Falmouth or Mashpee. Please only give gear you own that is clean and safe to use. Items are a gift and are not returned; extra sets may be auctioned.",
      links: [
        { href: "donate.html", label: "Donate gear" },
        { href: "drop-off.html", label: "Drop-off" },
        { href: "pickup.html", label: "Book pickup" }
      ]
    },
    {
      id: "dropoff",
      phrases: [
        "drop off", "drop-off", "dropoff", "where do i drop", "where to drop",
        "drop sites", "drop site", "leave a bag", "leave it at",
        "falmouth address", "mashpee address", "where are you"
      ],
      keywords: [
        "drop", "dropoff", "leave", "barrel", "address", "addresses",
        "location", "located", "directions", "map", "falmouth", "mashpee",
        "gifford", "kung", "fu", "wellness"
      ],
      negative: ["pickup", "pick", "collect", "porch"],
      text: "We have two drop sites.\n\nFalmouth is 316 Gifford Street, Falmouth, MA 02540. Hours are still to be posted, and drop-offs are by arrangement. Ask for Clubs for Love, park in the lot, and text on arrival so we can meet you at the door.\n\nMashpee is at Family Kung Fu & Wellness, 439 Route 151 (Nathan Ellis Highway), Unit 6. That’s during class hours, or by arrangement. Ask at the front desk for the Clubs for Love barrel, and park in the plaza lot.\n\nIf you need someone to meet you, write {email} before you pull in. Please also tell us what you’re dropping on the donate form.",
      links: [
        { href: "drop-off.html", label: "Drop-off page" },
        { href: "donate.html", label: "Donate gear" }
      ]
    },
    {
      id: "pickup",
      phrases: [
        "book a pickup", "book pickup", "pick up", "pickup window",
        "come get", "come collect", "you pick up", "porch pickup",
        "on the porch", "leave the bag on the porch", "leave it on the porch",
        "leave the bag on my porch"
      ],
      keywords: [
        "pickup", "collect", "collection", "window", "windows",
        "porch", "saturday", "sandwich", "bourne", "cotuit", "hyannis"
      ],
      negative: ["drop"],
      text: "We run two-hour pickup windows in Falmouth, Mashpee, Sandwich, Bourne, Cotuit, and Hyannis, including Saturday windows. Book a window on the pickup form — you can leave the bag on the porch if you won’t be home.\n\nWindows are requests until we confirm them by email. Until we collect a porch bag, it stays your responsibility.",
      links: [
        { href: "pickup.html", label: "Book pickup" }
      ]
    },
    {
      id: "request",
      phrases: [
        "need clubs", "get clubs", "get a bag", "first bag", "need a bag",
        "request clubs", "how do i get clubs", "can i get clubs",
        "want clubs", "for someone in recovery"
      ],
      keywords: [
        "need", "request", "requesting", "golfer", "beginner", "returning",
        "coach", "house", "program", "fit", "shaft", "height"
      ],
      negative: ["donate", "give", "drop", "pickup", "sponsor"],
      text: "Yes — a first bag is for a person in recovery, a coach, or a house or program. Tell us height, hand, and whether it’s a first bag or a return to the game, and we’ll match what we have.\n\nSending a request does not guarantee a set or a round; we match what we have, when we have it. Please don’t share medical details — we only need what helps us fit a bag.",
      links: [
        { href: "request.html", label: "Need clubs" }
      ]
    },
    {
      id: "sponsor",
      phrases: [
        "sponsor a round", "donate a round", "give a round", "gift a tee",
        "tee time", "green fee", "simulator bay", "sponsor a nine",
        "recovery nine", "recovery golf", "cover a round"
      ],
      keywords: [
        "sponsor", "sponsoring", "round", "rounds", "tee", "bay",
        "simulator", "simulators", "lesson", "lessons", "green",
        "course", "courses", "range", "shop", "shops"
      ],
      negative: ["clubs", "bag", "shoes", "apparel", "gear"],
      text: "Courses, shops, and golf simulators can gift a tee time or a simulator bay. A person or a business can sponsor a green fee, a lesson, or a recovery nine. We match the round to someone in recovery who is ready to play.\n\nTell us what you might offer on the Give a round form — no login needed. Gifted rounds follow the course, shop, or simulator’s own rules.",
      links: [
        { href: "sponsors.html", label: "Give a round" }
      ]
    },
    {
      id: "tax",
      phrases: [
        "tax receipt", "tax deductible", "tax deduction", "write off",
        "write-off", "501c3", "501 c 3", "charitable receipt",
        "gift acknowledgment", "gift acknowledgement", "written receipt"
      ],
      keywords: [
        "tax", "taxes", "receipt", "receipts", "deductible", "deduction",
        "deduct", "acknowledgment", "acknowledgement", "appraisal",
        "appraise", "value", "valued", "irs", "nonprofit", "non-profit",
        "charity", "charitable"
      ],
      text: "Donations are accepted under Clubs for Love’s own name. We email a written gift acknowledgment after we actually receive the gear, and we do not appraise or print a dollar value.\n\nIf you’d like a tax-deductible receipt, just ask — it can be arranged through our partner nonprofit, Inspiration Is Everywhere Inc., a 501(c)(3). You can note that on the donate form, or write {email}.",
      links: [
        { href: "donate.html", label: "Donate gear" },
        { href: "contact.html", label: "Contact" }
      ]
    },
    {
      id: "contact",
      phrases: [
        "contact you", "write you", "email you", "how do i contact",
        "get in touch", "reach you", "phone number", "call you",
        "a phone", "have a phone", "your phone", "do you have a phone"
      ],
      keywords: [
        "contact", "email", "inbox", "write", "message", "phone",
        "call", "telephone", "reach"
      ],
      negative: ["volunteer", "calendar", "story", "tax", "receipt"],
      text: "The only inbox on this site is {email}. Every donate, pickup, affiliate, sponsor, and contact form goes there.\n\nWe don’t list a phone number on the site yet. At a drop-off, park and text on arrival so we can meet you — please write us first if you need someone to meet you.",
      links: [
        { href: "contact.html", label: "Contact page" },
        { href: "mailto:{email}", label: "{email}" }
      ]
    },
    {
      id: "volunteer",
      phrases: [
        "volunteer", "help out", "how can i help", "want to help",
        "help you", "get involved"
      ],
      keywords: ["volunteer", "volunteering", "volunteers"],
      text: "We’d be glad to hear from you. There isn’t a separate volunteer page yet — use the contact form and choose Volunteer, or email {email}.",
      links: [
        { href: "contact.html?topic=volunteer", label: "Volunteer — write us" }
      ]
    },
    {
      id: "hours",
      phrases: [
        "your hours", "what hours", "what are your hours", "when are you open",
        "opening hours", "open hours", "business hours", "when can i drop",
        "when can i come"
      ],
      keywords: [
        "hours", "open", "opened", "opening", "closed", "close",
        "schedule", "when"
      ],
      negative: ["pickup", "window", "saturday", "class"],
      text: "We haven’t posted set hours yet. Falmouth drop-offs are by arrangement. Mashpee is during class hours, or by arrangement.\n\nPlease email {email} before you go, since drop-site hours may change.",
      links: [
        { href: "drop-off.html", label: "Drop-off page" },
        { href: "contact.html", label: "Contact" }
      ]
    },
    {
      id: "about",
      phrases: [
        "what is clubs for love", "who are you", "what do you do",
        "about clubs for love", "why golf", "root to rise"
      ],
      keywords: [
        "about", "mission", "program", "purpose", "recovery",
        "story", "what"
      ],
      negative: ["need", "donate", "drop", "pickup", "sponsor", "tax", "hours", "contact"],
      text: "Clubs for Love is the golf arm of Root to Rise, a recovery community in Mashpee and Falmouth. Used or new clubs, shoes, and apparel become a first bag for someone in recovery on Cape Cod.\n\nCourses and simulators can donate a round, and anyone can sponsor one. Extra sets may be auctioned; that money pays green fees, lessons, and recovery golf days.",
      links: [
        { href: "about.html", label: "About" }
      ]
    },
    {
      id: "affiliates",
      phrases: [
        "hold a barrel", "host a barrel", "drop site", "become a drop",
        "affiliate", "partner with you"
      ],
      keywords: ["affiliate", "affiliates", "barrel", "partners", "partner", "church", "gym", "gyms"],
      text: "Pro shops, gyms, golf simulators, churches, and sober homes can hold a barrel. We ask for indoor storage, posted hours, and a person to ask for. Apply on the Affiliates page.",
      links: [
        { href: "affiliates.html", label: "Apply as a drop site" }
      ]
    },
    {
      id: "calendar",
      phrases: [
        "golf day", "nine hole", "9-hole", "intro clinic", "auction night",
        "get on the list", "calendar", "upcoming events"
      ],
      keywords: ["calendar", "event", "events", "clinic", "clinics", "dates", "date"],
      negative: ["hours", "pickup"],
      text: "Recovery 9-hole days, intro clinics, and auction nights will be listed on the calendar when a course, a coach, and a Saturday line up. Dates are still TBA.\n\nEmail {email} with the subject “calendar,” or get on the list from the calendar page. You can also sign in and tap that you’re interested once a date is posted.",
      links: [
        { href: "calendar.html", label: "Calendar" },
        { href: "contact.html?topic=calendar", label: "Get on the list" }
      ]
    },
    {
      id: "stories",
      phrases: ["share a story", "testimonials", "success stories"],
      keywords: ["stories", "story", "testimonial", "testimonials"],
      negative: ["about"],
      text: "We don’t invent testimonials. When someone wants their round told, it will go on the stories page — only with their written OK, and they can ask us to take it down any time. You can share a story from that page or by writing us.",
      links: [
        { href: "stories.html", label: "Stories" },
        { href: "contact.html?topic=story", label: "Share a story" }
      ]
    },
    {
      id: "account",
      phrases: ["sign in", "log in", "create an account", "my account", "do i need an account"],
      keywords: ["account", "login", "signin", "password"],
      text: "Giving never needs a login. An optional account just keeps your forms and event interest in one place. You can sign in from the account page.",
      links: [
        { href: "account.html", label: "Sign in" }
      ]
    },
    {
      id: "privacy",
      phrases: ["delete my data", "privacy policy", "do you sell", "my information"],
      keywords: ["privacy", "data", "delete", "gdpr", "tracker", "trackers"],
      text: "We only use what you send to arrange pickups and drop-offs, match gear and rounds, email gift acknowledgments, and answer you. We don’t sell or rent your information, and we don’t run ads or trackers.\n\nYou can delete your data from the account page, or email {email} with the subject “Delete my data.”",
      links: [
        { href: "privacy.html", label: "Privacy" }
      ]
    },
    {
      id: "crisis",
      phrases: ["in crisis", "suicide", "kill myself", "want to die", "emergency"],
      keywords: ["crisis", "suicide", "988", "911", "emergency", "harm"],
      text: "If you or someone you love is in crisis, call or text 988. In an emergency, dial 911. Clubs for Love is a giving program, not treatment or medical advice.",
      links: [
        { href: "tel:988", label: "Call or text 988" }
      ]
    },
    {
      id: "auction",
      phrases: ["auction night", "extra sets", "surplus", "auctioned"],
      keywords: ["auction", "auctioned", "surplus", "extra"],
      text: "Extra sets may be auctioned. That money pays green fees, lessons, and recovery golf days. Courses can also offer to host an auction night on the Give a round page.",
      links: [
        { href: "about.html", label: "About" },
        { href: "sponsors.html", label: "Give a round" }
      ]
    }
  ]
};
