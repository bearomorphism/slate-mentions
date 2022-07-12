// TypeScript users only add this code
import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

interface Task {
  title: string;
  assignee: string;
  due: Date;
}

export type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
export type ToDoElement = { type: 'todo'; children: CustomText[] };
export type MentionElement = {
  type: 'mention';
  character: string;
  children: CustomText[];
};

type CustomElement = ParagraphElement | ToDoElement | MentionElement;
type CustomText = { bold?: boolean; text: string };
type CustomEditor = BaseEditor & ReactEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
