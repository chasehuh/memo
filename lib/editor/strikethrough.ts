import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import {
  EditorSelection,
  Prec,
  type Extension,
  type TransactionSpec,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { Strikethrough } from "@lezer/markdown";

const MARK = "~~";

/**
 * Toggle GFM `~~strikethrough~~` on every selection range.
 *
 * - Non-empty selection already wrapped (or with markers just outside) → unwrap
 * - Non-empty selection otherwise → wrap
 * - Empty caret → insert `~~~~` with the caret between the marks
 */
export function toggleStrikethrough(view: EditorView): boolean {
  if (view.state.readOnly || view.composing) return false;

  const { state } = view;
  const changes = state.changeByRange((range) => {
    const { from, to } = range;

    if (from === to) {
      return {
        changes: { from, to, insert: `${MARK}${MARK}` },
        range: EditorSelection.cursor(from + MARK.length),
      };
    }

    const selected = state.doc.sliceString(from, to);
    if (
      selected.startsWith(MARK) &&
      selected.endsWith(MARK) &&
      selected.length >= MARK.length * 2
    ) {
      const inner = selected.slice(MARK.length, -MARK.length);
      return {
        changes: { from, to, insert: inner },
        range: EditorSelection.range(from, from + inner.length),
      };
    }

    const before = state.doc.sliceString(Math.max(0, from - MARK.length), from);
    const after = state.doc.sliceString(
      to,
      Math.min(state.doc.length, to + MARK.length),
    );
    if (before === MARK && after === MARK) {
      return {
        changes: [
          { from: to, to: to + MARK.length, insert: "" },
          { from: from - MARK.length, to: from, insert: "" },
        ],
        range: EditorSelection.range(from - MARK.length, to - MARK.length),
      };
    }

    return {
      changes: { from, to, insert: `${MARK}${selected}${MARK}` },
      range: EditorSelection.range(from + MARK.length, to + MARK.length),
    };
  });

  if (changes.changes.empty) return false;

  const spec: TransactionSpec = {
    ...changes,
    scrollIntoView: true,
    userEvent: "input",
  };
  view.dispatch(state.update(spec));
  return true;
}

/** Visual line-through for parsed GFM strikethrough spans. */
export function agentnoteStrikethroughHighlight(): Extension {
  return syntaxHighlighting(
    HighlightStyle.define([
      {
        tag: tags.strikethrough,
        textDecoration: "line-through",
        color: "var(--c-text-muted)",
      },
    ]),
  );
}

/** Parser extension so `~~…~~` is recognized as GFM strikethrough. */
export const agentnoteStrikethroughMarkdown = Strikethrough;

/** ⌘⇧X / Ctrl+Shift+X — Notion/Slack-style strikethrough toggle. */
export function agentnoteStrikethroughKeymap(): Extension {
  return Prec.high(
    keymap.of([
      {
        key: "Shift-Mod-x",
        run: toggleStrikethrough,
        preventDefault: true,
      },
    ]),
  );
}
