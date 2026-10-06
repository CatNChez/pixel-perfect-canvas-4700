// VEX V5 Brain connection over USB using the browser's Web Serial API (Chrome/Edge).
type Port = {
  open: (o: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
};
type Serial = { requestPort: (o?: { filters: { usbVendorId: number }[] }) => Promise<Port> };

export const VEX_VENDOR_ID = 0x2888;
export const serialSupported = () => typeof navigator !== "undefined" && "serial" in navigator;

export class BrainLink {
  port: Port | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async connect(onData: (s: string) => void) {
    const serial = (navigator as unknown as { serial: Serial }).serial;
    this.port = await serial.requestPort({ filters: [{ usbVendorId: VEX_VENDOR_ID }] });
    await this.port.open({ baudRate: 115200 });
    void this.readLoop(onData);
  }

  private async readLoop(onData: (s: string) => void) {
    const dec = new TextDecoder();
    while (this.port?.readable) {
      this.reader = this.port.readable.getReader();
      try {
        for (;;) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) onData(dec.decode(value));
        }
      } catch { break; } finally { this.reader.releaseLock(); }
    }
  }

  async send(text: string) {
    if (!this.port?.writable) throw new Error("Not connected");
    const w = this.port.writable.getWriter();
    await w.write(new TextEncoder().encode(text));
    w.releaseLock();
  }

  async disconnect() {
    try { await this.reader?.cancel(); } catch { /* ignore */ }
    try { await this.port?.close(); } catch { /* ignore */ }
    this.port = null;
  }
}
