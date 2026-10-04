import { useRef, type KeyboardEvent } from "react";
import type { Lang } from "@/lib/store";

const KW: Record<Lang, string[]> = {
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "import", "from", "as", "class", "True", "False", "None", "and", "or", "not", "print", "range", "break", "continue", "pass"],
  cpp: ["int", "float", "double", "void", "return", "if", "else", "for", "while", "include", "using", "namespace", "class", "struct", "true", "false", "const", "bool", "auto"],
};

function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function highlight(code: string, lang: Lang) {
  const com = lang === "python" ? "#[^\\n]*" : "\\/\\/[^\\n]*";
  const re = new RegExp(`(${com})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${KW[lang].join("|")})\\b)`, "g");
  let out = ""; let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] ? "text-syn-com italic" : m[2] ? "text-syn-str" : m[3] ? "text-syn-num" : "text-syn-key";
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last)) + "\n";
}

export function CodeEditor({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: Lang }) {
  const pre = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget; const { selectionStart: a, selectionEnd: b } = ta;
    const insert = (txt: string) => {
      const v = value.slice(0, a) + txt + value.slice(b);
      onChange(v);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = a + txt.length; });
    };
    if (e.key === "Tab") { e.preventDefault(); insert(lang === "python" ? "    " : "  "); }
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", a - 1) + 1;
      const line = value.slice(lineStart, a);
      let indent = line.match(/^\s*/)?.[0] ?? "";
      if (/[:{]\s*$/.test(line)) indent += lang === "python" ? "    " : "  ";
      insert("\n" + indent);
    }
  };

  const cls = "m-0 whitespace-pre p-3 font-mono text-sm leading-6";
  return (
    <div className="flex h-full min-h-[360px] overflow-hidden rounded-md border bg-background">
      <div ref={gutter} className="select-none overflow-hidden border-r bg-muted/50 py-3 pr-2 text-right font-mono text-sm leading-6 text-muted-foreground" style={{ minWidth: 44 }}>
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <pre ref={pre} aria-hidden className={`${cls} pointer-events-none absolute inset-0 overflow-hidden`} dangerouslySetInnerHTML={{ __html: highlight(value, lang) }} />
        <textarea
          spellCheck={false} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKey}
          onScroll={(e) => { const t = e.currentTarget; if (pre.current) { pre.current.scrollTop = t.scrollTop; pre.current.scrollLeft = t.scrollLeft; } if (gutter.current) gutter.current.scrollTop = t.scrollTop; }}
          className={`${cls} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-primary outline-none`}
        />
      </div>
    </div>
  );
}

// Pyodide loader (browser Python)
type Py = { runPythonAsync: (c: string) => Promise<unknown>; setStdout: (o: { batched: (s: string) => void }) => void; setStderr: (o: { batched: (s: string) => void }) => void };
let pyPromise: Promise<Py> | null = null;
export function loadPython(): Promise<Py> {
  if (pyPromise) return pyPromise;
  pyPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    s.onload = async () => {
      try { resolve(await (window as unknown as { loadPyodide: () => Promise<Py> }).loadPyodide()); } catch (e) { reject(e); }
    };
    s.onerror = () => { pyPromise = null; reject(new Error("Could not load Python runtime")); };
    document.head.appendChild(s);
  });
  return pyPromise;
}

export async function runPython(code: string): Promise<string> {
  const py = await loadPython();
  let out = "";
  py.setStdout({ batched: (s) => { out += s + "\n"; } });
  py.setStderr({ batched: (s) => { out += s + "\n"; } });
  try { await py.runPythonAsync(code); } catch (e) { out += String((e as Error).message).split("\n").slice(-3).join("\n"); }
  return out || "(no output)";
}
