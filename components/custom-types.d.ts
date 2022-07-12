// TypeScript users only add this code
import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
export type ToDoElement = { type: 'todo'; children: CustomText[] }

type CustomElement = ParagraphElement | ToDoElement;
type CustomText = { bold?: boolean, text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
