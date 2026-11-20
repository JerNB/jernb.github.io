# T005 — Third-batch ink assets

Agent: codex. Source brief: PR #4, head `1effc44b1e2f8034e4fbcd19f3b703842f1592bc`, `PROMPTS.md` third batch F–K.

## Delivered

All 30 requested assets are separate opaque RGB WebP files in this directory. Existing 21 assets, `manifest.json`, page runtime, painters and rendered scene tiles are unchanged by T005.

- F: pig-pen, village-shrine, shuangshui-village, sea-sun, kafka-library, tahiti-hut, algiers-beach, sahara-camp.
- G: far-ridge-soft, far-ridge-steep, far-ridge-loess, cloud-sea, mist-band, geese-flock, foreground-rocks, foreground-reeds, foreground-branch.
- H: dusk-mountain, dawn-mountain, night-clouds, snow-veil.
- I: moon-night, sun-desert, moon-pale.
- J: river-boats, road-travellers, ox-cart.
- K: brocade-tile, scholar-window, study-objects.

## Provenance and finishing

Every subject was generated with the built-in image_gen tool, one call per requested asset. No CLI/API fallback and no custom drawing substituted for generation. Four first versions were discarded for unwanted content: two daytime discs with extra buildings, an unwanted temple in the dusk mountain, and a clipped distant backdrop beside the library.

`batch3-prompts.json` contains every final prompt, native source path, target size and revision note. Original PNGs remain in the recorded Codex generated_images directory. Every final requested deliverable is saved in this workspace, rather than being referenced only at its generated source location.

`batch3-export.py` performs the authorized crop/resize and palette finishing. It measures blank-paper colour drift, maps the day art onto the specified kraft/ink/allowed-accent palette, preserves the specified black/light palette for the two night elements, preserves aspect ratio and fits complete artwork into the required bounds. It flattens the required borders precisely to RGB (179,169,148), or (0,0,0) for night. The woven brocade preserves its generated textile colours and fills all four edges.

Lossless WebP encoding deliberately preserves exact flat backgrounds; quality=90 controls lossless encoding effort rather than lossy quality. Source dimensions are recorded honestly: final 4500px-wide files are resized exports, not claims of native 4500px generation. Native source detail is sufficient for the intended handscroll slots but should be reviewed on integration.

Reproduce exports with:

```text
python images/reading/props/batch3-export.py
```

The script uses Pillow and NumPy and needs the recorded original source PNGs. They were available locally; do not add these libraries to the browser site's dependencies. To regenerate selected outputs, append their asset names as positional arguments.

## Checks

- 30/30 exports decode successfully as opaque RGB at their requested dimensions.
- Every non-exempt outer 12% band is exactly the requested flat background. Foreground bottom edges, dusk's right edge and dawn's left edge are deliberate exceptions. Brocade fills all four edges.
- Measured final-pixel remote ink density respects 35%, or 30% for loess, and 20% for mist (integer rounding tolerance recorded). Final-pixel clamping removes resampling overshoot.
- SHA-256 and per-file checks are in `batch3-checks.json`; all independent validation failures are empty. Total WebP bytes: 7,469,910.
- Visual inspection: generated images individually; `batch3-contact.jpg`; actual slot sizes (export /5) in `batch3-actual-size.jpg` and `batch3-detail-preview.jpg`; and the 3×3 repeat in `batch3-brocade-repeat.jpg`.
- Brocade was visually reviewed in repetition; its woven texture is not claimed to have numerically identical opposite-edge pixels. Wrap deltas are recorded for the reviewer.
- PR #4 full test suite: 71 passed, 0 failed, 0 skipped. Since T005 changes no runtime or manifest, no site re-render was performed.

## Integration for cc

Review these assets before adoption; the author does not self-approve the artwork. Use the T005 asset commit or read its Git objects; coordination stays in the primary repository's shared `.collab/`. The separate bootstrap commit is not an image delivery commit.

Add selected assets to both `PROP_NAMES` and `manifest.json`, wire their slots and appropriate blending, then re-render landscape and portrait. In particular `village-shrine` currently has a painter fallback call but is missing from `PROP_NAMES`; supplying the image alone cannot activate it.

The current PR4 `seatLabel` can move anchors upward when nearby ink is within six pixels. See shared `reviews/T004.md`; cc owns that correction and its regression test. The new pictures are independent of this code fix.

No merge, force push, deployment, source-data sync or real WeRead API call was performed for T005. Unrelated primary-workspace articles and images were preserved.
