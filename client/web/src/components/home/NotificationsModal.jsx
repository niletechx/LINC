import { Bell, CheckCheck, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export default function NotificationsModal() {
  const { isNotificationsOpen, setNotificationsOpen, notifications, markAllNotificationsRead } = useAppStore();

  if (!isNotificationsOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setNotificationsOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Bell size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Notifications</h3>
              <p className="modal-subtitle">Stay updated on bookings, messages & escrow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="btn btn-ghost btn-sm text-cyan text-xs"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              Read all
            </button>
            <button
              className="modal-close-btn"
              onClick={() => setNotificationsOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                  <div className="notification-top">
                    <span className="notification-title">{n.title}</span>
                    <span className="notification-time">{n.time}</span>
                  </div>
                  <p className="notification-body">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
