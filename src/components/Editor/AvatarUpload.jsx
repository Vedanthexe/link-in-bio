import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AvatarUpload({ page, user, onSave }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update page with avatar URL
      const { error: updateError } = await supabase
        .from('pages')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      onSave();
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Error uploading avatar: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Avatar</label>
      <div className="flex gap-4 items-center">
        {page.avatar_url && (
          <img
            src={page.avatar_url}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <label className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer font-medium text-sm">
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
