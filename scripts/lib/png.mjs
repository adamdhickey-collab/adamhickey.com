/* Enough of a PNG decoder to read a screenshot back as pixels.
 *
 * This exists because the honest way to measure text over a photograph is to
 * look at the pixels behind it -- COLOR.md S5 says so -- and Playwright hands
 * back a PNG. There is no package.json here and the check scripts are the only
 * thing that would want one, so a decoder that needs nothing but node:zlib is
 * cheaper than a dependency.
 *
 * It handles exactly what Chromium emits for a screenshot: 8 bits per channel,
 * colour type 2 or 6, no interlacing. Anything else throws rather than guesses,
 * because a decoder that silently mangles a channel would produce contrast
 * numbers that look plausible and are wrong -- and a wrong number that clears
 * the floor is worse than no number at all.
 */
import zlib from 'node:zlib';

const SIG = [137, 80, 78, 71, 13, 10, 26, 10];

export function decodePNG(buf) {
  for (let i = 0; i < SIG.length; i++) {
    if (buf[i] !== SIG[i]) throw new Error('not a PNG');
  }
  let pos = 8, width = 0, height = 0, depth = 0, colour = -1, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      depth = body[8]; colour = body[9]; interlace = body[12];
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;                     // length + type + data + CRC
  }
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`);
  if (colour !== 2 && colour !== 6) throw new Error(`unsupported colour type ${colour}`);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');

  const channels = colour === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  /* Undo the per-scanline filters. Each row is prefixed with its filter type
     and is defined against the row above, so this has to run in order. */
  for (let y = 0; y < height; y++) {
    const type = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;         // left
      const b = prev ? prev[x] : 0;                            // above
      const c = prev && x >= channels ? prev[x - channels] : 0; // upper-left
      let v = line[x];
      if (type === 1) v += a;
      else if (type === 2) v += b;
      else if (type === 3) v += (a + b) >> 1;
      else if (type === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      } else if (type !== 0) throw new Error(`unknown filter ${type} on row ${y}`);
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

/* Every pixel, as {r,g,b}. Screenshots are opaque, so alpha is ignored. */
export function* pixels({ width, height, channels, data }) {
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    yield { r: data[o], g: data[o + 1], b: data[o + 2] };
  }
}
