import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import DragDropList from './DragDropList';
import ColorPicker from './ColorPicker';
import AvatarUpload from './AvatarUpload';

export default function Editor({ page, user, onSave }) {
  const [title, setTitle] = useState(page.title || '');
  const [bio, setBio] = useState(page.bio || '');
  const [links, setLinks] = useState(page.links || []);
  const [colors, setColors] = useState(page.colors || {});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddLink = () => {
    setLinks([...links, { title: 'New Link', url: 'https://example.com' }]);
  };

  const handleDeleteLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleUpdateLink = (idx, field, value) => {
    const updated = [...links];
    updated[idx][field] = value;
    setLinks(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If page has an ID, update it; otherwise insert a new one
      if (page.id) {
        const { error } = await supabase
          .from('pages')
          .update({
            title,
            bio,
            links,
            colors,
            updated_at: new Date(),
          })
          .eq('id', page.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([
            {
              user_id: user.id,
              title,
              bio,
              links,
              colors,
            },
          ]);

        if (error) throw error;
      }
      onSave();
    } catch (err) {
      console.error('Error saving page:', err);
      alert('Error saving page: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `http://localhost:5173/${user.email?.split('@')[0]}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Page Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <AvatarUpload page={page} user={user} onSave={onSave} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Links</h2>
            <button
              onClick={handleAddLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Link
            </button>
          </div>

          <DragDropList links={links} onUpdateLink={handleUpdateLink} onDeleteLink={handleDeleteLink} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            <ColorPicker
              label="Background"
              color={colors.bg || '#ffffff'}
              onChange={(color) => setColors({ ...colors, bg: color })}
            />
            <ColorPicker
              label="Text"
              color={colors.text || '#000000'}
              onChange={(color) => setColors({ ...colors, text: color })}
            />
            <ColorPicker
              label="Link Button"
              color={colors.link || '#0066cc'}
              onChange={(color) => setColors({ ...colors, link: color })}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {/* Preview Panel */}
      <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-8">
        <h2 className="text-xl font-bold mb-4">Share</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Your public link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            View Public Page
          </a>
        </div>

        {/* Live Preview */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-bold mb-4">Preview</h3>
          <div
            className="rounded-lg overflow-hidden border"
            style={{ backgroundColor: colors.bg || '#ffffff' }}
          >
            <div className="p-4 text-center">
              <h4
                className="text-lg font-bold mb-2"
                style={{ color: colors.text || '#000000' }}
              >
                {title}
              </h4>
              <p
                className="text-xs mb-4"
                style={{ color: colors.text || '#000000' }}
              >
                {bio.substring(0, 60)}...
              </p>
              <div className="space-y-2">
                {links.slice(0, 3).map((link, idx) => (
                  <a
                    key={idx}
                    className="block px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: colors.link || '#0066cc' }}
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
