import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { supabase } from '../../lib/supabase';

type Message = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  listing_id: string | null;
  content: string;
  created_at: string;
};

type Conversation = {
  user_id: string;
  name: string;
  account_type: string;
  avatar_url: string | null;
  last_message: string;
  last_at: string;
};

export default function ChatPage() {
  const [myId, setMyId] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const uid = session.user.id;
      setMyId(uid);
      await loadConversations(uid);

      // Auto-open conversation if ?with= param is present
      const withId = searchParams.get('with');
      if (withId && withId !== uid) {
        const { data: partner } = await supabase
          .from('users')
          .select('id, name, account_type, avatar_url')
          .eq('id', withId)
          .single();
        if (partner) {
          const conv: Conversation = {
            user_id: partner.id,
            name: partner.name || 'Unknown',
            account_type: partner.account_type || '',
            avatar_url: partner.avatar_url || null,
            last_message: '',
            last_at: '',
          };
          // Add to conversations list if not already there
          setConversations(prev =>
            prev.find(c => c.user_id === withId) ? prev : [conv, ...prev]
          );
          openConversationWithId(uid, conv);
        }
      }

      setLoading(false);
    };
    init();
  }, []);

  const loadConversations = async (uid: string) => {
    const { data: msgs } = await supabase
      .from('messages')
      .select('from_user_id, to_user_id, message, created_at')
      .or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`)
      .order('created_at', { ascending: false });

    if (!msgs?.length) return;

    const partnerIds = [...new Set(msgs.map(m => m.from_user_id === uid ? m.to_user_id : m.from_user_id))];
    const { data: partners } = await supabase
      .from('users')
      .select('id, name, account_type, avatar_url')
      .in('id', partnerIds);

    const convs: Conversation[] = partnerIds.map(pid => {
      const partner = partners?.find(p => p.id === pid);
      const lastMsg = msgs.find(m => m.from_user_id === pid || m.to_user_id === pid);
      return {
        user_id: pid,
        name: partner?.name || 'Unknown',
        account_type: partner?.account_type || '',
        avatar_url: partner?.avatar_url || null,
        last_message: lastMsg?.content || '',
        last_at: lastMsg?.created_at || '',
      };
    });
    setConversations(convs);
  };

  const openConversationWithId = async (uid: string, conv: Conversation) => {
    setActiveConv(conv);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user_id.eq.${uid},to_user_id.eq.${conv.user_id}),and(from_user_id.eq.${conv.user_id},to_user_id.eq.${uid})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    const channel = supabase
      .channel(`chat-${conv.user_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user_id=eq.${uid}`,
      }, payload => {
        if (payload.new.from_user_id === conv.user_id) {
          setMessages(prev => [...prev, payload.new as Message]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const openConversation = (conv: Conversation) => openConversationWithId(myId, conv);

  const sendMessage = async () => {
    if (!text.trim() || !activeConv || sending) return;
    setSending(true);
    const { data } = await supabase.from('messages').insert({
      from_user_id: myId,
      to_user_id: activeConv.user_id,
      content: text.trim(),
    }).select().single();
    if (data) {
      setMessages(prev => [...prev, data]);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    setSending(false);
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 pb-24 md:pb-0">
        <div className="h-[calc(100vh-4rem)] flex border-t border-gray-100">

          {/* Conversations list */}
          <div className={`w-full md:w-96 border-r border-gray-100 bg-white flex-shrink-0 ${activeConv ? 'hidden' : 'flex'} flex-col`}>
            <div className="px-4 py-4 border-b border-gray-100">
              <h1 className="font-bold text-gray-900">Messages</h1>
            </div>
            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <i className="ri-chat-3-line text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Message a service provider from their listing page</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.user_id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${activeConv?.user_id === conv.user_id ? 'bg-emerald-50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {conv.avatar_url ? (
                        <img src={conv.avatar_url} alt={conv.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-emerald-700 font-bold text-sm">{initials(conv.name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{conv.name}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat window */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-white">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="text-gray-400 cursor-pointer">
                  <i className="ri-arrow-left-line text-lg"></i>
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {activeConv.avatar_url ? (
                    <img src={activeConv.avatar_url} alt={activeConv.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs">{initials(activeConv.name)}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{activeConv.name}</p>
                  {activeConv.account_type && <p className="text-xs text-gray-400 capitalize">{activeConv.account_type}</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map(msg => {
                  const isMine = msg.from_user_id === myId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 ${text.trim() && !sending ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <i className="ri-send-plane-fill text-sm"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-white">
              <div className="text-center">
                <i className="ri-chat-3-line text-gray-200 text-5xl mb-3"></i>
                <p className="text-gray-400 text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
