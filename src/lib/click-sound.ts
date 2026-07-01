// A short synthesized physical mouse-click, played on gameplay button
// presses. Synthesized via Web Audio API rather than a bundled asset since
// there's no audio file in this project yet. Built as a filtered noise
// transient (not a tone) so it reads as a crisp mechanical click rather
// than an electronic beep.

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedContext) sharedContext = new AudioContextCtor();
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

// All audio stays muted/silent until the player's first click, tap, or
// keypress — required for third-party-iframe embeds where autoplay-with-
// sound is blocked anyway, and generally friendlier regardless of context.
// Click/glitch sounds are always fired *from* a user gesture already, so
// this only really gates the startup chime, which otherwise plays on mount.
let audioUnlocked = false;
let pendingStartupSound = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  if (pendingStartupSound) {
    pendingStartupSound = false;
    playStartupSoundNow();
  }
}

if (typeof window !== "undefined") {
  const interactionEvents: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart"];
  const onFirstInteraction = () => {
    unlockAudio();
    for (const evt of interactionEvents) window.removeEventListener(evt, onFirstInteraction);
  };
  for (const evt of interactionEvents) window.addEventListener(evt, onFirstInteraction, { passive: true });
}

export function playClickSound() {
  unlockAudio();
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 0.014;

  const bufferSize = Math.max(1, Math.ceil(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const decay = Math.pow(1 - i / bufferSize, 4);
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

// Classic Windows 95-style error chime, played on each duplicate-window
// glitch spawn to reinforce the sense of the system breaking down. Each call
// spins up a fresh <audio> element so rapid, overlapping spawns each get
// their own independent playback instead of cutting each other off.
export function playGlitchSound() {
  unlockAudio();
  if (typeof window === "undefined") return;
  const audio = new Audio("/assets/audio/erro.mp3");
  audio.volume = 0.5;
  void audio.play().catch(() => {});
}

function playStartupSoundNow() {
  const audio = new Audio("/assets/audio/windows-xp-startup.mp3");
  void audio.play().catch(() => {});
}

// Classic Windows XP startup chime, meant to play the moment the desktop
// first appears. If the player hasn't interacted with the page yet, it's
// queued instead and fires the instant they do (first click/tap/keypress).
export function playStartupSound() {
  if (typeof window === "undefined") return;
  if (!audioUnlocked) {
    pendingStartupSound = true;
    return;
  }
  playStartupSoundNow();
}
