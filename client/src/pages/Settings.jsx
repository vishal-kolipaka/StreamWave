import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Lock, User, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const settingsGroups = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Edit Profile' },
        { icon: Bell, label: 'Notifications' },
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: Lock, label: 'Privacy and Security' },
        { icon: Shield, label: 'Login Activity' },
      ]
    },
    {
      title: 'App Settings',
      items: [
        // Add more app settings here if needed, for now just placeholders or move items
      ]
    }
  ];

  const SettingsRow = ({ icon: Icon, label, onClick, isDestructive = false }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 h-[72px] transition-colors border-b border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] ${isDestructive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-[var(--text-primary)] dark:text-[#f5f5f5]'
        }`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-6 h-6 ${isDestructive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
        <span className={`text-lg ${isDestructive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
      {!isDestructive && (
        <div className="text-gray-400 dark:text-gray-600 text-2xl">›</div>
      )}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-[var(--app-bg)] dark:bg-[#111]">
      <div className="bg-white dark:bg-[#111] shadow-sm border-t border-[var(--border-color)] dark:border-[#333]">
        {settingsGroups.map((group, groupIdx) => (
          group.items.length > 0 && (
            <div key={groupIdx}>
              <h2 className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.title}
              </h2>
              {group.items.map((item, idx) => (
                <SettingsRow key={idx} icon={item.icon} label={item.label} />
              ))}
            </div>
          )
        ))}

        <div className="mt-2">
          <SettingsRow
            icon={LogOut}
            label="Log Out"
            onClick={handleLogout}
            isDestructive={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
