import { LANGS, PROS_MAIN, PROS_MOCK, VEX_CPP_MOCK, VEX_PY_MOCK, type Lang } from "./langs";

type Py = {
  runPythonAsync: (c: string) => Promise<unknown>;
  setStdout: (o: { batched: (s: string) => void }) => void;
  setStderr: (o: { batched: (s: string) => void }) => void;
  FS: { writeFile: (p: string, d: string) => void };
};
let pyPromise: Promise<Py> | null = null;
function loadPython(): Promise<Py> {
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

async function runPy(code: string, vex: boolean): Promise<string> {
  const py = await loadPython();
  let out = "";
  py.setStdout({ batched: (s) => { out += s + "\n"; } });
  py.setStderr({ batched: (s) => { out += s + "\n"; } });
  if (vex) {
    py.FS.writeFile("/home/pyodide/vex.py", VEX_PY_MOCK);
    await py.runPythonAsync("import sys, importlib\nif 'vex' in sys.modules: importlib.reload(sys.modules['vex'])");
  }
  try { await py.runPythonAsync(code); } catch (e) {
    const msg = String((e as Error).message);
    out += msg.includes("SystemExit") ? msg.split("\n").filter((l) => l.includes("[sim]")).join("\n") || "[sim] stopped" : msg.split("\n").slice(-3).join("\n");
  }
  return out || "(no output)";
}

function buildCpp(code: string, lang: Lang): string {
  if (lang === "cpp") return code;
  const isPros = lang === "pros";
  const mock = isPros ? PROS_MOCK : VEX_CPP_MOCK;
  const re = isPros ? /^\s*#include\s+["<](main\.h|api\.h|lemlib\/[^">]+|pros\/[^">]+)[">].*$/gm : /^\s*#include\s+["<](vex\.h|v5\.h|v5_vcs\.h)[">].*$/gm;
  const body = code.replace(re, "// (simulator header)");
  return mock + "\n#line 1\n" + body + (isPros ? PROS_MAIN : "");
}

async function runCpp(code: string, lang: Lang): Promise<string> {
  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compiler: "gcc-13.2.0", code: buildCpp(code, lang), options: lang === "cpp" ? "warning" : "", "compiler-option-raw": "-std=c++17" }),
  });
  if (!res.ok) throw new Error("Compiler service unavailable (" + res.status + ")");
  const j = (await res.json()) as { status?: string; compiler_error?: string; program_output?: string; program_error?: string; signal?: string };
  let out = "";
  if (j.compiler_error) out += j.compiler_error.split("\n").filter((l) => !l.includes("-Wvarargs")).slice(0, 25).join("\n") + "\n";
  if (j.program_output) out += j.program_output;
  if (j.program_error) out += j.program_error;
  out += `\n[exit ${j.status ?? "?"}${j.signal ? " " + j.signal : ""}]`;
  return out.trim();
}

export async function runCode(code: string, lang: Lang): Promise<string> {
  const header = `> ${LANGS[lang].family === "py" ? "python" : "g++ -std=c++17"} ${LANGS[lang].file}${lang === "python" || lang === "cpp" ? "" : "  (robot simulator)"}\n`;
  try {
    return header + (LANGS[lang].family === "py" ? await runPy(code, lang === "vexpy") : await runCpp(code, lang));
  } catch (e) {
    return header + "Error: " + (e as Error).message;
  }
}

export function downloadText(name: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
