"use client";

import { useState } from "react";
import { Download, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ExportProfileButtonProps {
  memberId: string;
  memberName: string;
  memberEmail: string;
}

export function ExportProfileButton({ memberId, memberName, memberEmail }: ExportProfileButtonProps) {
  const { toast } = useToast();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`${memberName}'s Profile from Point Blank`);
  const [emailBody, setEmailBody] = useState("");
  
  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberIds: [memberId] }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${memberName.replace(/\s+/g, '-').toLowerCase()}-profile.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Exported ${memberName}'s profile to PDF`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(memberEmail);
    
    toast({
      title: "Email copied",
      description: `${memberEmail} copied to clipboard`,
    });
  };
  
  const handleSendEmail = async () => {
    try {
      await fetch("/api/export/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberIds: [memberId],
          subject: emailSubject,
          body: emailBody,
        }),
      });
      
      setEmailDialogOpen(false);
      
      toast({
        title: "Email sent",
        description: `Email sent to ${memberName}`,
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${memberName}'s Developer Profile`,
        text: `Check out ${memberName}'s developer profile on Point Blank`,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Profile has been shared",
        });
      })
      .catch(() => {
        // User cancelled the share operation
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      
      toast({
        title: "Link copied",
        description: "Profile link copied to clipboard",
      });
    }
  };
  
  return (
    <div>
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 gap-2">
              <Download className="h-4 w-4" />
              Export Profile
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Copy Email
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleShareProfile}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {memberName}</DialogTitle>
            <DialogDescription>
              Compose an email to send to this developer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={memberEmail}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}