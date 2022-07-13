import { Slate, Editable, withReact, useSlate, RenderElementProps } from 'slate-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createEditor, Descendant, Range, Editor, BaseRange, Transforms } from 'slate';
import { CustomEditor, CustomElement, QueryVoidElement } from './custom-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'A line of text in a paragraph.',
      },
    ],
  },
  // {
  //   type: 'query-void',
  //   children: [
  //     {
  //       text: '',
  //     },
  //   ],
  // },
];

const tasks = [
  'Buy milk',
  'Go to the gym',
  'Read a book',
  'Write a blog post',
  'Make a new friend',
  'Learn a new language',
  'Learn a new framework',
  'Learn a new tool',
  'Never gonna give you up',
  'Never gonna let you down',
  'Never gonna run around and desert you',
  'Never gonna make you cry',
  'Never gonna say goodbye',
  'Never gonna tell a lie and hurt you',
];

export default function QuerySlate() {
  const editor = useMemo(() => withQueryVoid(withReact(createEditor())), []);
  const [target, setTarget] = useState<BaseRange | null>(null);
  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={() => {
        const { selection } = editor;
        console.log(selection);
        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const text = beforeRange && Editor.string(editor, beforeRange);
          const match = text && text.match(/^@query$/);
          if (match) {
            setTarget(beforeRange);
          } else {
            setTarget(null);
          }
        }
      }}
    >
      <Editable
        renderElement={(props) => <Element {...props} />}
        onKeyDown={(event) => {
          if (target && event.key === 'Enter') {
            event.preventDefault();
            Transforms.select(editor, target);
            const query: QueryVoidElement = {
              type: 'query-void',
              children: [
                {
                  text: '',
                },
              ],
            };
            Transforms.insertNodes(editor, query);
            Transforms.move(editor);
            setTarget(null);
          }
          console.log(target);
        }}
      />
    </Slate>
  );
}

function withQueryVoid(editor: CustomEditor) {
  const { isVoid } = editor;
  editor.isVoid = (element: CustomElement) => element.type === 'query-void' || isVoid(element);
  return editor;
}

function QueryVoid(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const [value, setValue] = useState('query here');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.toLowerCase().includes(value.toLowerCase())),
    [value],
  );
  return (
    <div {...attributes} contentEditable={false}>
      <div className='d-flex'>
        <div className='border bg-red-100'>query</div>
        <input type='text' value={value} onChange={(e) => setValue(e.target.value)} ref={ref} />
      </div>
      <pre>{JSON.stringify(filteredTasks, null, 2)}</pre>
      {children}
    </div>
  );
}

function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;
  if (element.type === 'query-void') {
    return <QueryVoid {...props} />;
  }
  return <p {...attributes}>{children}</p>;
}
