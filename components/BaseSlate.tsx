import { ReactNode, useMemo, useState, useCallback, KeyboardEvent } from 'react';
import { createEditor, Editor, Transforms, Text, Node, BaseEditor } from 'slate';

import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, ReactEditor } from 'slate-react';
import { Descendant } from 'slate';
import { CustomElement, CustomText } from './custom-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

const CustomEditor = {
  isBoldMarkActive(editor: BaseEditor & ReactEditor) {
    const match = Editor.nodes(editor, {
      match: n => (n as CustomText).bold === true,
      universal: true,
    }).next().value;

    return !!match
  },
  toggleBoldMark(editor: BaseEditor & ReactEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    Transforms.setNodes(
      editor,
      { bold: !isActive },
      { match: n => Text.isText(n), split: true }
    )
  },
}

export default function BaseSlate() {
  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'todo':
        return <ToDoElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate editor={editor} value={initialValue}>
      <div>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }}
        >
          Bold
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.ctrlKey) {
            if (event.key === '/') {
              event.preventDefault();
              const match = Editor.nodes(editor, {
                match: (n) => (n as CustomElement).type === 'todo',
              }).next().value;
              Transforms.setNodes(
                editor,
                { type: match ? 'paragraph' : 'todo' },
                { match: (n) => Editor.isBlock(editor, n) },
              );
            } else if (event.key === 'b') {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
            }
          }
        }}
      />
    </Slate>
  );
}

function Leaf(props: RenderLeafProps) {
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
      {props.children}
    </span>
  );
}

function DefaultElement({ attributes, children }: RenderElementProps) {
  return <p {...attributes}>{children}</p>;
}

function ToDoElement({ children }: RenderElementProps) {
  const [isDone, setIsDone] = useState(false);
  return (
    <div>
      <input type='checkbox' checked={isDone} onChange={() => setIsDone(!isDone)} />
      {children}
    </div>
  );
}
