import { ReactNode, useMemo, useState, useCallback, KeyboardEvent } from 'react';
import { createEditor, Editor, Transforms } from 'slate';

import { Slate, Editable, withReact } from 'slate-react';
import { Descendant } from 'slate';
import { CustomElement } from './custom-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export default function BaseSlate() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'todo':
        return <ToDoElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);
  return (
    <Slate editor={editor} value={initialValue}>
      <Editable
        renderElement={renderElement}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === '/' && event.ctrlKey) {
            event.preventDefault();
            const match = Editor.nodes(editor, {
              match: (n) => (n as CustomElement).type === 'todo',
            }).next().value;
            Transforms.setNodes(
              editor,
              { type: match ? 'paragraph' : 'todo' },
              { match: (n) => Editor.isBlock(editor, n) },
            );
          }
        }}
      />
    </Slate>
  );
}

function DefaultElement({ attributes, children }: { attributes: any; children: ReactNode }) {
  return <p {...attributes}>{children}</p>;
}

function ToDoElement({ children }: { children: ReactNode }) {
  const [isDone, setIsDone] = useState(false);
  return (
    <div>
      <input type='checkbox' checked={isDone} onChange={() => setIsDone(!isDone)} />
      {children}
    </div>
  );
}
