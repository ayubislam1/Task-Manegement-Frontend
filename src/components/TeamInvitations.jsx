import React, { useState, useEffect } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, User, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import useAxiosSecure from "../hooks/useAxiosSecure";

const TeamInvitations = ({ dashboardId }) => {
  const { user } = useAuth();
  const { activeDashboard } = useDashboard();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosSecure();

  // Fetch pending invitations for the current dashboard
  const fetchInvitations = async () => {
    if (!dashboardId || !user?.email) return;

    try {
      setLoading(true);
      const response = await axiosSecure.get(`/dashboard-invites/${dashboardId}`);
      setInvitations(response.data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load pending invitations");
    } finally {
      setLoading(false);
    }
  };

  // Cancel an invitation
  const cancelInvitation = async (inviteId) => {
    if (!inviteId || !dashboardId) return;

    try {
      setLoading(true);
      await axiosSecure.delete(`/dashboard-invites/${inviteId}`);
      
      // Update local state
      setInvitations(prev => prev.filter(inv => inv._id !== inviteId));
      toast.success("Invitation cancelled successfully");
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    } finally {
      setLoading(false);
    }
  };

  // Resend an invitation
  const resendInvitation = async (inviteId) => {
    if (!inviteId || !dashboardId) return;

    try {
      setLoading(true);
      await axiosSecure.post(`/dashboard-invites/${inviteId}/resend`);
      toast.success("Invitation resent successfully");
      
      // Refresh the invitations list
      fetchInvitations();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setLoading(false);
    }
  };

  // Fetch invitations when component mounts or dashboardId changes
  useEffect(() => {
    fetchInvitations();
  }, [dashboardId, user?.email]);

  // Check if current user is an admin of this dashboard (to control permissions)
  const isCurrentUserAdmin = activeDashboard?.members?.some(
    (member) => member.email === user?.email && member.role === "Admin"
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (!isCurrentUserAdmin) {
    return null; // Only admins can see pending invitations
  }

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Mail className="mr-2 h-5 w-5 text-indigo-500" />
          Pending Invitations
        </h3>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchInvitations}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((invite) => (
            <div 
              key={invite._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
            >
              <div className="mb-2 sm:mb-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{invite.invitedEmail}</span>
                  <Badge variant={invite.status === 'pending' ? 'outline' : 'secondary'} className="text-xs">
                    {invite.status === 'pending' ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : invite.status === 'accepted' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                  </Badge>
                  <Badge variant={invite.role === 'Admin' ? 'default' : 'outline'} className="text-xs">
                    {invite.role === 'Admin' ? (
                      <Shield className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {invite.role}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span>Sent {formatDate(invite.createdAt)}</span>
                  {invite.invitedBy && (
                    <span> by {invite.invitedBy.name || invite.invitedBy.email}</span>
                  )}
                </div>
              </div>
              
              {invite.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendInvitation(invite._id)}
                    disabled={loading}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Resend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => cancelInvitation(invite._id)}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No pending invitations</p>
        </div>
      )}
    </Card>
  );
};

export default TeamInvitations; 