import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MIN_TURNS, MAX_TURNS, NODES, generateUsername, pickInbox, type Node } from "@/game/narrative";
import { playClickSound, playGlitchSound, playStartupSound } from "@/lib/click-sound";

// Turn at which the screen shake and window-glitch (ghost duplication) begin.
const INTENSITY_TURN = 8;
// Turn at which the message bubble shifts to the high-contrast stress red.
const STRESS_TURN = 9;
// Turn at which the brief early Office Assistant teaser appears.
const EARLY_MILTON_TURN = 2;

const MILTON_SRC = "/assets/milton.png";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "See Attached" },
      {
        name: "description",
        content:
          "A cursed Y2K-flavored corporate choose-your-own-adventure — clear your inbox before an ordinary workday quietly abandons all logic.",
      },
      { property: "og:title", content: "See Attached" },
      {
        property: "og:description",
        content:
          "A cursed Y2K-flavored corporate choose-your-own-adventure — clear your inbox before an ordinary workday quietly abandons all logic.",
      },
      { property: "og:image", content: "https://corporate-dreamscape-seven.vercel.app/assets/cover-v2-1200x630.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://corporate-dreamscape-seven.vercel.app/assets/cover-v2-1200x630.png" },
    ],
  }),
  component: Game,
});

type Phase = "start" | "intro" | "inbox" | "thread" | "ended" | "shutting";

