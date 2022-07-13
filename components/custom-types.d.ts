import { BaseEditor, Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

interface Task {
  title: string;
  assignee: string;
  due: Date;
}

export type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
export type ToDoElement = { type: 'todo'; children: CustomText[] };
export type QueryVoidElement = { type: 'query-void'; children: CustomText[] };
export type MentionElement = {
  type: 'mention';
  character: string;
  children: CustomText[];
};

type CustomElement =
  | ParagraphElement
  | ToDoElement
  | MentionElement
  | QueryVoidElement
type CustomText = { bold?: boolean; text: string };
type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
