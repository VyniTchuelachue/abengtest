"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import { acceptedImageTypes, publicMediaUrl, uploadErrorText, uploadImage } from "@/lib/upload";
import { useT } from "./i18n";

type Props = {
  name: string;
  initialHtml: string;
  placeholder: string;
  label: string;
  invalid?: boolean;
  describedBy?: string;
  onDirty?: () => void;
};

/** Article editor: headings, emphasis, lists, quotes, links and images. Output is HTML (sanitised on save). */
export function RichTextEditor({ name, initialHtml, placeholder, label, invalid, describedBy, onDirty }: Props) {
  const [html, setHtml] = useState(initialHtml);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose-legal min-h-[22rem] max-w-none px-5 py-4 focus:outline-none",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.isEmpty ? "" : editor.getHTML());
      onDirty?.();
    },
  });

  return (
    <div className={`mt-1.5 overflow-hidden rounded-xl border bg-white ${invalid ? "border-danger" : "border-rule"} focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30`}>
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const t = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("Adresse du lien (laisser vide pour retirer le lien) :"), previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "articles/inline", 1800);
      const alt = window.prompt(t("Description de l'image (pour l'accessibilité) :"), "") ?? "";
      editor.chain().focus().setImage({ src: publicMediaUrl(path), alt }).run();
    } catch (e) {
      window.alert(uploadErrorText(t, e));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const btn = (active: boolean) =>
    `min-w-9 rounded-lg px-2.5 py-1.5 text-[0.875rem] transition-colors ${active ? "bg-gold text-ink" : "text-ink hover:bg-stone"} disabled:opacity-40`;

  return (
    <div role="toolbar" aria-label={t("Mise en forme")} className="flex flex-wrap items-center gap-1 border-b border-rule bg-stone/60 px-2 py-1.5">
      <button type="button" className={btn(state.h2)} aria-pressed={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        {t("Titre")}
      </button>
      <button type="button" className={btn(state.h3)} aria-pressed={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        {t("Sous-titre")}
      </button>
      <span className="mx-1 h-5 w-px bg-rule" aria-hidden />
      <button type="button" className={`${btn(state.bold)} font-bold`} aria-pressed={state.bold} aria-label={t("Gras")} onClick={() => editor.chain().focus().toggleBold().run()}>
        {t("G")}
      </button>
      <button type="button" className={`${btn(state.italic)} italic`} aria-pressed={state.italic} aria-label={t("Italique")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </button>
      <button type="button" className={`${btn(state.underline)} underline`} aria-pressed={state.underline} aria-label={t("Souligné")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        {t("S")}
      </button>
      <span className="mx-1 h-5 w-px bg-rule" aria-hidden />
      <button type="button" className={btn(state.bullet)} aria-pressed={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • {t("Liste")}
      </button>
      <button type="button" className={btn(state.ordered)} aria-pressed={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. {t("Liste")}
      </button>
      <button type="button" className={btn(state.quote)} aria-pressed={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        {t("Citation")}
      </button>
      <span className="mx-1 h-5 w-px bg-rule" aria-hidden />
      <button type="button" className={btn(state.link)} aria-pressed={state.link} onClick={setLink}>
        {t("Lien")}
      </button>
      <button type="button" className={btn(false)} disabled={uploading} onClick={() => fileInput.current?.click()}>
        {uploading ? t("Envoi…") : t("Image")}
      </button>
      <input ref={fileInput} type="file" accept={acceptedImageTypes} className="sr-only" tabIndex={-1} onChange={(e) => void insertImage(e.target.files?.[0])} />
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        {t("Séparateur")}
      </button>
      <span className="ml-auto flex gap-1">
        <button type="button" className={btn(false)} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          {t("Annuler")}
        </button>
        <button type="button" className={btn(false)} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          {t("Rétablir")}
        </button>
      </span>
    </div>
  );
}