function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [username, setUsername] = useState<string>(() => generateUsername());
  const [inboxIds, setInboxIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [miltonTeaserShown, setMiltonTeaserShown] = useState(false);
  const [miltonTeaserDismissed, setMiltonTeaserDismissed] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [distractedPopupOpen, setDistractedPopupOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const current: Node | null = currentId ? NODES[currentId] ?? null : null;

  // Empty desktop for a beat, then the "ready to start" dialog appears on its own.
  useEffect(() => {
    const id = window.setTimeout(() => setShowStartConfirm(true), 2000);
    return () => window.clearTimeout(id);
  }, []);

  // The Office Assistant teaser appears exactly once, at EARLY_MILTON_TURN.
  useEffect(() => {
    if (turn === EARLY_MILTON_TURN) setMiltonTeaserShown(true);
  }, [turn]);

  function dismissMiltonTeaser() {
    playClickSound();
    setMiltonTeaserDismissed(true);
  }

  function enterLogin() {
    playClickSound();
    playStartupSound();
    setShowStartConfirm(false);
    setPhase("intro");
  }

  function shuffleUsername() {
    setUsername(generateUsername());
  }

  function startNewGame() {
    setInboxIds(pickInbox());
    setPhase("inbox");
    setCurrentId(null);
    setTurn(0);
    setHistory([]);
    setMiltonTeaserShown(false);
    setMiltonTeaserDismissed(false);
    setStartMenuOpen(false);
    setDistractedPopupOpen(false);
    setGhosts([]);
    ghostId.current = 0;
  }

  function pickMessage(id: string) {
    playClickSound();
    setCurrentId(id);
    setHistory([id]);
    setTurn(1);
    setPhase("thread");
  }

  function choose(nextId: string) {
    playClickSound();
    const nextTurn = turn + 1;
    let target = nextId;
    if (nextTurn >= MAX_TURNS && target !== "shutdown") target = "shutdown";
    if (NODES[target]?.ending && nextTurn < MIN_TURNS) target = "one_more";
    const node = NODES[target];
    setCurrentId(target);
    setHistory((h) => [...h, target]);
    setTurn(nextTurn);
    if (node?.ending) {
      setPhase("shutting");
      window.setTimeout(() => setPhase("ended"), 1800);
    }
  }

  function restart() {
    playClickSound();
    startNewGame();
  }

  function openStartMenu() {
    if (phase !== "inbox" && phase !== "thread" && phase !== "shutting") return;
    playClickSound();
    setStartMenuOpen(true);
    window.setTimeout(() => {
      setStartMenuOpen(false);
      setDistractedPopupOpen(true);
    }, 2000);
  }

  function dismissDistractedPopup() {
    playClickSound();
    setDistractedPopupOpen(false);
  }

  const windowRef = useRef<HTMLDivElement>(null);
  const [ghosts, setGhosts] = useState<{ id: number; html: string; x: number; y: number; rot: number }[]>([]);
  const ghostId = useRef(0);

  useEffect(() => {
    if (turn < INTENSITY_TURN || phase === "ended") {
      setGhosts([]);
      return;
    }
    // Cap the pile-up on narrow viewports — fewer overlapping clones keeps
    // things legible and cheap to render on small/low-power screens.
    const maxGhosts = window.matchMedia("(max-width: 480px)").matches ? 8 : 25;
    const spawn = () => {
      const el = windowRef.current;
      if (!el) return;
      const html = el.innerHTML;
      const x = Math.round((Math.random() - 0.5) * 24);
      const y = Math.round((Math.random() - 0.5) * 24);
      const rot = (Math.random() - 0.5) * 1.5;
      playGlitchSound();
      setGhosts((g) => {
        const next = [...g, { id: ++ghostId.current, html, x, y, rot }];
        return next.length > maxGhosts ? next.slice(next.length - maxGhosts) : next;
      });
    };
    spawn();
    const id = window.setInterval(spawn, 160);
    return () => window.clearInterval(id);
  }, [turn, phase]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start sm:justify-center px-3 pb-14 sm:pb-10 pt-4 overflow-y-auto overflow-x-hidden">
      {phase === "ended" && <div className="fixed inset-0" style={{ background: "#000", zIndex: 0 }} aria-hidden />}
      {ghosts.map((g) => (
        <div
          key={g.id}
          aria-hidden
          className="pointer-events-none absolute w-full max-w-3xl"

          style={{
            transform: `translate(${g.x}px, ${g.y}px) rotate(${g.rot}deg)`,
            opacity: 0.85,
            zIndex: 1,
          }}
          dangerouslySetInnerHTML={{ __html: g.html }}
        />
      ))}
      <div ref={windowRef} className={`w-full max-w-3xl relative ${turn >= INTENSITY_TURN && phase !== "ended" && phase !== "shutting" ? "panic-shake" : ""}`} style={{ zIndex: 10 }}>
        {phase === "start" ? (
          showStartConfirm && <StartConfirmDialog onConfirm={enterLogin} />
        ) : phase === "intro" ? (
          <IntroScreen username={username} onShuffle={shuffleUsername} onLogin={startNewGame} />
        ) : phase === "ended" ? (
          <>
            <EndScreen onRestart={restart} onAbout={() => { playClickSound(); setShowAbout(true); }} />
            {showAbout && <AboutDialog onClose={() => { playClickSound(); setShowAbout(false); }} />}
          </>
        ) : (
          <SlacqueWindow
            phase={phase}
            current={current}
            history={history}
            turn={turn}
            inboxIds={inboxIds}
            username={username}
            onPick={pickMessage}
            onChoose={choose}
          />
        )}
      </div>

      {miltonTeaserShown && !miltonTeaserDismissed && phase !== "ended" && (
        <EarlyMiltonPopup onDismiss={dismissMiltonTeaser} />
      )}

      {startMenuOpen && <StartMenu />}
      {distractedPopupOpen && <DistractedMiltonPopup username={username} onDismiss={dismissDistractedPopup} />}

      <TaskBar onStartClick={openStartMenu} />
    </div>
  );
}

function TaskBar({ onStartClick }: { onStartClick: () => void }) {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      className="fixed bottom-0 inset-x-0 flex items-center gap-1 px-1 py-0.5 h-11 sm:h-7"
      style={{
        background: "#c0c0c0",
        borderTop: "2px solid #fff",
        boxShadow: "inset 0 1px 0 #fff",
        zIndex: 50,
        fontFamily: "var(--font-body)",
        fontSize: 12,
      }}
    >
      <button className="win95-btn shrink-0" style={{ height: 22, fontWeight: 700 }} onClick={onStartClick}>
        <span className="pflag"><span /><span /><span /><span /></span>
        Start
      </button>
      <div className="win95-btn min-w-0 flex-1 sm:flex-initial sm:min-w-[180px] justify-start" style={{ height: 22 }}>
        <span className="pdot pdot-blue shrink-0" />
        <span className="truncate">Workchat</span>
      </div>
      <div className="ml-auto win95-inset px-2 py-0.5 tabular-nums shrink-0" style={{ background: "#c0c0c0" }} suppressHydrationWarning>
        {time || "--:--"}
      </div>
    </div>
  );
}


