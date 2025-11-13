import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaBell, FaExclamationCircle, FaCheckCircle, FaClock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collectionGroup, onSnapshot, getDoc, doc } from "firebase/firestore";

export default function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, pending, resolved
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  useEffect(() => {
    const uploadsQuery = collectionGroup(db, "uploads");
    const unsubscribe = onSnapshot(
      uploadsQuery,
      async (snapshot) => {
        const data = await Promise.all(
          snapshot.docs.map(async (uploadDoc) => {
            const userId = uploadDoc.ref.parent.parent?.id || "unknown";
            let userDetails = null;
            try {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) userDetails = userDoc.data();
            } catch (err) {
              console.error("Error fetching user details:", err);
            }

            const uploadData = uploadDoc.data();
            const yolo = uploadData.yolo || {};
            let issueType = "Unknown";
            let severity = "low";

            if (yolo.drainage_count > 0) {
              issueType = "Drainage";
              if (yolo.status === "Clogged" || yolo.obstruction_count > 2) severity = "high";
              else if (yolo.obstruction_count > 0) severity = "medium";
            } else if (yolo.pothole_count > 0) {
              issueType = "Pothole";
              severity = yolo.pothole_count > 3 ? "high" : "medium";
            } else if (yolo.road_surface_count > 0) severity = "medium";

            const fullAddress = uploadData.address || "";
            const street = fullAddress.split(",")[0] || fullAddress;
            const currentStatus = uploadData.status || "Pending";

            let message = "";
            if (currentStatus === "Pending") message = `New ${issueType} report at ${street}`;
            else if (currentStatus === "Resolved") message = `${issueType} issue at ${street} has been resolved`;
            else if (currentStatus === "Withdrawn") message = `${issueType} report at ${street} was withdrawn`;

            return {
              id: uploadDoc.id,
              userId,
              userDetails,
              issueType,
              street,
              status: currentStatus,
              severity,
              uploadedAt: uploadData.uploadedAt,
              message,
              read: false,
            };
          })
        );

        // Sort by severity then date
        data.sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          if (severityOrder[a.severity] !== severityOrder[b.severity])
            return severityOrder[a.severity] - severityOrder[b.severity];
          return b.uploadedAt?.seconds - a.uploadedAt?.seconds;
        });

        setNotifications(data);
      },
      (err) => console.error("Error fetching notifications:", err)
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleNotif = () => setIsNotifOpen(!isNotifOpen);
  const markAsRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsNotifOpen(false);
    navigate("/reports");
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "pending") return n.status === "Pending";
    if (filter === "resolved") return n.status === "Resolved";
    return true;
  });

  const getTimeAgo = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const now = new Date();
    const uploadDate = timestamp.toDate();
    const diffMs = now - uploadDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return <FaExclamationCircle className="text-red-500" />;
      case "medium":
        return <FaExclamationCircle className="text-orange-500" />;
      default:
        return <FaClock className="text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-l-4 border-red-500";
      case "medium":
        return "bg-orange-50 border-l-4 border-orange-500";
      default:
        return "bg-blue-50 border-l-4 border-blue-500";
    }
  };

  // ✅ New helper functions
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded font-medium">Pending</span>;
      case "Resolved":
        return <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-medium">Resolved</span>;
      case "Withdrawn":
        return <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded font-medium">Withdrawn</span>;
      default:
        return <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-medium">{status}</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "high":
        return <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded font-medium">High Priority</span>;
      case "medium":
        return <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded font-medium">Medium Priority</span>;
      default:
        return <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium">Low Priority</span>;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-between px-6 shadow-2xl border-b border-orange-600/30">
      <div className="flex-1 max-w-xl"></div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className="relative p-2 rounded-lg hover:bg-orange-900/30 transition-all duration-200 group"
          >
            <FaBell
              className={`text-xl transition-colors ${isNotifOpen ? "text-blue-400" : "text-gray-300 group-hover:text-white"}`}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full border-2 border-black animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-[420px] bg-gray-900 border border-orange-600/50 rounded-lg shadow-2xl z-50 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="p-4 border-b border-orange-600/30 bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Infrastructure Reports</h3>
                    <p className="text-xs text-orange-100 mt-0.5">
                      {unreadCount} unread • {notifications.length} total
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs bg-orange-600 hover:bg-orange-500 px-3 py-1 rounded-full transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3">
                  {["all", "unread", "pending", "resolved"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        filter === f ? "bg-orange-500 text-white font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <ul className="max-h-[500px] overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 hover:bg-gray-800 border-b border-gray-700 transition-colors cursor-pointer ${
                        !n.read ? getSeverityColor(n.severity) : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getSeverityIcon(n.severity)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`text-sm ${!n.read ? "font-semibold text-white" : "text-gray-300"}`}>
                              {n.message}
                            </p>
                            {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>}
                          </div>

                          {/* Reporter Info & Time */}
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <FaUserCircle className="text-gray-500" />
                              {n.userDetails?.firstName} {n.userDetails?.lastName}
                            </span>
                            <span>•</span>
                            <span>{getTimeAgo(n.uploadedAt)}</span>
                          </div>

                          {/* Status & Severity Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(n.status)}
                            {getSeverityBadge(n.severity)}
                            <span className="text-xs bg-gray-700 text-orange-400 px-2 py-0.5 rounded">{n.issueType}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-gray-400">
                    <FaBell className="mx-auto text-3xl text-gray-500 mb-2" />
                    <p className="text-sm">No notifications found</p>
                  </li>
                )}
              </ul>

              {/* Footer */}
              <div className="p-3 text-center border-t border-orange-600/30 bg-gray-800">
                <Link
                  to="/reports"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-sm text-orange-500 hover:text-orange-400 font-medium hover:underline"
                >
                  View all reports →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-700"></div>

        {/* Profile */}
        <div className="flex items-center space-x-3 relative" ref={profileRef}>
          <div className="text-right hidden sm:block">
            <p className="font-semibold">Admin User</p>
            <p className="text-xs text-orange-100 mt-0.5">Administrator</p>
          </div>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative focus:outline-none group">
            <FaUserCircle className="w-10 h-10 text-gray-300 group-hover:text-white transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </button>

          {isProfileOpen && (
            <div className="absolute top-14 right-0 w-56 bg-black rounded-lg shadow-2xl text-white border border-orange-600 overflow-hidden animate-fadeIn z-50">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                <p className="font-semibold">Admin User</p>
                <p className="text-xs text-orange-100 mt-0.5">admin@gmail.com</p>
              </div>
              <ul className="py-2 bg-black text-white">
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2.5 hover:bg-orange-900/30 transition-colors text-sm"
                  >
                    <FaUserCircle className="mr-3 text-orange-400" /> My Profile
                  </Link>
                </li>
                <li className="border-t border-orange-600 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 hover:bg-red-600/20 transition-colors text-red-400 text-sm font-medium"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
