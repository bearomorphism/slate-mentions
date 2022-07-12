import { useMemo, useState, useCallback, KeyboardEvent, useRef } from 'react';
import { createEditor, Editor, Transforms, Text, BaseEditor, Range } from 'slate';

import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
  ReactEditor,
} from 'slate-react';
import { Descendant } from 'slate';
import { CustomEditor, CustomElement, CustomText, MentionElement, Task } from './custom-types';
import { Portal } from './Portal';

const fakeTasks: Task[] = [
  {
    title: 'Buy milk',
    assignee: 'John',
    due: new Date('2020-01-01'),
  },
  {
    title: 'Buy eggs',
    assignee: 'Jane',
    due: new Date('2020-01-08'),
  },
  {
    title: 'Buy bread',
    assignee: 'John',
    due: new Date('2020-01-05'),
  },
  {
    title: 'Rick roll',
    assignee: 'Rick Astley',
    due: new Date('2020-01-01'),
  },
  {
    title: 'Road roller',
    assignee: 'Dio Brando',
    due: new Date('2020-01-01'),
  },
];

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

const CustomEditor = {
  isBoldMarkActive(editor: CustomEditor) {
    const match = Editor.nodes(editor, {
      match: (n) => (n as CustomText).bold === true,
      universal: true,
    }).next().value;

    return !!match;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(editor, { bold: !isActive }, { match: (n) => Text.isText(n), split: true });
  },
};

export default function BaseSlate() {
  const editor = useMemo(() => withMentions(withReact(createEditor())), []);
  const [target, setTarget] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filteredTasks = useMemo(() => {
    return fakeTasks.filter((task) => task.title.includes(search));
  }, [search]);

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

  const onKeyDown = useCallback((event: KeyboardEvent) => {
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
  }, []);

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={() => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.string(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.string(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            setIndex(0);
            return;
          }
        }

        setTarget(null);
      }}
    >
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder='Enter some rich text...'
        onKeyDown={onKeyDown}
      />
      {target && filteredTasks.length > 0 && (
        <Portal>
          <div
            ref={ref}
            style={{
              top: '-9999px',
              left: '-9999px',
              position: 'absolute',
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }}
            data-cy='mentions-portal'
          >
            {filteredTasks.map((filteredTasks, i) => (
              <div
                key={filteredTasks.title}
                style={{
                  padding: '1px 3px',
                  borderRadius: '3px',
                  background: i === index ? '#B4D5FF' : 'transparent',
                }}
              >
                {filteredTasks.title}
              </div>
            ))}
          </div>
        </Portal>
      )}
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

const withMentions = (editor: CustomEditor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element: CustomElement) => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = (element: CustomElement) => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};

const insertMention = (editor: CustomEditor, task: Task) => {
  const mention: MentionElement = {
    type: 'mention',
    task,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

function MentionElement({ attributes, children, element }: RenderElementProps) {
  const { task } = element as MentionElement;
  return <span {...attributes} className='bg-red-500'>{children}@{task.title}</span>;
}
