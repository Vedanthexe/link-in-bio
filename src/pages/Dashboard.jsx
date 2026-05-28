import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Editor from '../components/Editor/Editor';

const DEFAULT_PAGE = {
  id: null,
  user_id: '',
  title: 'My Landing Page',
  bio: 'Welcome to my link in bio!',
  links: [],
  colors: { bg: '#ffffff', text: '#000000', link: '#0066cc' },
  avatar_url: null,
};

export default function Dashboard({ user }) {
  const [page, setPage] = useState(() => ({ ...DEFAULT_PAGE, user_id: user.id }));
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally fetch existing page data
    const fetchPage = async () => {
      try {
        const { data } = await supabase
          .from('pages')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) setPage(data);
      } catch (err) {
        console.error('Error fetching page:', err);
      }
    };
    fetchPage();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Link in Bio</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-8">
        <Editor page={page} user={user} onSave={() => {}} />
      </main>
    </div>
  );
}
