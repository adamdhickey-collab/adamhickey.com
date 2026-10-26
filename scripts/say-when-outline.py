#!/usr/bin/env python3
"""Outline a run of text in Fraunces or Instrument Sans as SVG path data.

The Say When identity (img/say-when/) ships its wordmark and every word on
its packaging as outlines rather than <text>, so the files draw the same in
any viewer and no browser check reads them as text. This is the one step
scripts/say-when.mjs cannot do in node: it instances the variable font at the
brand's cut and walks the glyphs with fontTools.

    python3 scripts/say-when-outline.py <font.ttf> <size> <wght> <SOFT|-> <opsz|-> "text"

Prints one JSON object: {"d": "<path data>", "width": <advance>, "ascender":
..., "descender": ...}, in a y-down coordinate space scaled to <size> px.
Kerning is read from the font's GPOS pair-adjustment table (format 1 pairs
and format 2 classes) so the common pairs sit as the font intends; there is
no shaper here, so no ligatures and no contextual alternates, which the
brand's words do not need. The fonts are fetched from Google Fonts' own
files (see docs/rebrand/asset-manifest.md), and are not committed.
"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

path, size, wght, soft, opsz, text = sys.argv[1:7]
font = TTFont(path)
loc = {'wght': float(wght)}
axes = {a.axisTag for a in font['fvar'].axes} if 'fvar' in font else set()
if soft != '-' and 'SOFT' in axes: loc['SOFT'] = float(soft)
if opsz != '-' and 'opsz' in axes: loc['opsz'] = float(opsz)
if 'fvar' in font:
    loc = {k: v for k, v in loc.items() if k in axes}
    font = instancer.instantiateVariableFont(font, loc)
upem = font['head'].unitsPerEm
scale = float(size) / upem
cmap = font.getBestCmap()
gs = font.getGlyphSet()
hmtx = font['hmtx']

# Kerning from GPOS PairPos, flattened to a dict of (left, right) -> xAdvance.
kern = {}
if 'GPOS' in font:
    gpos = font['GPOS'].table
    for lookup in gpos.LookupList.Lookup:
        subs = lookup.SubTable
        for st in subs:
            if lookup.LookupType == 9:  # extension
                st = st.ExtSubTable
            if getattr(st, 'LookupType', lookup.LookupType) != 2: continue
            if st.Format == 1:
                for i, left in enumerate(st.Coverage.glyphs):
                    for pvr in st.PairSet[i].PairValueRecord:
                        v = pvr.Value1.XAdvance if pvr.Value1 and hasattr(pvr.Value1, 'XAdvance') else 0
                        if v: kern.setdefault((left, pvr.SecondGlyph), v)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs; c2 = st.ClassDef2.classDefs
                cov = set(st.Coverage.glyphs)
                for left in cov:
                    k1 = c1.get(left, 0)
                    for right, k2 in c2.items():
                        rec = st.Class1Record[k1].Class2Record[k2]
                        v = rec.Value1.XAdvance if rec.Value1 and hasattr(rec.Value1, 'XAdvance') else 0
                        if v: kern.setdefault((left, right), v)

glyphs = [cmap.get(ord(ch), '.notdef') for ch in text]
x = 0.0
d = []
for i, g in enumerate(glyphs):
    pen = SVGPathPen(gs, ntos=lambda v: ("%.2f" % v).rstrip("0").rstrip("."))
    tp = TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0))
    gs[g].draw(tp)
    cmd = pen.getCommands()
    if cmd: d.append(cmd)
    adv = hmtx[g][0]
    if i + 1 < len(glyphs):
        adv += kern.get((g, glyphs[i + 1]), 0)
    x += adv
os2 = font['OS/2']
print(json.dumps({'d': ' '.join(d), 'width': x * scale,
                  'ascender': os2.sTypoAscender * scale, 'descender': os2.sTypoDescender * scale,
                  'capHeight': getattr(os2, 'sCapHeight', 700) * scale, 'xHeight': getattr(os2, 'sxHeight', 500) * scale}))
