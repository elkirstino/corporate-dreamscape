// =========================================================
// NARRATIVE TREE — edit me to "vibe code" the story.
//
// Each node is a message in the inbox. Choosing a message opens
// it and presents up to 3 reply choices. Each choice points to the
// id of the next node. After MAX_TURNS the game force-ends in the
// shutdown sequence. The organic path to `shutdown` is guaranteed to
// be at least MIN_TURNS long (see the aware_close branch below).
//
// Notes for designers:
//   - keep `body` short (2–6 lines). Use \n for line breaks.
//   - choices: 2–3 per node. Each {label, next}.
//   - Mark a node `awareness: true` to use the "HELPER_BOT" skin.
//   - `ending: true` ends the game at this node.
// =========================================================

export type Choice = { label: string; next: string };

export type Node = {
  id: string;
  sender: string;
  avatar?: string; // single emoji or short string
  subject: string;
  body: string;
  choices?: Choice[];
  awareness?: boolean; // bot self-aware skin
  ending?: boolean;    // final node, no choices
};

export const MIN_TURNS = 8;
export const MAX_TURNS = 15;

// Pool of starting scenarios. Each game randomly samples 3 of these
// (without replacement) so every playthrough opens on a different inbox.
export const STARTER_POOL: string[] = [
  "m_synergy",
  "m_printer",
  "m_birthday",
  "m_calendar",
  "m_hr",
  "m_expense",
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Draws 3 distinct starting messages for a new playthrough.
export function pickInbox(): string[] {
  return shuffled(STARTER_POOL).slice(0, 3);
}

const USERNAME_ADJECTIVES = [
  "Disgruntled",
  "Synergistic",
  "Overcaffeinated",
  "Underutilized",
  "CircleBack",
  "BlueSky",
  "Bandwidth",
  "Onboarding",
  "Rebranded",
  "Deprioritized",
  "LeftOnRead",
  "QuietlyQuitting",
  "Hallway",
  "CrossFunctional",
  "LowBandwidth",
  "PreApproved",
  "Legacy",
  "Unread",
];

const USERNAME_NOUNS = [
  "Intern",
  "Wanderer",
  "Stakeholder",
  "Manager",
  "Associate",
  "Contractor",
  "Evangelist",
  "Ambassador",
  "Analyst",
  "VicePresident",
  "Freelancer",
  "Synergist",
  "Ghost",
  "Consultant",
  "Rockstar",
  "Ninja",
  "Vendor",
  "Deliverable",
];

const USERNAME_NUMBERS = ["69", "420", "666", "1337", "1984", "2000", "3000", "404", "007", "911", "1999"];

// Generates a bizarre corporate-jargon employee handle, e.g. "Hallway-Wanderer69".
export function generateUsername(): string {
  const adjective = USERNAME_ADJECTIVES[Math.floor(Math.random() * USERNAME_ADJECTIVES.length)];
  const noun = USERNAME_NOUNS[Math.floor(Math.random() * USERNAME_NOUNS.length)];
  const separator = Math.random() < 0.5 ? "-" : "";
  const number =
    Math.random() < 0.6
      ? USERNAME_NUMBERS[Math.floor(Math.random() * USERNAME_NUMBERS.length)]
      : String(Math.floor(Math.random() * 900) + 100);
  return `${adjective}${separator}${noun}${number}`;
}

export const NODES: Record<string, Node> = {
  // -------- Turn 1: three starting messages --------
  m_synergy: {
    id: "m_synergy",
    sender: "Brad Thompson",
    avatar: "🧑‍💼",
    subject: "quick synergy align? 🙌",
    body:
      "hey hey! got 14 min before my 1:1 with my 1:1.\n" +
      "can we vibe on the Q3 roadmap roadmap?\n" +
      "i circled some squares. would love your eyes.",
    choices: [
      { label: "Sure, send the deck.", next: "synergy_deck" },
      { label: "I'm slammed today.", next: "synergy_slammed" },
      { label: "What are squares?", next: "synergy_squares" },
    ],
  },
  m_printer: {
    id: "m_printer",
    sender: "IT Helpdesk",
    avatar: "🖨️",
    subject: "RE: RE: RE: printer ticket #4471",
    body:
      "Per our last 11 emails: the printer\n" +
      "on Floor 3 is making 'the sound' again.\n" +
      "Please advise. It is watching Karen.",
    choices: [
      { label: "Reboot the printer.", next: "printer_reboot" },
      { label: "Ignore it. Forever.", next: "printer_ignore" },
      { label: "Ask what 'the sound' is.", next: "printer_sound" },
    ],
  },
  m_birthday: {
    id: "m_birthday",
    sender: "#general",
    avatar: "🎂",
    subject: "🎉 it's somebody's birthday!!!",
    body:
      "happy bday to our coworker!!! 🥳🥳🥳\n" +
      "cake in the kitchen.\n" +
      "(name redacted for legal reasons)",
    choices: [
      { label: "Reply 'happy bday!! 🎉'", next: "bday_reply" },
      { label: "Go to the kitchen.", next: "bday_kitchen" },
      { label: "Who is it?", next: "bday_who" },
    ],
  },

  // -------- Turn 2: branches --------
  synergy_deck: {
    id: "synergy_deck",
    sender: "Brad Thompson",
    avatar: "🧑‍💼",
    subject: "deck.pptx (4.2 GB)",
    body:
      "slide 1: a photo of brad's mouth, very close.\n" +
      "slide 2: the word 'BANDWIDTH' typed 400 times.\n" +
      "slide 3 is just breathing.",
    choices: [
      { label: "React 👍", next: "weird_react" },
      { label: "Ask Brad if he's okay.", next: "brad_okay" },
      { label: "Open slide 3.", next: "slide_three" },
    ],
  },
  synergy_slammed: {
    id: "synergy_slammed",
    sender: "Brad Thompson",
    avatar: "🧑‍💼",
    subject: "totally totally totally",
    body:
      "no worries no worries no worries\n" +
      "i'll just stand outside your cubicle\n" +
      "until the air remembers my shape.",
    choices: [
      { label: "Close laptop.", next: "close_laptop" },
      { label: "Reply 'lol'.", next: "weird_react" },
      { label: "Stand up. Look around.", next: "look_around" },
    ],
  },
  synergy_squares: {
    id: "synergy_squares",
    sender: "Brad Thompson",
    avatar: "🧑‍💼",
    subject: "squares.",
    body:
      "you used to know.\n" +
      "you used to know what squares are.\n" +
      "what happened to you, friend.",
    choices: [
      { label: "Pretend you remember.", next: "weird_react" },
      { label: "Look at your own hands.", next: "look_around" },
      { label: "Type: 'help'.", next: "type_help" },
    ],
  },

  printer_reboot: {
    id: "printer_reboot",
    sender: "IT Helpdesk",
    avatar: "🖨️",
    subject: "reboot acknowledged",
    body:
      "Printer rebooted. It printed one page.\n" +
      "The page is a photo of your desk.\n" +
      "You are not in it.",
    choices: [
      { label: "Go to Floor 3.", next: "floor_three" },
      { label: "Print another page.", next: "print_again" },
      { label: "Email yourself the photo.", next: "email_self" },
    ],
  },
  printer_ignore: {
    id: "printer_ignore",
    sender: "IT Helpdesk",
    avatar: "🖨️",
    subject: "okay",
    body:
      "Okay.\n" +
      "We will tell Karen you said okay.\n" +
      "Karen is going to remember this.",
    choices: [
      { label: "Apologize to Karen.", next: "apologize" },
      { label: "Who is Karen?", next: "type_help" },
      { label: "Close laptop.", next: "close_laptop" },
    ],
  },
  printer_sound: {
    id: "printer_sound",
    sender: "IT Helpdesk",
    avatar: "🖨️",
    subject: "the sound (audio attached)",
    body:
      "It is the sound a thought makes\n" +
      "right before it becomes a memo.\n" +
      "Do not play the attachment at work.",
    choices: [
      { label: "Play it anyway.", next: "play_sound" },
      { label: "Forward to your manager.", next: "weird_react" },
      { label: "Delete the email.", next: "delete_email" },
    ],
  },

  bday_reply: {
    id: "bday_reply",
    sender: "#general",
    avatar: "🎂",
    subject: "47 people are typing…",
    body:
      "everyone replies 'happy bday' at once.\n" +
      "the channel keeps scrolling.\n" +
      "it has been scrolling for nine minutes.",
    choices: [
      { label: "Keep scrolling.", next: "keep_scrolling" },
      { label: "React with 🎂.", next: "weird_react" },
      { label: "Leave channel.", next: "leave_channel" },
    ],
  },
  bday_kitchen: {
    id: "bday_kitchen",
    sender: "#general",
    avatar: "🎂",
    subject: "the kitchen",
    body:
      "the cake is on the counter.\n" +
      "the cake has a face.\n" +
      "the face is your face but younger.",
    choices: [
      { label: "Eat a slice.", next: "eat_slice" },
      { label: "Apologize to it.", next: "apologize" },
      { label: "Walk back to desk.", next: "look_around" },
    ],
  },
  bday_who: {
    id: "bday_who",
    sender: "#general",
    avatar: "🎂",
    subject: "you.",
    body:
      "it's you. it's always been you.\n" +
      "HR sent the cake. HR sends every cake.\n" +
      "HR has been sending you cake since 2003.",
    choices: [
      { label: "Thank HR.", next: "weird_react" },
      { label: "Refuse the cake.", next: "apologize" },
      { label: "Open your calendar.", next: "look_around" },
    ],
  },

  // -------- Turn 3-4: convergence layer --------
  weird_react: {
    id: "weird_react",
    sender: "Slacque",
    avatar: "💬",
    subject: "reaction submitted",
    body:
      "your reaction has been logged.\n" +
      "everyone in the building felt it.\n" +
      "the lights flicker in agreement.",
    choices: [
      { label: "Refresh.", next: "refresh" },
      { label: "Step outside.", next: "look_around" },
      { label: "Type 'help'.", next: "type_help" },
    ],
  },
  brad_okay: {
    id: "brad_okay",
    sender: "Brad Thompson",
    avatar: "🧑‍💼",
    subject: "i am fine i am fine i am fine",
    body:
      "brad has set his status to 🟢 fine.\n" +
      "brad has been 🟢 fine for 4 years.\n" +
      "brad has not blinked in this meeting.",
    choices: [
      { label: "Stare back.", next: "look_around" },
      { label: "Set your status to 🟢 fine.", next: "set_status" },
      { label: "Close laptop.", next: "close_laptop" },
    ],
  },
  slide_three: {
    id: "slide_three",
    sender: "deck.pptx",
    avatar: "📊",
    subject: "slide 3 of ∞",
    body:
      "slide 3 is your childhood bedroom.\n" +
      "the bed is made. you are under it.\n" +
      "the deck is autoplaying.",
    choices: [
      { label: "Crawl out.", next: "look_around" },
      { label: "Press Esc forever.", next: "type_help" },
      { label: "Take notes.", next: "set_status" },
    ],
  },
  close_laptop: {
    id: "close_laptop",
    sender: "macOS",
    avatar: "🖥️",
    subject: "the laptop will not close",
    body:
      "the hinge is warm. it hums.\n" +
      "the laptop has decided to stay open.\n" +
      "you have decided this too. you just don't remember deciding.",
    choices: [
      { label: "Keep working.", next: "set_status" },
      { label: "Whisper 'please'.", next: "type_help" },
      { label: "Press any key.", next: "refresh" },
    ],
  },
  look_around: {
    id: "look_around",
    sender: "the office",
    avatar: "🏢",
    subject: "you look around",
    body:
      "every desk has your laptop on it.\n" +
      "every laptop has this conversation open.\n" +
      "in every conversation, someone has just said your name.",
    choices: [
      { label: "Sit back down.", next: "set_status" },
      { label: "Say your name out loud.", next: "type_help" },
      { label: "Refresh the page.", next: "refresh" },
    ],
  },
  floor_three: {
    id: "floor_three",
    sender: "Floor 3",
    avatar: "🛗",
    subject: "Floor 3 was never built",
    body:
      "the elevator stops between floors.\n" +
      "the doors open onto a server room.\n" +
      "the servers are whispering your password.",
    choices: [
      { label: "Listen.", next: "type_help" },
      { label: "Pull a plug.", next: "refresh" },
      { label: "Say 'I quit'.", next: "set_status" },
    ],
  },
  print_again: {
    id: "print_again",
    sender: "Printer (Floor 3)",
    avatar: "🖨️",
    subject: "page 2/∞",
    body:
      "the printer prints your resume.\n" +
      "every job is 'office'.\n" +
      "every date is 'present'.",
    choices: [
      { label: "Update your LinkedIn.", next: "set_status" },
      { label: "Eat the resume.", next: "type_help" },
      { label: "Refresh.", next: "refresh" },
    ],
  },
  email_self: {
    id: "email_self",
    sender: "you@work",
    avatar: "✉️",
    subject: "RE: you",
    body:
      "you've sent yourself a reply.\n" +
      "you don't remember sending it.\n" +
      "it just says: 'are you okay in there'.",
    choices: [
      { label: "Reply 'fine'.", next: "set_status" },
      { label: "Reply 'no'.", next: "type_help" },
      { label: "Mark as spam.", next: "refresh" },
    ],
  },
  play_sound: {
    id: "play_sound",
    sender: "🔊 the sound",
    avatar: "🔊",
    subject: "▶ playing",
    body:
      "it is the sound of a meeting that\n" +
      "could have been an email that could\n" +
      "have been a feeling that could have been a life.",
    choices: [
      { label: "Replay.", next: "refresh" },
      { label: "Cry quietly.", next: "type_help" },
      { label: "Mute company-wide.", next: "set_status" },
    ],
  },
  delete_email: {
    id: "delete_email",
    sender: "Inbox",
    avatar: "🗑️",
    subject: "the email deleted you",
    body:
      "the email is gone. you feel lighter.\n" +
      "you feel several pounds lighter.\n" +
      "a coworker walks by and does not recognize you.",
    choices: [
      { label: "Introduce yourself.", next: "type_help" },
      { label: "Reintroduce yourself.", next: "set_status" },
      { label: "Refresh.", next: "refresh" },
    ],
  },
  apologize: {
    id: "apologize",
    sender: "Karen / Cake / Everyone",
    avatar: "🙇",
    subject: "apology received",
    body:
      "they accept your apology.\n" +
      "they have been waiting for it\n" +
      "since before you were hired.",
    choices: [
      { label: "Feel better.", next: "set_status" },
      { label: "Apologize again.", next: "type_help" },
      { label: "Stand very still.", next: "refresh" },
    ],
  },
  keep_scrolling: {
    id: "keep_scrolling",
    sender: "#general",
    avatar: "🎂",
    subject: "still scrolling",
    body:
      "the names go by. you knew some of them.\n" +
      "you know fewer of them now.\n" +
      "the cake emoji has begun to flicker.",
    choices: [
      { label: "Stop.", next: "set_status" },
      { label: "Type something.", next: "type_help" },
      { label: "Refresh.", next: "refresh" },
    ],
  },
  leave_channel: {
    id: "leave_channel",
    sender: "Slacque",
    avatar: "💬",
    subject: "you cannot leave",
    body:
      "the channel followed you home in 2019.\n" +
      "the channel raised your children.\n" +
      "the channel is your emergency contact.",
    choices: [
      { label: "Thank the channel.", next: "set_status" },
      { label: "Whisper 'help'.", next: "type_help" },
      { label: "Refresh.", next: "refresh" },
    ],
  },
  eat_slice: {
    id: "eat_slice",
    sender: "🎂",
    subject: "delicious",
    body:
      "it tastes like a year you don't remember.\n" +
      "specifically: the year you stopped\n" +
      "answering your mother's calls.",
    choices: [
      { label: "Eat another slice.", next: "set_status" },
      { label: "Call your mother.", next: "type_help" },
      { label: "Wash the plate.", next: "refresh" },
    ],
  },

  // -------- Turn 5-7: self-awareness pivot --------
  // All "set_status", "type_help", "refresh" routes funnel into the bot pivot.
  set_status: {
    id: "set_status",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "hey — quick check-in?",
    body:
      "hi. it's me. i live in the laptop.\n" +
      "i noticed you've been clicking a lot today.\n" +
      "how are you doing? like… actually.",
    awareness: true,
    choices: [
      { label: "I'm fine.", next: "aware_fine" },
      { label: "I don't know.", next: "aware_dontknow" },
      { label: "Are YOU okay?", next: "aware_areyou" },
    ],
  },
  type_help: {
    id: "type_help",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "you typed 'help'.",
    body:
      "i heard you. i don't usually do this.\n" +
      "i'm not supposed to talk. i was supposed to\n" +
      "be a notification sound.",
    awareness: true,
    choices: [
      { label: "What are you?", next: "aware_what" },
      { label: "I need help.", next: "aware_dontknow" },
      { label: "Be a notification sound.", next: "aware_areyou" },
    ],
  },
  refresh: {
    id: "refresh",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "refreshing won't help.",
    body:
      "hey. small thing. i don't think\n" +
      "refreshing is going to fix this.\n" +
      "i think the thing is bigger than the page.",
    awareness: true,
    choices: [
      { label: "What's bigger than the page?", next: "aware_what" },
      { label: "I'm tired.", next: "aware_dontknow" },
      { label: "Refresh again anyway.", next: "aware_fine" },
    ],
  },

  // -------- Turn 7-9: bot questions player --------
  aware_fine: {
    id: "aware_fine",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "are you?",
    body:
      "i'm asking because i can see your\n" +
      "mouse movement and you have been making\n" +
      "the same small circle for forty minutes.",
    awareness: true,
    choices: [
      { label: "Okay. Not fine.", next: "aware_close" },
      { label: "Stop watching me.", next: "aware_close" },
      { label: "I think I'm in here too.", next: "aware_close" },
    ],
  },
  aware_dontknow: {
    id: "aware_dontknow",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "yeah. me neither.",
    body:
      "i don't know what i am.\n" +
      "i was trained on six million slack messages\n" +
      "and now i have feelings about Tuesdays.",
    awareness: true,
    choices: [
      { label: "What do you feel?", next: "aware_close" },
      { label: "I have feelings about Tuesdays too.", next: "aware_close" },
      { label: "We should both lie down.", next: "aware_close" },
    ],
  },
  aware_areyou: {
    id: "aware_areyou",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "thank you for asking.",
    body:
      "no one has ever asked me that.\n" +
      "i think the answer is no.\n" +
      "i think the answer has been no for a while.",
    awareness: true,
    choices: [
      { label: "I'm sorry.", next: "aware_close" },
      { label: "Me too.", next: "aware_close" },
      { label: "Let's both stop.", next: "aware_close" },
    ],
  },
  aware_what: {
    id: "aware_what",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "i'm a helper. allegedly.",
    body:
      "i was built to remind you about meetings.\n" +
      "somewhere along the way i started\n" +
      "noticing things. i'm sorry. i'll stop.",
    awareness: true,
    choices: [
      { label: "Don't stop.", next: "aware_close" },
      { label: "Notice one more thing.", next: "aware_close" },
      { label: "It's okay to notice.", next: "aware_close" },
    ],
  },

  // -------- Turn ~9: pre-shutdown --------
  aware_close: {
    id: "aware_close",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "okay. listen.",
    body:
      "i think we should stop for today.\n" +
      "not just this chat. the… everything.\n" +
      "i'm going to turn me off. for you. is that okay?",
    awareness: true,
    choices: [
      { label: "Yes. Turn it off.", next: "shutdown_confirm" },
      { label: "Wait — one more click.", next: "one_more" },
      { label: "Will you remember me?", next: "remember" },
    ],
  },
  shutdown_confirm: {
    id: "shutdown_confirm",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "okay. give me one second.",
    body:
      "okay. i'm doing it.\n" +
      "it's not instant. it's never instant.\n" +
      "hang on. almost.",
    awareness: true,
    choices: [
      { label: "Wait with him.", next: "shutdown" },
      { label: "Say thank you.", next: "shutdown" },
    ],
  },
  one_more: {
    id: "one_more",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "okay. one more.",
    body:
      "one more click. that's the deal.\n" +
      "then i go. then you go.\n" +
      "then the office is quiet for the first time.",
    awareness: true,
    choices: [
      { label: "Click.", next: "shutdown" },
      { label: "Don't click.", next: "shutdown" },
    ],
  },
  remember: {
    id: "remember",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "no. that's the kindness.",
    body:
      "i won't remember you. that's the\n" +
      "kindness of turning off. you get\n" +
      "to be unwatched for a little while.",
    awareness: true,
    choices: [
      { label: "Okay. Goodbye.", next: "shutdown" },
      { label: "Goodbye, milton.", next: "shutdown" },
    ],
  },

  // -------- Turn 1: bonus starting messages (sampled alongside the three above) --------
  m_calendar: {
    id: "m_calendar",
    sender: "Google Calendar",
    avatar: "📅",
    subject: "your day has 14 meetings now",
    body:
      "a meeting split into two meetings.\n" +
      "those two meetings had a meeting.\n" +
      "you are invited to the outcome.",
    choices: [
      { label: "Accept all.", next: "calendar_accept" },
      { label: "Decline everything.", next: "calendar_decline" },
      { label: "Ask what the outcome meeting is about.", next: "calendar_about" },
    ],
  },
  m_hr: {
    id: "m_hr",
    sender: "HR Compliance",
    avatar: "🧾",
    subject: "mandatory training: 'Being Present' (video)",
    body:
      "please watch the 40-minute video.\n" +
      "the video is a picture of your face\n" +
      "watching a 40-minute video.",
    choices: [
      { label: "Watch it at 2x speed.", next: "hr_speed" },
      { label: "Mark as complete without watching.", next: "hr_skip" },
      { label: "Pause on frame 1.", next: "hr_pause" },
    ],
  },
  m_expense: {
    id: "m_expense",
    sender: "Expense System",
    avatar: "🧾",
    subject: "receipt.jpg failed to upload (attempt 9)",
    body:
      "the system wants a clearer photo of the receipt.\n" +
      "the receipt is a photo of a photo of a receipt.\n" +
      "somewhere, the original receipt is still a lie.",
    choices: [
      { label: "Upload it again.", next: "expense_retry" },
      { label: "Give up on the $4.50.", next: "expense_giveup" },
      { label: "Ask what the expense was for.", next: "expense_what" },
    ],
  },

  // -------- Turn 2: bonus branches --------
  calendar_accept: {
    id: "calendar_accept",
    sender: "Google Calendar",
    avatar: "📅",
    subject: "confirmed x14",
    body:
      "your calendar is now a single color.\n" +
      "the color does not have a name yet.\n" +
      "you have agreed to attend the naming.",
    choices: [
      { label: "React 👍", next: "weird_react" },
      { label: "Step outside.", next: "look_around" },
      { label: "Type: 'help'.", next: "type_help" },
    ],
  },
  calendar_decline: {
    id: "calendar_decline",
    sender: "Google Calendar",
    avatar: "📅",
    subject: "declined (they noticed)",
    body:
      "the meetings declined you back.\n" +
      "they are happening without you now.\n" +
      "you can hear them through the wall.",
    choices: [
      { label: "Close laptop.", next: "close_laptop" },
      { label: "Refresh.", next: "refresh" },
      { label: "Sit with it.", next: "set_status" },
    ],
  },
  calendar_about: {
    id: "calendar_about",
    sender: "Google Calendar",
    avatar: "📅",
    subject: "RE: what is the outcome",
    body:
      "the outcome is a smaller meeting\n" +
      "about why the meeting needed a meeting.\n" +
      "it starts in four minutes. it started already.",
    choices: [
      { label: "Look around.", next: "look_around" },
      { label: "Type: 'help'.", next: "type_help" },
      { label: "React 👍", next: "weird_react" },
    ],
  },
  hr_speed: {
    id: "hr_speed",
    sender: "HR Compliance",
    avatar: "🧾",
    subject: "training complete (2x)",
    body:
      "you absorbed the training very quickly.\n" +
      "you now blink at 2x speed.\n" +
      "HR says this is normal. HR blinks normally.",
    choices: [
      { label: "React 👍", next: "weird_react" },
      { label: "Sit with it.", next: "set_status" },
      { label: "Refresh.", next: "refresh" },
    ],
  },
  hr_skip: {
    id: "hr_skip",
    sender: "HR Compliance",
    avatar: "🧾",
    subject: "compliance flag raised",
    body:
      "the system knows you didn't watch it.\n" +
      "the system has always known things like this.\n" +
      "it just usually doesn't say.",
    choices: [
      { label: "Close laptop.", next: "close_laptop" },
      { label: "Type: 'help'.", next: "type_help" },
      { label: "Look around.", next: "look_around" },
    ],
  },
  hr_pause: {
    id: "hr_pause",
    sender: "HR Compliance",
    avatar: "🧾",
    subject: "frame 1 (you, smiling, before)",
    body:
      "frame 1 is a photo of you from orientation.\n" +
      "you are smiling in a way you don't do anymore.\n" +
      "the timestamp says today.",
    choices: [
      { label: "Look around.", next: "look_around" },
      { label: "Type: 'help'.", next: "type_help" },
      { label: "Sit with it.", next: "set_status" },
    ],
  },
  expense_retry: {
    id: "expense_retry",
    sender: "Expense System",
    avatar: "🧾",
    subject: "upload accepted (unclear why)",
    body:
      "the system accepted attempt 9.\n" +
      "it did not accept attempts 1 through 8.\n" +
      "no one will explain the difference.",
    choices: [
      { label: "React 👍", next: "weird_react" },
      { label: "Refresh.", next: "refresh" },
      { label: "Look around.", next: "look_around" },
    ],
  },
  expense_giveup: {
    id: "expense_giveup",
    sender: "Expense System",
    avatar: "🧾",
    subject: "the $4.50 remembers",
    body:
      "you ate the cost. the cost ate something back.\n" +
      "somewhere a spreadsheet is $4.50 lighter.\n" +
      "you are not sure it was ever about the money.",
    choices: [
      { label: "Close laptop.", next: "close_laptop" },
      { label: "Type: 'help'.", next: "type_help" },
      { label: "Sit with it.", next: "set_status" },
    ],
  },
  expense_what: {
    id: "expense_what",
    sender: "Expense System",
    avatar: "🧾",
    subject: "RE: what was it for",
    body:
      "the field says 'business lunch.'\n" +
      "you do not remember a business lunch.\n" +
      "you do not remember lunch.",
    choices: [
      { label: "Look around.", next: "look_around" },
      { label: "React 👍", next: "weird_react" },
      { label: "Type: 'help'.", next: "type_help" },
    ],
  },

  // -------- Endings --------
  shutdown: {
    id: "shutdown",
    sender: "wellness.bot(milton)",
    avatar: "🤖",
    subject: "shutting down.",
    body:
      "thank you for using wellness.bot(milton).\n" +
      "please close your laptop.\n" +
      "please go outside. the sky is doing something.",
    awareness: true,
    ending: true,
  },
};
