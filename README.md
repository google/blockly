# BlockThreed 🧱

**BlockThreed is a Scratch-like 3D game engine with block coding, powered by
Three.js.** Kids and beginners snap together blocks; under the hood those blocks
generate real JavaScript that drives a 3D game world.

This repository is currently in **foundation phase**: a slimmed-down fork of
[Blockly](https://github.com/RaspberryPiFoundation/blockly) containing the block
coding elements themselves — the editor core, standard blocks, code generators,
and a curated set of plugins — with everything non-essential removed. The game
engine and the Scratch-like studio site are built on top of this foundation next.

> **Attribution:** Block coding core © Google LLC / Raspberry Pi Foundation,
> licensed under [Apache-2.0](./LICENSE). See
> [Upstream](#upstream-and-divergence) for fork details.

## What's in this repo

| Path                 | Contents                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/blockly/`  | The block coding library: editor core (`core/`), standard blocks (`blocks/`), code generators (`generators/`), translations (`msg/`), and the full unit-test suite |
| `packages/plugins/`  | Curated plugins only: fields, themes, and workspace add-ons useful to a Scratch-like game engine (see below)                                                       |
| `.github/workflows/` | CI: build + test, browser tests, npm publish                                                                                                                       |

### Kept plugins (19)

Build tooling and test fixtures required by core:

- `dev-scripts`, `dev-tools`, `block-test`, `theme-modern`

Game-engine-relevant fields:

- `field-slider` (numeric parameters), `field-colour` (+ `field-grid-dropdown`),
  `field-angle` (rotations), `field-bitmap` (pixel-art textures/sprites)

Game-engine-relevant workspace UX:

- `continuous-toolbox` (Scratch-style scrolling toolbox), `toolbox-search`,
  `workspace-search`, `workspace-backpack` (Scratch-style backpack),
  `workspace-minimap`, `zoom-to-fit`

Themes (also dependencies of the dev playground):

- `theme-dark`, `theme-modern`, `theme-highcontrast`, `theme-deuteranopia`,
  `theme-tritanopia`

### What was removed

- `packages/docs` — the upstream Docusaurus contributor site (36 MB). Upstream
  guides remain available at <https://docs.blockly.com>.
- ~20 unneeded plugins (sample apps, scaffolding generator, migration CLI,
  niche fields/themes, experimental blocks).
- Legacy demo hosting: `packages/blockly/demos/`, `packages/blockly/appengine/`,
  and their gulp tasks, npm scripts, and CI workflows.
- Upstream-only automation: TranslateWiki sync, docs deploy, App Engine deploy,
  reviewer/label bots.

### Deliberately kept as-is (for now)

- The npm package is still named **`blockly`** (and plugins still `@blockly/*`).
  Renaming the published package would churn every import with no engine benefit
  yet. The rename to the BlockThreed scope happens when the engine API
  stabilizes — see the roadmap.
- All five code generators (JavaScript, Python, Dart, Lua, PHP). The engine runs
  on the **JavaScript** generator; the others cost nothing at runtime and may be
  pruned later.
- All 100+ locales. Translation sync is currently frozen (no TranslateWiki).

## Getting started

```bash
npm ci          # install (Node 22+)
npm run build   # build core + all kept plugins

# Core inner loop (from packages/blockly/):
npm run tsc             # typecheck only
npm run test-mocha-node # headless unit tests (fast)
npm start               # dev server + block playground at /tests/playground.html
```

Run `npm run <script> --workspace=<package>` from the root, or `cd` into a
package. See [`AGENTS.md`](./AGENTS.md) for the full command map and
conventions.

## Roadmap to the engine

1. **Foundation** (this phase) — slim fork, verified block coding core. ✅
2. **3D block library** — new `packages/blocks-3d` (or similar): scene, meshes,
   materials, lights, cameras, physics, input, game-loop blocks + a JavaScript
   generator profile targeting the engine runtime.
3. **Engine runtime** — new `packages/engine`: a small Three.js wrapper
   (scene graph, asset loading, game loop, input, audio) with a stable API the
   generated code calls into.
4. **Studio app** — new `apps/studio`: the Scratch-like site. Block editor on
   the left, live 3D viewport on the right, sprite/asset library, project
   save/share.
5. **Rebrand completion** — publish under the BlockThreed npm scope, BlockThreed
   theme + branding, docs site for the engine.

Design constraints inherited from Blockly that we keep: zero runtime
dependencies in the editor core, keyboard + screen-reader accessibility, and
conventional commits.

## Upstream and divergence

- Canonical upstream: [`RaspberryPiFoundation/blockly`](https://github.com/RaspberryPiFoundation/blockly)
  (originally developed at Google — hence `Copyright Google LLC` headers on
  older files; leave those alone).
- This fork tracks upstream `main` loosely. Pull upstream fixes deliberately;
  do not merge upstream blindly — the plugin set, docs, and demos have diverged
  on purpose.
- New files take a BlockThreed copyright header (see [`AGENTS.md`](./AGENTS.md)).

## Contributing

Short version: keep changes small, follow the conventions in [`AGENTS.md`](./AGENTS.md),
and use conventional commits (`feat:`, `fix:`, …). See
[`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md).

## License

Apache-2.0 — see [LICENSE](./LICENSE).
