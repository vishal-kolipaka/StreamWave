import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/messages/with/${userId}`);
        setConversationId(res.data.conversationId);
        setMessages(res.data.messages || []);
        setTargetUser(res.data.otherUser);
      } catch (err) {
        console.error('Load chat failed', err);
        setError('Unable to load this chat. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConversation();
    }
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !conversationId) return;

    try {
      const res = await api.post('/messages', {
        conversationId,
        recipientId: userId,
        text
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message failed', err);
    }
  };

  const renderBody = () => {
    if (loading) {
      return <p className="text-center py-10 text-gray-500">Loading conversation...</p>;
    }

    if (error) {
      return <p className="text-center py-10 text-red-500">{error}</p>;
    }

    if (!targetUser) {
      return <p className="text-center py-10 text-gray-500">User not found.</p>;
    }

    return (
      <>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="md:hidden mr-3 rounded-full border border-gray-200 dark:border-gray-800 p-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/profile/${targetUser._id}`)}
          >
            <img
              src={targetUser.avatarUrl || '/default-avatar.png'}
              alt={targetUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{targetUser.username}</p>
              <p className="text-xs text-blue-500">View profile</p>
            </div>
          </div>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              Say hello to start the conversation.
            </div>
          )}
          {messages.map((msg, idx) => {
            const senderId = msg.from?._id || msg.from;
            const isMe = senderId?.toString() === user?._id?.toString();
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm md:text-base ${isMe
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-100 dark:border-gray-800 rounded-bl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Message..."
            className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full py-2 px-4 focus:outline-none"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-4 py-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
      {renderBody()}
    </div>
  );
};

export default Chat;


