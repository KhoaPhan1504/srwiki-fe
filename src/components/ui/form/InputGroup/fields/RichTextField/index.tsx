// src/components/form/InputGroup/fields/RichTextField/index.tsx
import { forwardRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { FormField, Button } from '~root/components/ui';
import { cn } from '~root/lib/utils';
import { FieldShell } from '~root/components/common';
import type { SrRichTextFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrRichTextField = ({ name, label, description, disabled }: SrRichTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description}>
          <RichTextEditor value={field.value ?? ''} onChange={field.onChange} disabled={disabled} />
        </FieldShell>
      )}
    />
  );
};

type EditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

const RichTextEditor = forwardRef<HTMLDivElement, EditorProps>(
  ({ value, onChange, disabled }, ref) => {
    const editor = useEditor({
      extensions: [StarterKit],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    });

    useEffect(() => {
      if (editor && editor.getHTML() !== value) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
      editor?.setEditable(!disabled);
    }, [disabled, editor]);

    if (!editor) {
      return (
        <div
          ref={ref}
          className="min-h-32 rounded-md border border-input p-3 text-sm text-muted-foreground"
        />
      );
    }

    return (
      <div ref={ref} className="rounded-md border border-input">
        <div className="flex gap-1 border-b border-input p-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent
          editor={editor}
          className={cn(
            'min-h-32 p-3 text-sm focus:outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
            disabled && 'opacity-50',
          )}
        />
      </div>
    );
  },
);
