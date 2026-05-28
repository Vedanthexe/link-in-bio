import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PublicPage() {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicPage();
  }, [username]);

  const fetchPublicPage = async () => {
    try {
      // First get user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError) throw userError;
      if (!userData) {
        setLoading(false);
        return;
      }

      // Then get the user's page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (pageError && pageError.code !== 'PGRST116') throw pageError; // PGRST116 = no rows returned
      if (pageData) {
        setPage(pageData);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Page not found</h1>
          <p className="text-gray-600">This link in bio doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: page.colors?.bg || '#ffffff' }}
    >
      <div className="max-w-md mx-auto">
        {page.avatar_url && (
          <div className="flex justify-center mb-6">
            <img
              src={page.avatar_url}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
        )}

        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: page.colors?.text || '#000000' }}
          >
            {page.title}
          </h1>
          <p
            className="text-gray-600"
            style={{ color: page.colors?.text || '#000000' }}
          >
            {page.bio}
          </p>
        </div>

        <div className="space-y-3">
          {page.links?.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 rounded-lg text-center font-medium transition hover:opacity-80"
              style={{
                backgroundColor: page.colors?.link || '#0066cc',
                color: '#ffffff',
              }}
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