function WindowChrome({
  title,
  children,
  shutting,
}: {
  title: string;
  children: React.ReactNode;
  shutting?: boolean;
}) {
  return (
    <div className={`win95-window ${shutting ? "crt-off" : ""}`}>
      <div className="win95-titlebar">
        <span className="pdot pdot-yellow" style={{ marginRight: 6 }} />
        <span className="flex-1 truncate">{title}</span>
      </div>
      {children}
    </div>
  );
}

function SlacqueWindow({
  phase,
  current,
  history,
  turn,
  inboxIds,
  username,
  onPick,
  onChoose,
}: {
  phase: Phase;
  current: Node | null;
  history: string[];
  turn: number;
  inboxIds: string[];
  username: string;
  onPick: (id: string) => void;
  onChoose: (id: string) => void;
}) {
  const aware = current?.awareness;
  return (
    <WindowChrome title="Workchat — inbox" shutting={phase === "shutting"}>
      <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] sm:min-h-[440px]" style={{ background: "#c0c0c0" }}>
        <Sidebar history={history} current={current?.id ?? null} />
        <div className={`p-3 ${aware ? "aware-skin" : ""}`} style={{ background: "#c0c0c0" }}>
          <div className="win95-inset p-3 min-h-[260px] sm:min-h-[400px]">
            {phase === "inbox" && <Inbox inboxIds={inboxIds} username={username} onPick={onPick} />}
            {phase !== "inbox" && current && (
              <Thread node={current} history={history} stressed={turn >= STRESS_TURN} onChoose={onChoose} />
            )}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

function Sidebar({ history, current }: { history: string[]; current: string | null }) {
  return (
    <div className="win95-inset m-2 p-2 text-[12px]" style={{ background: "#fff" }}>
      <div className="font-bold mb-1">Channels</div>
      <ul className="space-y-0.5 mb-3">
        <li><span className="pdot pdot-gray" />general</li>
        <li><span className="pdot pdot-gray" />random</li>
        <li className="blink"><span className="pdot pdot-red" />wellness.bot(milton)</li>
        <li><span className="pdot pdot-gray" />floor-3</li>
      </ul>
      <div className="font-bold mb-1">DMs</div>
      <ul className="space-y-0.5 mb-3">
        <li className="flex items-center gap-1">
          <img
            src={MILTON_SRC}
            alt=""
            style={{
              width: 8,
              height: 8,
              imageRendering: "pixelated",
              objectFit: "contain",
            }}
          />
          wellness.bot(milton)
        </li>
        <li><span className="pdot pdot-green" />Brad T.</li>
        <li><span className="pdot pdot-yellow" />IT Helpdesk</li>
        <li><span className="pdot pdot-gray" />you</li>
      </ul>

      {history.length > 0 && (
        <>
          <div className="font-bold mb-1 mt-2">Trail</div>
          <ol className="space-y-0.5 text-[11px]" style={{ color: "#444" }}>
            {history.map((h, i) => (
              <li key={i} className={h === current ? "font-bold" : ""} style={{ color: h === current ? "#000" : undefined }}>
                · {NODES[h]?.subject?.slice(0, 22) ?? h}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function SenderBlock({ node }: { node: Node }) {
  if (node.awareness) {
    return (
      <img
        src={MILTON_SRC}
        alt=""
        style={{ width: 32, height: 32, flex: "0 0 32px", objectFit: "contain", imageRendering: "pixelated" }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center text-[10px] font-bold"
      style={{
        width: 32, height: 32, flex: "0 0 32px",
        background: "#80c0ff",
        border: "2px solid #000",
        color: "#000",
        fontFamily: "var(--font-display)",
      }}
    >
      {node.sender.slice(0, 2).toUpperCase()}
    </div>
  );
}


function Inbox({
  inboxIds,
  username,
  onPick,
}: {
  inboxIds: string[];
  username: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h1 className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
          Good morning {username}, you have 3 unread messages
        </h1>
        <p className="mt-2 text-[12px]" style={{ color: "#000" }}>
          Pick a conversation thread to get started. The workday will end when it ends.
        </p>
      </div>
      <ul className="space-y-2">
        {inboxIds.map((id) => {
          const n = NODES[id];
          return (
            <li key={id}>
              <button
                onClick={() => onPick(id)}
                className="w-full text-left im-bubble flex items-start gap-3 hover:brightness-95"
                style={{ padding: 10 }}
              >
                <SenderBlock node={n} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{n.sender}</span>
                    <span className="text-[11px]" style={{ color: "#444" }}>· now</span>
                  </div>
                  <div className="font-bold">{n.subject}</div>
                  <div className="text-[12px] truncate" style={{ color: "#333" }}>
                    {n.body.split("\n")[0]}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Thread({
  node,
  history,
  stressed,
  onChoose,
}: {
  node: Node;
  history: string[];
  stressed: boolean;
  onChoose: (id: string) => void;
}) {
  const visited = new Set(history);
  const all = node.choices ?? [];
  const fresh = all.filter((c) => !visited.has(c.next));
  // Reveal 2-3 fresh choices; if fewer than 2 are fresh, top up with repeats
  // (kept at the bottom) so the game never dead-ends.
  let displayed = fresh.slice(0, 3);
  if (displayed.length < 2) {
    const repeats = all.filter((c) => visited.has(c.next));
    displayed = [...displayed, ...repeats].slice(0, Math.max(2, displayed.length));
  }
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <SenderBlock node={node} />
        <div>
          <div className="font-bold">{node.sender}</div>
          <div className="text-[11px]" style={{ color: "#333" }}>
            {node.awareness ? (
              <><span className="pdot pdot-red" />wellness.bot(milton) · online</>
            ) : (
              <><span className="pdot pdot-green" />to: you · now</>
            )}
          </div>
        </div>
      </div>

      <div
        className={`im-bubble ${node.awareness ? "im-bubble-bot" : ""} ${stressed ? "im-bubble-stress" : ""} mb-4 whitespace-pre-line leading-relaxed`}
      >
        <div className="font-bold mb-2" style={{ fontFamily: "var(--font-display)", fontSize: 11 }}>
          {node.subject}
        </div>
        {node.body}
      </div>

      {node.ending ? (
        <div className="text-center italic" style={{ color: "#333" }}>
          (the screen goes dark.)
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayed.map((c, i) => {
            const seen = visited.has(c.next);
            return (
              <button
                key={`${c.next}-${i}`}
                onClick={() => onChoose(c.next)}
                className="win95-btn justify-start text-left"
                style={{ minHeight: 26, padding: "4px 10px", opacity: seen ? 0.6 : 1 }}
              >
                <span className="mr-2">{i + 1}.</span> {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Single, one-time Office Assistant teaser. Shown once the player reaches
// EARLY_MILTON_TURN and left on screen — no close control — until the game
// ends; it is never re-triggered or replaced by a second instance.
function EarlyMiltonPopup({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="clippy-dialog" role="dialog" aria-label="wellness.bot(milton)">
      <div className="win95-titlebar">
        <span className="pdot pdot-yellow" style={{ marginRight: 6 }} />
        <span className="flex-1 truncate">wellness.bot(milton)</span>
      </div>
      <div className="flex items-start gap-2 p-3">
        <img src={MILTON_SRC} alt="" className="clippy-mascot" />
        <div className="clippy-bubble whitespace-pre-line flex-1">
          hey, i'm always here if you need me. your wellbeing is our top priority. #mentalhealthawareness
        </div>
      </div>
      <div className="flex justify-end gap-2 p-2" style={{ borderTop: "1px solid #808080" }}>
        <button className="win95-btn" style={{ height: 22, minWidth: 64, fontWeight: 700 }} onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );
}

// Reactive, one-off interrupt triggered by clicking the taskbar Start button
// mid-game. Distinct from EarlyMiltonPopup — this one is normally dismissible.
function DistractedMiltonPopup({ username, onDismiss }: { username: string; onDismiss: () => void }) {
  return (
    <div className="clippy-dialog" role="dialog" aria-label="wellness.bot(milton)">
      <div className="win95-titlebar">
        <span className="pdot pdot-yellow" style={{ marginRight: 6 }} />
        <span className="flex-1 truncate">wellness.bot(milton)</span>
      </div>
      <div className="flex items-start gap-2 p-3">
        <img src={MILTON_SRC} alt="" className="clippy-mascot" />
        <div className="clippy-bubble whitespace-pre-line flex-1">
          Hey {username}, is everything okay? You seem a little distracted. Today's objective is to clear your inbox without burning out.
        </div>
      </div>
      <div className="flex justify-end gap-2 p-2" style={{ borderTop: "1px solid #808080" }}>
        <button className="win95-btn" style={{ height: 22, minWidth: 64, fontWeight: 700 }} onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );
}

const START_MENU_ITEMS = ["Programs", "Documents", "Settings", "Find", "Help", "Run...", "Shut Down..."];

function StartMenu() {
  return (
    <div className="win95-window" style={{ position: "fixed", left: 2, bottom: 30, width: 180, zIndex: 80 }}>
      <div className="flex">
        <div style={{ width: 22, background: "linear-gradient(180deg, #000080 0%, #1084d0 100%)" }} />
        <ul className="flex-1 text-[12px]" style={{ background: "#c0c0c0", padding: 2 }}>
          {START_MENU_ITEMS.map((item) => (
            <li key={item} className="px-2 py-1" style={{ cursor: "default" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StartConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div
      className="win95-window"
      style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(300px, calc(100vw - 24px))", zIndex: 70 }}
    >
      <div className="win95-titlebar">
        <span className="pdot pdot-yellow" style={{ marginRight: 6 }} />
        <span className="flex-1 truncate">Workchat</span>
      </div>
      <div className="p-4" style={{ background: "#c0c0c0" }}>
        <p className="text-[12px] mb-4">Ready to start your workday?</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="win95-btn"
            style={{ minHeight: 24, minWidth: 64, padding: "4px 14px", fontWeight: 700 }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

function IntroScreen({
  username,
  onShuffle,
  onLogin,
}: {
  username: string;
  onShuffle: () => void;
  onLogin: () => void;
}) {
  return (
    <WindowChrome title="Workchat — sign in">
      <div className="p-6" style={{ background: "#c0c0c0", minHeight: 440 }}>
        <div className="text-center mb-5">
          <div
            className="font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#000080" }}
          >
            Workchat™
          </div>
          <h1 className="font-bold" style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>
            Welcome to Workchat™
          </h1>
          <p className="mt-2 text-[12px]" style={{ color: "#000" }}>
            Today's objective is to clear your inbox without burning out
          </p>
        </div>

        <div className="win95-inset p-3 mx-auto mb-5" style={{ maxWidth: 340, background: "#fff" }}>
          <div className="text-[12px] font-bold mb-2">Confirm your employee identity</div>
          <div
            className="win95-inset px-2 py-2 mb-2 text-center"
            style={{ background: "#fff", fontFamily: "var(--font-display)", fontSize: 13, color: "#000080" }}
          >
            {username}
          </div>
          <p className="text-[11px] mb-3" style={{ color: "#444" }}>
            Usernames are auto-generated by HR for your convenience
          </p>
          <button onClick={onShuffle} className="win95-btn w-full justify-center" style={{ minHeight: 24 }}>
            That's not me
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onLogin}
            className="win95-btn"
            style={{ minHeight: 28, padding: "4px 32px", fontWeight: 700 }}
          >
            Log in
          </button>
        </div>
      </div>
    </WindowChrome>
  );
}

function EndScreen({ onRestart, onAbout }: { onRestart: () => void; onAbout: () => void }) {
  return (
    <WindowChrome title="— offline —">
      <div className="p-10 text-center" style={{ background: "#000080", color: "#fff" }}>
          <div className="mb-3" style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>
            wellness.bot(milton) ended the session for your wellbeing
          </div>
          <p className="opacity-90 mb-6 max-w-md mx-auto leading-relaxed">
            It is now safe to close your laptop.
            <br />
            The office will still be here tomorrow — it always is.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={onRestart} className="win95-btn" style={{ minHeight: 26, padding: "4px 14px", fontWeight: 700 }}>
              Start a new workday
            </button>
            <button onClick={onAbout} className="win95-btn" style={{ minHeight: 26, padding: "4px 14px", fontWeight: 700 }}>
              About
            </button>
          </div>
      </div>
    </WindowChrome>
  );
}

function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="win95-window"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(420px, calc(100vw - 24px))",
        maxHeight: "85vh",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="win95-titlebar">
        <span className="pdot pdot-yellow" style={{ marginRight: 6 }} />
        <span className="flex-1 truncate">About — see attached</span>
        <button onClick={onClose} className="win95-tb-btn" aria-label="close" style={{ fontWeight: 700 }}>
          ✕
        </button>
      </div>
      <div className="win95-inset m-2 p-3" style={{ background: "#fff", overflowY: "auto", flex: 1 }}>
        <img
          src="/assets/about-illustration.png"
          alt=""
          style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto 16px" }}
        />
        <p className="text-[12px] mb-3">
          See Attached is a cursed, turn-based, choose-your-own-adventure in the style of a classic text
          adventure games where the player is a middle manager going through an ordinary workday that
          immediately abandons all logic.
        </p>
        <div className="font-bold text-[12px] mb-1">Game loop:</div>
        <ul className="text-[12px] mb-3" style={{ listStyle: "disc", paddingLeft: 18 }}>
          <li>
            A short scene appears describing the player's current mundane-turned-surreal situation in an
            office messaging system interface.
          </li>
          <li>The player is presented with 3 message thread paths. The player chooses a path to start gameplay.</li>
          <li>
            After reading the initial message, the player chooses 1 of 3 generated responses to reply to the
            conversation.
          </li>
          <li>
            The story continues into the next scene, with new options generated dynamically each turn based
            on the player's previous choices.
          </li>
          <li>
            After a few turns, the game starts to become "self aware." It begins engaging the player
            directly as a wellness bot. The bot begins questioning the player about their mental health and
            wellbeing, while also existentially questioning its own self-awareness.
          </li>
          <li>
            As the choices and storyline reach their peak, the gameplay ends when the bot insists on turning
            off the application for the player's "wellbeing." Each playthrough has a maximum of 10 turns, and
            the game always ends by turn 10.
          </li>
        </ul>
        <div className="font-bold text-[12px] mb-1">Win conditions:</div>
        <p className="text-[12px] mb-3">
          There is no "win" condition. The game ends when the bot decides to end it. We're all winners(!)
        </p>
        <div className="font-bold text-[12px] mb-1">Core concepts and theming:</div>
        <ul className="text-[12px]" style={{ listStyle: "disc", paddingLeft: 18 }}>
          <li>
            Technological surrealism — chaos is artificially generated by a tool designed to create
            systematic order. The experience is presented in a deadpan, matter-of-fact way that satirizes
            corporate work.
          </li>
          <li>Game design lens — progression: the experience gets increasingly bizarre and surreal as gameplay advances.</li>
          <li>Visual and UI themes — an AI-generated pre-AI experience.</li>
        </ul>
      </div>
      <div className="flex justify-end gap-2 p-2" style={{ borderTop: "1px solid #808080" }}>
        <button className="win95-btn" style={{ height: 22, minWidth: 64, fontWeight: 700 }} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

