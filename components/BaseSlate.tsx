// Import React dependencies.
import { useMemo } from 'react';
// Import the Slate editor factory.
import { createEditor } from 'slate';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react';
import { Descendant } from 'slate';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export default function BaseSlate() {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} value={initialValue}>
      <Editable />
    </Slate>
  );
}
