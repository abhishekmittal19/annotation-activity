"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { notificationsApi, AuroraNotification } from "@/lib/api/notifications";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AuroraNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load notifications for the authenticated user.
  const loadNotifications = useCallback(async () => {
    setIsNotificationsLoading(true);
    setNotificationError("");

    try {
      const result = await notificationsApi.getAll();

      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationError("Unable to load notifications.");
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadNotifications]);

  // Logout.
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
      router.replace("/login");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      setNotificationError("Unable to update notifications.");
    }
  };

  const handleNotificationClick = async (notification: AuroraNotification) => {
    if (notification.isRead) return;

    try {
      await notificationsApi.markAsRead(notification._id);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationError("Unable to update notification.");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      {/* Left side: mobile menu and search */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white xl:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="flex min-w-0 max-w-xl flex-1 items-center gap-2">
          <Search size={18} className="shrink-0 text-slate-500" />

          <input
            type="text"
            placeholder="Search tasks, users, datasets..."
            className="min-w-0 w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right side: notifications and user profile */}
      <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-3">
        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => {
              const opening = !isNotificationsOpen;

              setIsNotificationsOpen(opening);
              setIsUserMenuOpen(false);

              if (opening) {
                void loadNotifications();
              }
            }}
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl sm:w-96">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isNotificationsLoading ? (
                  <p className="p-4 text-sm text-slate-400">
                    Loading notifications...
                  </p>
                ) : notificationError ? (
                  <p className="p-4 text-sm text-red-400">
                    {notificationError}
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">
                    You&apos;re all caught up.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => void handleNotificationClick(notification)}
                      className={`w-full border-b border-slate-800 px-4 py-3 text-left transition-colors hover:bg-slate-800 ${
                        notification.isRead ? "opacity-70" : "bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-200">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[10px] text-slate-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-6 w-px bg-slate-800 sm:block" />

        {/* Restored user profile and dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen((open) => !open);
              setIsNotificationsOpen(false);
            }}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-800"
          >
            <UserCircle size={28} className="shrink-0 text-slate-400" />

            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-slate-200">
                {user?.name || "User"}
              </p>

              <p className="text-[10px] capitalize text-slate-500">
                {user?.role || "User"}
              </p>
            </div>
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
            >
              <div className="border-b border-slate-800 px-4 py-3">
                <p className="text-sm font-medium text-slate-200">
                  {user?.name || "User"}
                </p>

                {/* <p className="mt-1 text-xs capitalize text-slate-500">
                  {user?.role || "User"}
                </p> */}

                {user?.email && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {user.email}
                  </p>
                )}
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
