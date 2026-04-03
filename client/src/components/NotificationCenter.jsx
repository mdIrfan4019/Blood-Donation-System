import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAsRead, deleteNotification } from "../store/slices/notificationSlice";

export default function NotificationCenter() {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const toggle = () => setIsOpen(!isOpen);

  const handleRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        onClick={toggle}
        className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform inline-block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-[350px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-lg">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
              {list.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 grayscale opacity-20">📭</div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose">
                    All caught up!<br/>No new alerts.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {list.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => !n.isRead && handleRead(n._id)}
                      className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                          n.type === 'emergency' ? 'bg-rose-100 text-rose-600' :
                          n.type === 'shortage' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type === 'emergency' ? '🚨' : n.type === 'shortage' ? '⚠️' : '📢'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDelete(e, n._id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors border-t border-slate-100 dark:border-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Close Panel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
