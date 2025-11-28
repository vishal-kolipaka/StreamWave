import { useState, useEffect } from 'react';
import { Send, Phone, Video, Info } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
// import io from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error('Fetch conversations failed', error);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/${activeChat._id}`);
          setMessages(res.data);
        } catch (error) {
          console.error('Fetch messages failed', error);
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await api.post('/messages', {
        conversationId: activeChat._id,
        text: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Send message failed', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id) || {};
  };

  return (
    <div className="flex h-full bg-[var(--app-bg)]">
      {/* Chat List */}
      <div className={`w-full md:w-80 border-r border-[var(--border-color)] flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-xl">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const other = getOtherParticipant(conv);
            return (
              <div
                key={conv._id}
                onClick={() => setActiveChat(conv)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${activeChat?._id === conv._id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
              >
                <img
                  src={other.avatarUrl || '/default-avatar.png'}
                  alt={other.username}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{other.username}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {conv.messages[conv.messages.length - 1]?.text || 'Start a conversation'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col h-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden mr-4 text-2xl"
                >
                  ←
                </button>
                <img
                  src={getOtherParticipant(activeChat).avatarUrl || '/default-avatar.png'}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                />
                <span className="font-bold">{getOtherParticipant(activeChat).username}</span>
              </div>
              <div className="flex space-x-4 text-gray-500">
                <Phone className="w-6 h-6 cursor-pointer" />
                <Video className="w-6 h-6 cursor-pointer" />
                <Info className="w-6 h-6 cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black">
              {messages.map((msg, idx) => {
                const isMe = msg.from._id === user.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMe
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-bl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center">
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full py-2 px-4 focus:outline-none mr-2"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()} className="text-blue-500 font-bold disabled:opacity-50">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full border-2 border-black dark:border-white flex items-center justify-center mb-4">
              <Send className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-light mb-2">Your Messages</h2>
            <p className="text-gray-500">Send private photos and messages to a friend or group.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
