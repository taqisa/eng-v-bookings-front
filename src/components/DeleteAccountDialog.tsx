import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DeleteAccountDialog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (!user || confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);

    try {
      // Delete user's bookings first
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', user.id);

      if (bookingsError) {
        console.error('Error deleting bookings:', bookingsError);
        toast.error('Error deleting bookings');
        return;
      }

      // Delete user profile
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (userError) {
        console.error('Error deleting user:', userError);
        toast.error('Error deleting account');
        return;
      }

      await supabase.auth.signOut();

      toast.success('Account deleted successfully');
      navigate('/');

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account Permanently
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Confirm Account Deletion
          </DialogTitle>
          <DialogDescription className="text-left">
            This action cannot be undone. All your data and bookings will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-left">
            The following data will be deleted:
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Personal account information</li>
              <li>All past and future bookings</li>
              <li>Usage history</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">
              Type "DELETE" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmText !== "DELETE"}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;