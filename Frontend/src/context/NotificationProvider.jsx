// Frontend/src/context/NotificationProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/useAuth";
import { io } from "socket.io-client";
import { NotificationContext } from "./NotificationContext";
import { SOCKET_URL } from "@/config"; // ⬅ use centralized config

// This file only exports the NotificationProvider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { token, user } = useAuth();
  useEffect(() => {
    if (token && user) {
      const newSocket = io(SOCKET_URL, { auth: { token } });

      newSocket.on("connect", () =>
        console.log("Connected to notification server")
      );
      newSocket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      newSocket.on("disconnect", () =>
        console.log("Disconnected from notification server")
      );

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [token, user]);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        if (socket) {
          socket.emit("markAsRead", notificationId, (response) => {
            if (response.success) {
              setNotifications((prev) =>
                prev.map((notif) =>
                  notif._id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
                )
              );
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          });
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [socket]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notif) => !notif.isRead
      );
      for (const notif of unreadNotifications) {
        await markAsRead(notif._id);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [notifications, markAsRead]);

  const fetchNotifications = useCallback(async () => {
    try {
      if (socket) {
        socket.emit("getNotifications", (response) => {
          if (response.success) {
            setNotifications(response.notifications);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [socket]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      if (socket) {
        socket.emit("getUnreadCount", (response) => {
          if (response.success) {
            setUnreadCount(response.count);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [socket, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
