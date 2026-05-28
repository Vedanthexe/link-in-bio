import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Editor from '../components/Editor/Editor';

export default function Dashboard({ user }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPage();
  }, [user]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no page exists, create one
        console.log('Fetch error code:', error.code, 'message:', error.message);
        if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
          await createDefaultPage();
          return;
        }
        throw error;
      }
      setPage(data);
    } catch (err) {
      console.error('Error fetching page:', err);
      alert('Error loading page: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([
          {
            user_id: user.id,
            title: 'My Landing Page',
            bio: 'Welcome to my link in bio!',
            links: [],
            colors: { bg: '#ffffff', text: '#000000', link: '#0066cc' },
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setPage(data);
    } catch (err) {
      console.error('Error creating page:', err);
      console.error('Error details:', { message: err.message, code: err.code, status: err.status });
      alert('Error creating page: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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
        {page ? (
          <Editor page={page} user={user} onSave={fetchPage} />
        ) : (
          <div>Loading page...</div>
        )}
      </main>
    </div>
  );
}
