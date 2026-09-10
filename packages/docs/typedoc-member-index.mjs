// Typedoc theme & router overrides

import {
  MarkdownTheme,
  MarkdownThemeContext,
  MemberRouter,
} from 'typedoc-plugin-markdown';
import { ReflectionKind } from 'typedoc';

/** Sections that get an index table, in the order the tables appear. */
const INDEXED_SECTIONS = ['Properties', 'Methods'];

/**
 * Lowercases the first letter, leaving text that opens with an acronym (JSON,
 * SVG, DOM) alone.
 */
function decapitalize(text) {
  return /^[A-Z](?![A-Z])/.test(text)
    ? text[0].toLowerCase() + text.slice(1)
    : text;
}

/**
 * Adds Properties and Methods index tables to each generated reference page.
 *
 * This needs a custom theme because the plugin will only insert an index if we
 * make every child have its own document, and we'd rather keep them all on the
 * same page but still have an index.
 */
class MemberIndexContext extends MarkdownThemeContext {
  constructor(theme, page, options) {
    super(theme, page, options);
    const base = { ...this.partials };
    const baseHelpers = { ...this.helpers };

    this.helpers = {
      ...baseHelpers,
      // Fall back to @returns text for index tables, if there is no description
      getDescriptionForComment: (comment) => {
        const description = baseHelpers.getDescriptionForComment(comment);
        if (description) return description;

        const returns = comment?.getTag('@returns');
        if (!returns) return null;

        const text = baseHelpers
          .getCommentParts(returns.content)
          .replace(/\r?\n/g, ' ')
          .trim();

        return text ? `Returns ${decapitalize(text)}` : null;
      },
    };

    this.partials = {
      ...base,
      body: (model, opts) => {
        // Override the default body partial to add index tables
        const blocks = this.indexTables(model.groups ?? [], opts.headingLevel);
        blocks.push(base.body(model, opts));
        return blocks.join('\n\n');
      },
    };
  }

  /**
   * A heading and a table for each of INDEXED_SECTIONS, as separate markdown
   * blocks. Empty when there is nothing to index.
   */
  indexTables(allGroups, headingLevel) {
    const blocks = [];

    for (const title of INDEXED_SECTIONS) {
      const group = allGroups.find((g) => g.title === title);

      if (!group) continue;
      if (this.isOwnPages(group)) continue;

      // "Properties index" not "Properties", so the slug doesn't collide
      blocks.push(`${'#'.repeat(headingLevel)} ${title} index`);
      blocks.push(this.partials.groupIndex(group));
    }

    return blocks;
  }

  isOwnPages(group) {
    return group.children.every((child) => this.router.hasOwnDocument(child));
  }
}

class MemberIndexTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new MemberIndexContext(this, page, this.application.options);
  }
}

/**
 * Overrides the default namespace directory structure to ensure that TypeDoc
 * does not prepend 'blockly' to namespace URLs
 */
class NamespaceDirRouter extends MemberRouter {
  getNamespaceDirectory(reflection) {
    if (reflection.parent?.kind !== ReflectionKind.Project) {
      return super.getNamespaceDirectory(reflection);
    }
    return `${this.directories.get(reflection.kind)}/${this.getReflectionAlias(reflection)}`;
  }
}

// The markdown plugin's locale files. Needed to register translations due to
// https://github.com/typedoc2md/typedoc-plugin-markdown/issues/900.
// Remove once that issue is fixed.
const pluginLocales = await import(
  new URL(
    './internationalization/locales/index.js',
    import.meta.resolve('typedoc-plugin-markdown'),
  )
);
// Remove once
// https://github.com/typedoc2md/typedoc-plugin-markdown/issues/900 is fixed.
function registerPluginTranslations(app) {
  const lang = app.options.getValue('lang');
  app.internationalization.addTranslations(lang, {
    ...pluginLocales.en,
    ...pluginLocales[lang],
  });
}

export function load(app) {
  registerPluginTranslations(app);
  app.renderer.defineTheme('member-index', MemberIndexTheme);
  app.renderer.defineRouter('namespace-dirs', NamespaceDirRouter);
}
