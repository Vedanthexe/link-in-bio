import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DragDropList({ links, onUpdateLink, onDeleteLink }) {
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (idx) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, overIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === overIdx) return;

    const updated = [...links];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(overIdx, 0, moved);

    // Reorder by swapping in place to trigger state update
    onUpdateLink(draggedIdx, 'title', links[overIdx].title);
    onUpdateLink(overIdx, 'title', links[draggedIdx].title);
    onUpdateLink(draggedIdx, 'url', links[overIdx].url);
    onUpdateLink(overIdx, 'url', links[draggedIdx].url);

    setDraggedIdx(null);
  };

  return (
    <div className="space-y-3">
      {links.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No links yet. Add one to get started!</p>
      ) : (
        links.map((link, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-move transition"
          >
            <div className="flex gap-3 items-center">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => onUpdateLink(idx, 'title', e.target.value)}
                  placeholder="Link title"
                  className="w-full px-3 py-2 border rounded text-sm"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => onUpdateLink(idx, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <button
                onClick={() => onDeleteLink(idx)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
