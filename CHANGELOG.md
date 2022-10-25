# Changelog

## [9.0.0](https://github.com/google/blockly/compare/blockly-v8.0.0...blockly-v9.0.0) (2022-10-25)


### ⚠ BREAKING CHANGES

* v9.0.0
* Update deprecations for the new release. (#6470)
* remove unused functions in style.ts (#6386)
* Removed backwards compatibility for getDeveloperVars(). (#6385)
* remove checks for IE and EdgeHTML in core (#6336)
* allow blocks to receive their own delete events (#6337)
* **build:** compile to ES2015 instead of ES5 (#6335)
* Move backwards-compatibility hacks to main.js (#6260)
* Remove remaining use of `goog.module.declareLegacyNamespace`. (#6254)
* properly add the removal of utils.global to the renamings file. (#6204)
* fix or silence type errors (#6105)

### Features

* add basic observable implementations of procedure interfaces ([#6489](https://github.com/google/blockly/issues/6489)) ([a7247af](https://github.com/google/blockly/commit/a7247af7c3e2a32b037079d01a5a01524c79b0db))
* add interface definitions for procedure stuff ([#6488](https://github.com/google/blockly/issues/6488)) ([1162a66](https://github.com/google/blockly/commit/1162a660a0cfe9ff2acdbed5ee66246d3bd5beb2))
* Add margin around zoomToFit ([#6042](https://github.com/google/blockly/issues/6042)) ([a202558](https://github.com/google/blockly/commit/a202558950ce9b06825447ec79bbe9960f451715))
* allow blocks to receive their own delete events ([#6337](https://github.com/google/blockly/issues/6337)) ([e9920a5](https://github.com/google/blockly/commit/e9920a54e0b55fc654156b3765eb5a545d1804ab))
* **build:** Support TypeScript in `core/` ([#6220](https://github.com/google/blockly/issues/6220)) ([4070ffc](https://github.com/google/blockly/commit/4070ffc419baca9907c671a9190ce93b2e5e3b63))
* creates a new way to add shortcut key mappings ([#6122](https://github.com/google/blockly/issues/6122)) ([adb5ad1](https://github.com/google/blockly/commit/adb5ad1f3f350db5ae56404408b402376f1d94e5))
* make isMutator public ([#6316](https://github.com/google/blockly/issues/6316)) ([8f4b49a](https://github.com/google/blockly/commit/8f4b49a7717a1ba20edad0a446d122ada7fbaa82))
* return element from menu.render ([#6426](https://github.com/google/blockly/issues/6426)) ([e3fa43d](https://github.com/google/blockly/commit/e3fa43d8612566b9e7390b622198d5ee1423f069))
* trigger updates to IProcedureBlock blocks ([#6570](https://github.com/google/blockly/issues/6570)) ([c9ced48](https://github.com/google/blockly/commit/c9ced48de227f6fa3ccf9060fefd559a7656f42d))
* updates accessors for getMainWorkspace and getSelected ([#6313](https://github.com/google/blockly/issues/6313)) ([fd127f6](https://github.com/google/blockly/commit/fd127f6b6093b8547a7ba703c44c917624f078da))


### Bug Fixes

* `//` isn't a legal comment in CSS ([#6467](https://github.com/google/blockly/issues/6467)) ([84f6dfe](https://github.com/google/blockly/commit/84f6dfef4fe9b0c6a89794f2b97c0cfa7c4b411d))
* add compose and decompose to block ([#6102](https://github.com/google/blockly/issues/6102)) ([619ee66](https://github.com/google/blockly/commit/619ee66b23967b26b5a25225a640be7915a741c7))
* add timeouts to delay expensive mutation operations ([#6149](https://github.com/google/blockly/issues/6149)) ([91b570a](https://github.com/google/blockly/commit/91b570ace55d610a63d7e5a3f30b6fc0dfc56630))
* adding and removing css classes that contained spaces ([#6455](https://github.com/google/blockly/issues/6455)) ([8530e6d](https://github.com/google/blockly/commit/8530e6d537e88c1f7b6b66d588edf5f23256e59e))
* **build:** Fix sourcemaps ([#6352](https://github.com/google/blockly/issues/6352)) ([e10bf99](https://github.com/google/blockly/commit/e10bf9993680fb634d81704c9f324186f28e8304))
* **build:** Have prepare task signal async completion ([#6356](https://github.com/google/blockly/issues/6356)) ([079699b](https://github.com/google/blockly/commit/079699baff64a4212627cd7aeed019aefe54cb9e))
* bump version to 8.0.2 ([5620515](https://github.com/google/blockly/commit/5620515ad6a3fe361e1c85ca699a507f6f743902))
* Check for empty array in thrasos.RenderInfo.addElemSpacing_ ([#6211](https://github.com/google/blockly/issues/6211)) ([16b5ccd](https://github.com/google/blockly/commit/16b5ccd2eaed64ddf6da170b4398e79ef1ac3120))
* checkin built files ([f21b9db](https://github.com/google/blockly/commit/f21b9dbbf9edf07dad3f7a8c3a4e07b8d6a27985))
* component id should be on the prototype ([#6104](https://github.com/google/blockly/issues/6104)) ([172a8ce](https://github.com/google/blockly/commit/172a8ce2127e3e945e2243c765b261e382691580))
* Connections can be highlighted multiple times ([#6502](https://github.com/google/blockly/issues/6502)) ([581e8ac](https://github.com/google/blockly/commit/581e8acf4bba46ddcdd5f9f4eb19021396815d1e))
* context menu not working ([#6399](https://github.com/google/blockly/issues/6399)) ([79051a6](https://github.com/google/blockly/commit/79051a69dbd622500c32e649bfd0e93da5d7185a))
* Deep copy options used by dropdown fields ([#6425](https://github.com/google/blockly/issues/6425)) ([05b221b](https://github.com/google/blockly/commit/05b221b1d619e6bb9c5abb1f432284dc1246bcd9))
* deprecate functions in object.ts ([#6387](https://github.com/google/blockly/issues/6387)) ([9775b51](https://github.com/google/blockly/commit/9775b5138b40048785a590553176db007c9369e1))
* disposing of a workspace that has overwritten shadows ([#6424](https://github.com/google/blockly/issues/6424)) ([f2e408b](https://github.com/google/blockly/commit/f2e408b6fa6178b248729f5fb917195680eaf588))
* Don't warn if field is acually 0 width ([#6558](https://github.com/google/blockly/issues/6558)) ([321f619](https://github.com/google/blockly/commit/321f619e28f24d644ca11a503ba25ba112d5aefc))
* dragging fails for collapsed blocks with Icons, which have been … ([#6081](https://github.com/google/blockly/issues/6081)) ([f5206d4](https://github.com/google/blockly/commit/f5206d4565b7e68133387287e543b317343239dc))
* dragging fails for collapsed blocks with Icons, which have been … ([#6081](https://github.com/google/blockly/issues/6081)) ([5240301](https://github.com/google/blockly/commit/5240301611b51801d20d30b61cba69ef7bc08e8f))
* feedback on procedure model implementations ([#6560](https://github.com/google/blockly/issues/6560)) ([41db0c5](https://github.com/google/blockly/commit/41db0c5fb00d557412f04bc37e3d5c9797c29727))
* field defaults not being defined correctly ([#6453](https://github.com/google/blockly/issues/6453)) ([eb1b786](https://github.com/google/blockly/commit/eb1b78663c38d5c4e9f8c074d520ba072391bc36))
* fix block factory in manual mode ([#6533](https://github.com/google/blockly/issues/6533)) ([a64d6e9](https://github.com/google/blockly/commit/a64d6e91a038f34eb89bac7f0f2bdb5c5472d34e))
* Fix blocks with mutators. ([#6440](https://github.com/google/blockly/issues/6440)) ([ab03c65](https://github.com/google/blockly/commit/ab03c65f9f6f47b7f76a1cb6fa3dcff70bf14ca5))
* Fix compilation errors under Closure's strict mode ([#6073](https://github.com/google/blockly/issues/6073)) ([edc2a5c](https://github.com/google/blockly/commit/edc2a5cd0c717e521e8f98b2a3fb6bde061da241))
* Fix errors in TS declarations with blocks and generators ([#6200](https://github.com/google/blockly/issues/6200)) ([d61f4ca](https://github.com/google/blockly/commit/d61f4cad8dffd29293a907fbb68c33dd5108bd64))
* fix message loading by removing vestgial dependency ([#6219](https://github.com/google/blockly/issues/6219)) ([c0f81c2](https://github.com/google/blockly/commit/c0f81c200743ff27f9ec86bcf42f80a1ef415bbf))
* fix message loading from script tags ([#6060](https://github.com/google/blockly/issues/6060)) ([44edbb8](https://github.com/google/blockly/commit/44edbb89c35e4d24144333bf504bf045fa639cce))
* fix or silence type errors ([#6105](https://github.com/google/blockly/issues/6105)) ([daf78af](https://github.com/google/blockly/commit/daf78af13e5ce7cebefd0e7596f63e8644c324ba))
* fix pinch to zoom ([#6544](https://github.com/google/blockly/issues/6544)) ([5cdcd02](https://github.com/google/blockly/commit/5cdcd02580316c68cc35b4ff970be40221c704cd))
* fix pinch to zoom ([#6544](https://github.com/google/blockly/issues/6544)) ([caf91c8](https://github.com/google/blockly/commit/caf91c82a6334c566024c079ea57471c03045942))
* generator type declarations ([#6412](https://github.com/google/blockly/issues/6412)) ([b2fa356](https://github.com/google/blockly/commit/b2fa356c60fdf397d839fe2097251d65ac70268b))
* improve types in touch code ([#6099](https://github.com/google/blockly/issues/6099)) ([7c7cfbe](https://github.com/google/blockly/commit/7c7cfbea63b6cc4a0f5d93687ef56c0686a3b1f2))
* Increases the  speed of deleting blocks ([#6128](https://github.com/google/blockly/issues/6128)) ([71e8356](https://github.com/google/blockly/commit/71e835672703237deb0d1adf2d551cc9b114f443))
* inject function options dictionary has wrong type definition ([#6231](https://github.com/google/blockly/issues/6231)) ([233cce8](https://github.com/google/blockly/commit/233cce888391974375cde14af13d6023512cdbba))
* JSON deserialization fails (bug [#6091](https://github.com/google/blockly/issues/6091)) (collapsed procedure call… ([#6103](https://github.com/google/blockly/issues/6103)) ([75a071e](https://github.com/google/blockly/commit/75a071e5a9d5aa12983c2fe0a05c38f1178dae22))
* JSON deserialization fails (bug [#6091](https://github.com/google/blockly/issues/6091)) (collapsed procedure call… ([#6103](https://github.com/google/blockly/issues/6103)) ([45c36f8](https://github.com/google/blockly/commit/45c36f898202ab850d973d0f4147e15b6782d358))
* json hooks for lists blocks not needing extra state ([#6177](https://github.com/google/blockly/issues/6177)) ([8b69b61](https://github.com/google/blockly/commit/8b69b61c566d3c96e44761ca19d60cfb467d6a4b))
* json serialize lists_getIndex with json extraState ([#6136](https://github.com/google/blockly/issues/6136)) ([#6170](https://github.com/google/blockly/issues/6170)) ([0afff23](https://github.com/google/blockly/commit/0afff23d49dcdd29db6a42f9b0e16afeb4b2c43d))
* loading messages from script tags. ([#6184](https://github.com/google/blockly/issues/6184)) ([188ba98](https://github.com/google/blockly/commit/188ba985ccd413c8b8f969c2fcb43f5af181d507))
* loading messages from script tags. ([#6184](https://github.com/google/blockly/issues/6184)) ([2a7d6b0](https://github.com/google/blockly/commit/2a7d6b08b585d4a6553565920785b7e8225607f5))
* Made workspace non-nullable. ([#6300](https://github.com/google/blockly/issues/6300)) ([83a3e74](https://github.com/google/blockly/commit/83a3e74ec95c5c6ff18a575e5b653d6535d78244))
* make eventUtils throw if event type not registered ([#6381](https://github.com/google/blockly/issues/6381)) ([60bc01a](https://github.com/google/blockly/commit/60bc01acc8fb8cb38b6ca284a53b36137f250696))
* Make generator types and BlockDefinition less restrictive ([#6185](https://github.com/google/blockly/issues/6185)) ([2ff4f88](https://github.com/google/blockly/commit/2ff4f88f244a4a8670f5c87da1f087a0eaee7a2c))
* make getSourceBlock nullable again ([#6542](https://github.com/google/blockly/issues/6542)) ([5f42361](https://github.com/google/blockly/commit/5f42361fcfc1abfc640f9cdcd728f1c366fa8e3b))
* make getSourceBlock nullable again ([#6542](https://github.com/google/blockly/issues/6542)) ([df660af](https://github.com/google/blockly/commit/df660af66ca62dcbe44560c05156160c4d91445b))
* Make message files work in unpackaged mode, and rebuild msg files ([c3af8de](https://github.com/google/blockly/commit/c3af8deef3d61123dac2f50633bc2bcf01e0b8a6))
* Make message files work in unpackaged mode, and rebuild msg files ([4b1bb8c](https://github.com/google/blockly/commit/4b1bb8c7b6f540fa2948b072984ad32935f7d1fe))
* message types being incorrect ([#6414](https://github.com/google/blockly/issues/6414)) ([9c81e75](https://github.com/google/blockly/commit/9c81e7591addff9e0740031086c2c807c098cbff))
* Modifying size update handling for multiline field in parent block. ([#6461](https://github.com/google/blockly/issues/6461)) ([2a2cbb4](https://github.com/google/blockly/commit/2a2cbb4722c5e12a956c7412d6b5f02402282980))
* Move backwards-compatibility hacks to main.js ([#6260](https://github.com/google/blockly/issues/6260)) ([aaafbc2](https://github.com/google/blockly/commit/aaafbc2b6f9b4786db58e831919fad59a2a61dd8))
* move Theme to use a Partial type for BlockStyle ([#6532](https://github.com/google/blockly/issues/6532)) ([ca3b9bd](https://github.com/google/blockly/commit/ca3b9bd079316b6785873a0c51afcc4e9200ef29))
* mutators disconnecting from children instead of moving them ([#6047](https://github.com/google/blockly/issues/6047)) ([493444c](https://github.com/google/blockly/commit/493444c687eb01d2bd3d8064f23e66d1879c053c))
* options parser should add trailing slash to 'media' if not present. ([#6263](https://github.com/google/blockly/issues/6263)) ([#6264](https://github.com/google/blockly/issues/6264)) ([bf1a40c](https://github.com/google/blockly/commit/bf1a40c36bad8ada4a69d5ef304a68ed3da2694a))
* packaging .d.ts files ([#6327](https://github.com/google/blockly/issues/6327)) ([c8dd01a](https://github.com/google/blockly/commit/c8dd01ac87145a6979e93f42738866b5c034331c))
* parent blocks not bumping neighbours ([#6538](https://github.com/google/blockly/issues/6538)) ([7147813](https://github.com/google/blockly/commit/7147813693b5187d257c72800e9ee6b430d6f938))
* path object not checking theme props ([#6451](https://github.com/google/blockly/issues/6451)) ([893787b](https://github.com/google/blockly/commit/893787b2853b144956387ab53b206b43b93f5dbc))
* provide initial values to reduce functions in generated js ([#6178](https://github.com/google/blockly/issues/6178)) ([706c2bf](https://github.com/google/blockly/commit/706c2bfd41088fdca783f2fc1f152453f91fc784))
* refactors concrete implementations of the procedure data models ([#6575](https://github.com/google/blockly/issues/6575)) ([fed57f2](https://github.com/google/blockly/commit/fed57f24b7d6b4dec7bb834a7f13cb8e58733ca6))
* remove calls to removeClass and hasClass ([#6413](https://github.com/google/blockly/issues/6413)) ([5f11f34](https://github.com/google/blockly/commit/5f11f3449f0f855a4467c6312fe25b5cc78c6b9e))
* remove checks for IE and EdgeHTML in core ([#6336](https://github.com/google/blockly/issues/6336)) ([ffe6d55](https://github.com/google/blockly/commit/ffe6d55d5f6a34a3bb22438804e694995e5d38e3))
* remove deprecated use of objectUtils from generators ([#6499](https://github.com/google/blockly/issues/6499)) ([224af0a](https://github.com/google/blockly/commit/224af0aa6bb17b3b6e2c7cc7c01daae75ccc7122))
* Remove float() coercion in Python loops ([#6259](https://github.com/google/blockly/issues/6259)) ([5612e13](https://github.com/google/blockly/commit/5612e13824dae09018b61466141b4b5f380c107f))
* remove some IE-specific code in dom and style ([#6396](https://github.com/google/blockly/issues/6396)) ([a785ab8](https://github.com/google/blockly/commit/a785ab8d9cceb165e39b1037331e820a7322ce94))
* remove unused functions in style.ts ([#6386](https://github.com/google/blockly/issues/6386)) ([856e74d](https://github.com/google/blockly/commit/856e74d9cf49fe1e6c6a7813f4ba80713a07a93c))
* remove unused or obsolete useragent checks ([#6355](https://github.com/google/blockly/issues/6355)) ([aff21b9](https://github.com/google/blockly/commit/aff21b936c8d48fb271cbc087a8e88c82bfedfbf))
* remove vestigial dependency ([#6219](https://github.com/google/blockly/issues/6219)) ([334956b](https://github.com/google/blockly/commit/334956be9b0ee11f57e38fcac3d55c9237727ead))
* replace `object.mixin` with `Object.assign` ([#6138](https://github.com/google/blockly/issues/6138)) ([df41c23](https://github.com/google/blockly/commit/df41c234b73982045423b448d0a97f0f7a1ba164))
* reuse the 'bumpObjects' module in inject.js ([#6121](https://github.com/google/blockly/issues/6121)) ([df8349c](https://github.com/google/blockly/commit/df8349c6709d043c1806ef87b8867dbfc9ee05be))
* Silence Closure errors when modifying tooltips. ([#6098](https://github.com/google/blockly/issues/6098)) ([29b6b87](https://github.com/google/blockly/commit/29b6b878dc621acd6e11c34aec2e3bce25bb2508))
* some AnyDuringMigration ([#6430](https://github.com/google/blockly/issues/6430)) ([c2cbed1](https://github.com/google/blockly/commit/c2cbed1146bab6ff546764146125cf2d2d3fe2db))
* stop using `is3dSupported` ([#6400](https://github.com/google/blockly/issues/6400)) ([55ea12b](https://github.com/google/blockly/commit/55ea12bd2183bef61059d9554e57ff2fb7744681))
* **tests:** Fix race condition causing flakiness in PHP generator test ([#6213](https://github.com/google/blockly/issues/6213)) ([d7ab815](https://github.com/google/blockly/commit/d7ab81504c2fac2d446fd84db084a77d1203bd18))
* **tests:** revert change in marker_svg to keep keyboard nav tests working ([#6457](https://github.com/google/blockly/issues/6457)) ([dd0d0f6](https://github.com/google/blockly/commit/dd0d0f6bcffe6939bd1f78cdea871c6b52b9c9ab))
* theme types ([#6423](https://github.com/google/blockly/issues/6423)) ([abad51f](https://github.com/google/blockly/commit/abad51fdb03f0bde4a0290796f4efc6cdc29cf94))
* Theme.name does not match registered name ([#6186](https://github.com/google/blockly/issues/6186)) ([#6226](https://github.com/google/blockly/issues/6226)) ([9797943](https://github.com/google/blockly/commit/9797943938583afb6c787ad59d9ae79be73346fe))
* TS errors on dependent projects with certain tsconfig settings ([#6360](https://github.com/google/blockly/issues/6360)) ([#6361](https://github.com/google/blockly/issues/6361)) ([e58cf77](https://github.com/google/blockly/commit/e58cf77b7f9f4f65e2f5fda72f5ca5a3f888d74b))
* type error in uneditable bubbles ([#6092](https://github.com/google/blockly/issues/6092)) ([7353c61](https://github.com/google/blockly/commit/7353c61b2b7ee3b5e6b60b061e1414f29f01f596))
* update a moved function in developer tools so it loads ([#6500](https://github.com/google/blockly/issues/6500)) ([ce3ec78](https://github.com/google/blockly/commit/ce3ec78501a900959c8cc850f0bc5f0642d4e4cc))
* Update deprecations for the new release. ([#6470](https://github.com/google/blockly/issues/6470)) ([d3447ea](https://github.com/google/blockly/commit/d3447ea5653a21cf0b33cd4cef44ea3168f0ed20))
* update extraState property in serializer typedefs ([#6057](https://github.com/google/blockly/issues/6057)) ([55cae6e](https://github.com/google/blockly/commit/55cae6ec857a5ead1cd5306095fbbe876d2618af))
* update package files ([b5c4494](https://github.com/google/blockly/commit/b5c4494e6ad7a3a35ba5147cb69954f6580a678c))
* update prettify url ([#6459](https://github.com/google/blockly/issues/6459)) ([852e48a](https://github.com/google/blockly/commit/852e48a74bab628d61a1bdfde71ec3a13c2099d4))
* Update readme and remove travis build badge ([e65835c](https://github.com/google/blockly/commit/e65835ca3240f9c4b29e24863999a32631ecac31))
* Update typescript definition files for core, blocks, and generators ([#6174](https://github.com/google/blockly/issues/6174)) ([87aa4c0](https://github.com/google/blockly/commit/87aa4c0f625e3a2c99c149c6095f32c20116de7c))
* update versions ([c137801](https://github.com/google/blockly/commit/c137801d6cdef0cc15dbed28a742c8090b580d6e))


### Reverts

* "chore: remove unused import" ([02089ae](https://github.com/google/blockly/commit/02089aee497d573a00c32ed1dccbe01561ccf24d))
* "chore: remove unused import" ([02089ae](https://github.com/google/blockly/commit/02089aee497d573a00c32ed1dccbe01561ccf24d))


### Miscellaneous Chores

* **build:** compile to ES2015 instead of ES5 ([#6335](https://github.com/google/blockly/issues/6335)) ([f032151](https://github.com/google/blockly/commit/f032151cd9c7138fde29d1ca308a714322d751ef))
* properly add the removal of utils.global to the renamings file. ([#6204](https://github.com/google/blockly/issues/6204)) ([2f734f7](https://github.com/google/blockly/commit/2f734f7f17879296188c542d4a06f01902cde53a))


### Code Refactoring

* Remove remaining use of `goog.module.declareLegacyNamespace`. ([#6254](https://github.com/google/blockly/issues/6254)) ([f947b3f](https://github.com/google/blockly/commit/f947b3f4f669660faf46dd82c374e893b7f9acce))
* Removed backwards compatibility for getDeveloperVars(). ([#6385](https://github.com/google/blockly/issues/6385)) ([3bc42c5](https://github.com/google/blockly/commit/3bc42c5c3f04ae1c1c2a0e1d08c9e3a4a188a8ec))


### release

* v9.0.0 ([55cf92a](https://github.com/google/blockly/commit/55cf92a2d0845e8f9c2bdb0c78958c2d532a907e))

## [8.0.0](https://github.com/google/blockly/compare/blockly-v7.20211209.0...blockly-v8.0.0) (2022-03-31)


### ⚠ BREAKING CHANGES

* change paste to return the pasted thing to support keyboard nav (#5996)
* **blocks:** ...and rename Blockly.blocks.all (blocks/all.js) to Blockly.libraryBlocks (blocks/blocks.js
* * refactor(blocks): Make loopTypes a Set
* allows previously internal constants to be configurable (#5897)
* * refactor(blocks): Make loopTypes a Set
* remove unused constants from internalConstants (#5889)

### Features

* add mocha failure messages to console output ([#5984](https://github.com/google/blockly/issues/5984)) ([7d250fa](https://github.com/google/blockly/commit/7d250fa9cfb30f95e7af523720b66c8b001df15c))
* Allow developers to set a custom tooltip rendering function. ([#5956](https://github.com/google/blockly/issues/5956)) ([6841ccc](https://github.com/google/blockly/commit/6841ccc99fdbcc5f6d5a63bb36cb3b6ebd2be246))
* **blocks:** Export block definitions ([#5908](https://github.com/google/blockly/issues/5908)) ([ffb8907](https://github.com/google/blockly/commit/ffb8907db8d0f11609c1fe14b2a450d3e639a871))
* make mocha fail if it encounters 0 tests ([#5981](https://github.com/google/blockly/issues/5981)) ([0b2bf3a](https://github.com/google/blockly/commit/0b2bf3ae9d0c777f4d13d47692f5ae224dff1ec8))
* **tests:** Add a test to validate `scripts/migration/renamings.js` ([#5980](https://github.com/google/blockly/issues/5980)) ([3c723f0](https://github.com/google/blockly/commit/3c723f0199b1f3b5eaac58f064b02d52b60d0ddb))
* **tests:** Use official semver.org RegExp ([#5990](https://github.com/google/blockly/issues/5990)) ([afc4088](https://github.com/google/blockly/commit/afc4088ce278f97585f9ff5e65a921f7c4c65531))


### Bug Fixes

* Adds check for changedTouches ([#5869](https://github.com/google/blockly/issues/5869)) ([3f4f505](https://github.com/google/blockly/commit/3f4f5057919fdb4a329e9d2b15378c5c5831ae3b))
* advanced playground and playground to work when hosted  ([#6021](https://github.com/google/blockly/issues/6021)) ([364bf14](https://github.com/google/blockly/commit/364bf14ce6932f426591e3f53c1d066771ddcb8e))
* always rename caller to legal name ([#6014](https://github.com/google/blockly/issues/6014)) ([c430800](https://github.com/google/blockly/commit/c4308007bc4b58d51adf1fda7b51ffa9f1d3f093))
* **blocks:** correct the callType_ of procedures_defreturn ([#5974](https://github.com/google/blockly/issues/5974)) ([b34db5b](https://github.com/google/blockly/commit/b34db5bd01f7b532ebabc80264ca9fc804a76c75))
* **build:** Correctly handle deep export paths in UMD wrapper ([#5945](https://github.com/google/blockly/issues/5945)) ([71ab146](https://github.com/google/blockly/commit/71ab146bc21aef9bdd6b2385c1df5f51e3ff5b58))
* bumping a block after duplicate breaking undo ([#5844](https://github.com/google/blockly/issues/5844)) ([5204569](https://github.com/google/blockly/commit/5204569cff58c1ead7c15165a1351fa6a2ba2ad3))
* change getCandidate_ and showInsertionMarker_ to be more dynamic ([#5722](https://github.com/google/blockly/issues/5722)) ([68d8113](https://github.com/google/blockly/commit/68d81132b851d20884ee9da41719fa62cdfce0ee))
* change paste to return the pasted thing to support keyboard nav ([#5996](https://github.com/google/blockly/issues/5996)) ([20f1475](https://github.com/google/blockly/commit/20f1475afc1abf4b5e600219c2981150fc621ba5))
* Change the truthy tests of width and height in WorkspaceSvg.setCachedParentSvgSize to actual comparisons with null so that zero value can be saved into the cache ([#5997](https://github.com/google/blockly/issues/5997)) ([fec44d9](https://github.com/google/blockly/commit/fec44d917e4b8475beba28e4769a50982425e887))
* comments not being restored when dragging ([#6011](https://github.com/google/blockly/issues/6011)) ([85ce3b8](https://github.com/google/blockly/commit/85ce3b82c6c32e8a2a1608c6d604262ea0e5c38d))
* convert the common renderer to an ES6 class ([#5978](https://github.com/google/blockly/issues/5978)) ([c1004be](https://github.com/google/blockly/commit/c1004be1f24debe1df1566e6067cf2f6769d51aa))
* convert the Workspace class to an ES6 class ([#5977](https://github.com/google/blockly/issues/5977)) ([e2eaebe](https://github.com/google/blockly/commit/e2eaebec47b08a83eb36d0d04cefa254d1c5d666))
* custom block context menus ([#5976](https://github.com/google/blockly/issues/5976)) ([8058df2](https://github.com/google/blockly/commit/8058df2a71dcecdc1190ae1d6f5dcccfafc980e8))
* Don't throw if drag surface is empty. ([#5695](https://github.com/google/blockly/issues/5695)) ([769a25f](https://github.com/google/blockly/commit/769a25f4badffd2409ce19535344c98f5d8b01c9))
* export Blockly.Names.NameType and Blockly.Input.Align correctly ([#6030](https://github.com/google/blockly/issues/6030)) ([2c15d00](https://github.com/google/blockly/commit/2c15d002ababcba7f34c526c05f231735e3e0169))
* Export loopTypes from Blockly.blocks.loops ([#5900](https://github.com/google/blockly/issues/5900)) ([4f74210](https://github.com/google/blockly/commit/4f74210e74ef0b06216ab0f288268192674d69c9))
* Export loopTypes from Blockly.blocks.loops ([#5900](https://github.com/google/blockly/issues/5900)) ([74ef1cb](https://github.com/google/blockly/commit/74ef1cbf521f7c6447ea9672ddbfe861d2292e5f))
* Fix bug where workspace comments could not be created. ([#6024](https://github.com/google/blockly/issues/6024)) ([2cf8eb8](https://github.com/google/blockly/commit/2cf8eb87dcb029ba152b63b01ee7e4df431d1bb6))
* Fix downloading screenshots on the playground. ([#6025](https://github.com/google/blockly/issues/6025)) ([ca6e590](https://github.com/google/blockly/commit/ca6e590101d511a8d98a5c5438af32ff6749e020))
* fix keycodes type ([#5805](https://github.com/google/blockly/issues/5805)) ([0a96543](https://github.com/google/blockly/commit/0a96543a1179636e4efeb3c654c075952aca0c9f))
* Fixed the label closure on demo/blockfactory ([#5833](https://github.com/google/blockly/issues/5833)) ([e8ea2e9](https://github.com/google/blockly/commit/e8ea2e9902fb9f642459e7341c3d59e19f359fca))
* **generators:** Fix an operator precedence issue in the math_number_property generators to remove extra parentheses ([#5685](https://github.com/google/blockly/issues/5685)) ([a31003f](https://github.com/google/blockly/commit/a31003fab964e529152389029ec3126a3802851b))
* incorrect module for event data in renamings database ([#6012](https://github.com/google/blockly/issues/6012)) ([e502eaa](https://github.com/google/blockly/commit/e502eaa6e1c88b2bb34e9a87917a15098b81cfa3))
* Move [@alias](https://github.com/alias) onto classes instead of constructors ([#6003](https://github.com/google/blockly/issues/6003)) ([1647a32](https://github.com/google/blockly/commit/1647a3299ac48b5924f987015d8f3c47593922af))
* move test helpers from samples into core ([#5969](https://github.com/google/blockly/issues/5969)) ([2edd228](https://github.com/google/blockly/commit/2edd22811752f05e16c68d593e5d1b809e24ed25))
* move the dropdown div to a namespace instead of a class with only static properties ([#5979](https://github.com/google/blockly/issues/5979)) ([543cb8e](https://github.com/google/blockly/commit/543cb8e1b1c1a7fca5a1629f42f71c9b18e1a255))
* msg imports in type definitions ([#5858](https://github.com/google/blockly/issues/5858)) ([07a75de](https://github.com/google/blockly/commit/07a75dee8de13b6c5a02959325a0155d413d6712))
* opening/closing the mutators ([#6000](https://github.com/google/blockly/issues/6000)) ([243fc52](https://github.com/google/blockly/commit/243fc52a96e1089aad89ff6b642c6605d8f71afd))
* playground access to Blockly ([9e1cda8](https://github.com/google/blockly/commit/9e1cda8f45cea1707c5a228d5ce79b4cd81566f8))
* playground test blocks, text area listeners, and show/hide buttons ([#6015](https://github.com/google/blockly/issues/6015)) ([7abf3de](https://github.com/google/blockly/commit/7abf3de910a35e1a6086a3243570627a41e73339))
* procedure param edits breaking undo ([#5845](https://github.com/google/blockly/issues/5845)) ([8a71f87](https://github.com/google/blockly/commit/8a71f879504503f4aec1140fe653d93602c664df))
* re-expose HSV_VALUE and HSV_SATURATION as settable properties on Blockly ([#5821](https://github.com/google/blockly/issues/5821)) ([0e5f3ce](https://github.com/google/blockly/commit/0e5f3ce6074fbbb2923e9a62bffefeae0a813be8))
* re-expose HSV_VALUE and HSV_SATURATION as settable properties on Blockly ([#5821](https://github.com/google/blockly/issues/5821)) ([6fc3316](https://github.com/google/blockly/commit/6fc3316309534270106050f0e1fecb7a09b8e62c))
* revert "Delete events should animate when played ([#5919](https://github.com/google/blockly/issues/5919))" ([#6031](https://github.com/google/blockly/issues/6031)) ([c4a25eb](https://github.com/google/blockly/commit/c4a25eb3c432b0e8a9a18aae42839d163a177c48))
* revert converting test helpers to es modules ([#5982](https://github.com/google/blockly/issues/5982)) ([01d4597](https://github.com/google/blockly/commit/01d45972d4df8b5e4afa4a19d93defb8961fea57))
* setting null for a font style on a theme ([#5831](https://github.com/google/blockly/issues/5831)) ([835fb02](https://github.com/google/blockly/commit/835fb02343df0a4b9dab7704a4b3d8be8e9a497c))
* **tests:** Enable --debug for test:compile:advanced; fix some errors ([#5959](https://github.com/google/blockly/issues/5959)) ([88334be](https://github.com/google/blockly/commit/88334bea80aa26c08705f16aba5e79dd708158f9))
* **tests:** Enable `--debug` for `test:compile:advanced`; fix some errors (and demote the rest to warnings) ([#5983](https://github.com/google/blockly/issues/5983)) ([e11b583](https://github.com/google/blockly/commit/e11b5834e5e4e8fe991be32afb08eafa7c8adffd))
* TypeScript exporting of the serialization functions ([#5890](https://github.com/google/blockly/issues/5890)) ([5d7c890](https://github.com/google/blockly/commit/5d7c890243ba7d0501514ba48778715097ce5a3b))
* undo/redo for auto disabling if-return blocks ([#6018](https://github.com/google/blockly/issues/6018)) ([c7a359a](https://github.com/google/blockly/commit/c7a359a8424287f139752573a27a8a6eb97cb7b3))
* update the playground to load compressed when hosted ([#5835](https://github.com/google/blockly/issues/5835)) ([2adf326](https://github.com/google/blockly/commit/2adf326c230589800880faa9599eca2ecc94d283))
* Update typings for q1 2022 release ([#6051](https://github.com/google/blockly/issues/6051)) ([69f3d4a](https://github.com/google/blockly/commit/69f3d4ae89ce16a558443dd0a772e35b62c096d3))
* Use correct namespace for svgMath functions ([#5813](https://github.com/google/blockly/issues/5813)) ([b8cc983](https://github.com/google/blockly/commit/b8cc983324338b2cbd536425c93ff3e7d512751e))
* Use correct namespace for svgMath functions ([#5813](https://github.com/google/blockly/issues/5813)) ([025bab6](https://github.com/google/blockly/commit/025bab656669f99ebdb8b95bea39ebae296f1495))


### Code Refactoring

* allows previously internal constants to be configurable ([#5897](https://github.com/google/blockly/issues/5897)) ([4b5733e](https://github.com/google/blockly/commit/4b5733e7c85f2e196719550a3cfdcbcbd61739df))
* **blocks:** Rename Blockly.blocks.* modules to Blockly.libraryBlocks.* ([#5953](https://github.com/google/blockly/issues/5953)) ([5078dcb](https://github.com/google/blockly/commit/5078dcbc6d4d48422313732e87191b29569b5eed))
* remove unused constants from internalConstants ([#5889](https://github.com/google/blockly/issues/5889)) ([f0b1077](https://github.com/google/blockly/commit/f0b10776eb0657a5446adcfc62ad13f419c14271))
