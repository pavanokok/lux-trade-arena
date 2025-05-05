
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountDialog = ({ isOpen, onClose }: DeleteAccountDialogProps) => {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('You must be logged in to delete your account');
        onClose();
        navigate('/login');
        return;
      }

      const userId = sessionData.session.user.id;

      // Delete all user data
      await Promise.all([
        // Delete user trades
        supabase.from('trades').delete().eq('user_id', userId),
        
        // Delete user portfolio
        supabase.from('portfolio').delete().eq('user_id', userId),
        
        // Delete user data in other tables as needed
        // Add more tables as needed
      ]);

      // Delete the user account itself
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted successfully', {
        description: 'We hope to see you again soon!'
      });
      
      onClose();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(`Failed to delete account: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and all your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-destructive">
              Please type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="border-destructive focus:ring-destructive"
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={confirmation !== 'DELETE' || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
