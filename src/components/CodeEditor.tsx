import { useRef, type KeyboardEvent } from "react";
import { LANGS, type Lang } from "@/lib/langs";

const KW: Record<"py" | "cpp", string[]> = {
  py: ["def", "return", "if", "elif", "else", "for", "while", "in", "import", "from", "as", "class", "True", "False", "None", "and", "or", "not", "print", "range", "break", "continue", "pass", "try", "except", "with", "lambda"],
  cpp: ["int", "float", "double", "void", "return", "if", "else", "for", "while", "include", "using", "namespace", "class", "struct", "true", "false", "const", "bool", "auto", "std", "pros", "lemlib", "vex", "nullptr", "static", "char"],
};

function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function highlight(code: string, lang: Lang) {
  const fam = LANGS[lang]?.family ?? "py";
  const com = fam === "py" ? "#[^\\n]*" : "\\/\\/[^\\n]*";
  const re = new RegExp(`(${com})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${KW[fam].join("|")})\\b)`, "g");
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
    if (e.key === "Tab") { e.preventDefault(); insert(LANGS[lang]?.family === "py" ? "    " : "  "); }
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", a - 1) + 1;
      const line = value.slice(lineStart, a);
      let indent = line.match(/^\s*/)?.[0] ?? "";
      if (/[:{]\s*$/.test(line)) indent += LANGS[lang]?.family === "py" ? "    " : "  ";
      insert("\n" + indent);
    }
  };

  const cls = "m-0 whitespace-pre p-3 font-mono text-sm leading-6";
  return (
    <div data-editor className="flex h-full min-h-[360px] overflow-hidden rounded-xl border bg-background/80">
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

