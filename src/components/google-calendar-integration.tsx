"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

interface GoogleCalendarIntegrationProps {
  teacherId: Id<"users">;
}

export function GoogleCalendarIntegration({ teacherId }: GoogleCalendarIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  // Get current Google Calendar connection
  const connection = useQuery(api.googleCalendar.getGoogleCalendarConnection, {
    teacherId,
  });

  // Get sync history
  const syncHistory = useQuery(api.googleCalendar.getSyncHistory, {
    teacherId,
    limit: 5,
  });

  // Actions
  const generateAuthUrl = useAction(api.googleCalendar.generateAuthUrl);
  const handleAuthCallback = useAction(api.googleCalendar.handleAuthCallback);
  const syncCalendar = useAction(api.googleCalendar.syncGoogleCalendar);
  const disconnectCalendar = useMutation(api.googleCalendar.disconnectGoogleCalendar);
  const storeGoogleCalendarConnection = useMutation(api.googleCalendar.storeGoogleCalendarConnection);

  const handleOAuthCallback = useCallback(async (code: string) => {
    setIsConnecting(true);
    try {
      const result = await handleAuthCallback({ code, teacherId });
      if (result.success) {
        // Store the connection in the database
        await storeGoogleCalendarConnection({
          teacherId,
          accessToken: "placeholder_access_token",
          refreshToken: "placeholder_refresh_token", 
          tokenExpiry: Date.now() + 3600000,
          calendarId: result.calendarId || "primary",
        });
        setSyncStatus(result.message);
      } else {
        setSyncStatus(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      console.error("OAuth callback failed:", error);
      setSyncStatus("Connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [handleAuthCallback, storeGoogleCalendarConnection, teacherId]);

  // Handle OAuth callback from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth_code');
    const teacherIdParam = urlParams.get('teacher_id');
    const oauthProvider = urlParams.get('oauth_provider');

    if (authCode && teacherIdParam === teacherId && oauthProvider === 'google') {
      handleOAuthCallback(authCode);
      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth_code');
      newUrl.searchParams.delete('teacher_id');
      newUrl.searchParams.delete('oauth_provider');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [teacherId, handleOAuthCallback]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await generateAuthUrl({ teacherId });
      // Open Google OAuth in a new window
      window.open(authUrl, "_blank", "width=500,height=600");
    } catch (error) {
      console.error("Failed to generate auth URL:", error);
      setSyncStatus("Failed to start connection process");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncStatus("Syncing...");
    try {
      const result = await syncCalendar({
        teacherId,
        syncDirection: "both",
      });
      setSyncStatus(result.message);
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("Sync failed. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectCalendar({ teacherId });
      setSyncStatus("Disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setSyncStatus("Failed to disconnect");
    }
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const formatSyncDuration = (duration: number) => {
    return `${Math.round(duration / 1000)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Google Calendar Integration</h3>
              <p className="text-sm text-gray-600">Sync your lessons with Google Calendar</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            connection?.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {connection?.isActive ? "Connected" : "Not Connected"}
          </div>
        </div>

        {!connection?.isActive ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your Google Calendar to automatically sync your lessons and availability.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">Calendar ID</div>
                <div className="text-sm text-gray-900 font-mono">{connection.calendarId || "Primary"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">Last Sync</div>
                <div className="text-sm text-gray-900">{formatLastSync(connection.lastSyncAt)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600">Sync Direction</div>
                <div className="text-sm text-gray-900 capitalize">
                  {connection.syncSettings?.syncDirection || "Two-way"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSync}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>

            {syncStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                syncStatus.includes("success") || syncStatus.includes("ready")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : syncStatus.includes("failed") || syncStatus.includes("error")
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}>
                {syncStatus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync History */}
      {connection?.isActive && syncHistory && syncHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync History</h4>
          <div className="space-y-3">
            {syncHistory.map((sync: {
              _id: string;
              syncType: string;
              status: string;
              eventsProcessed: number;
              syncDuration: number;
              startedAt: number;
            }) => (
              <div key={sync._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    sync.status === "success" ? "bg-green-500" :
                    sync.status === "partial" ? "bg-yellow-500" : "bg-red-500"
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {sync.syncType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(sync.startedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {sync.eventsProcessed} events
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatSyncDuration(sync.syncDuration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Two-way Sync</div>
              <div className="text-xs text-gray-600">Import and export events between systems</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Automatic Reminders</div>
              <div className="text-xs text-gray-600">Get notifications for upcoming lessons</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Conflict Detection</div>
              <div className="text-xs text-gray-600">Avoid double-booking with smart scheduling</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Real-time Updates</div>
              <div className="text-xs text-gray-600">Changes sync instantly across platforms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 