"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface ParsedData {
  id: string;
  name: string;
  email: string;
  skills: string[];
  domain?: string;
  year?: number;
  achievements: string[];
  experiences: {
    company: string;
    role: string;
    description: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
  }[];
  github_url?: string;
  linkedin_url?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    domain: "",
    year_of_study: "",
    github_url: "",
    linkedin_url: "",
    experiences: [] as ParsedData['experiences'],
    achievements: [] as string[],
  });

  useEffect(() => {
    // Read parsed data from localStorage
    const parsed = localStorage.getItem('parsed_resume');
    if (parsed) {
      const data = JSON.parse(parsed);
      setParsedData({
        id: data.id || '',
        name: data.name || '',
        email: data.email || '',
        skills: data.skills || [],
        domain: data.domain || '',
        year: data.year || undefined,
        achievements: data.achievements || [],
        experiences: data.experiences || [],
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
      });
      setFormData({
        name: data.name || '',
        email: data.email || '',
        domain: data.domain || '',
        year_of_study: data.year?.toString() || '',
        github_url: data.github_url ? (data.github_url.startsWith('http') ? data.github_url : `https://${data.github_url}`) : '',
        linkedin_url: data.linkedin_url ? (data.linkedin_url.startsWith('http') ? data.linkedin_url : `https://${data.linkedin_url}`) : '',
        experiences: data.experiences || [],
        achievements: data.achievements || [],
      });
      setLoading(false);
    } else {
      router.push('/upload');
    }
  }, [router]);

  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          company: '',
          role: '',
          description: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          is_current: false
        }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Profile picture must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const memberId = localStorage.getItem('user_id');
      if (!memberId) throw new Error('User ID not found');

      let pictureUrl = '';
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${memberId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, profilePicture);

        if (uploadError) throw new Error('Failed to upload profile picture');

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName);
        
        pictureUrl = publicUrl;
      }

      // 1. Create or update member
      const memberPayload = {
        id: memberId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        domain: formData.domain.trim(),
        year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
        picture_url: pictureUrl,
      };
      console.log('Saving member data:', memberPayload);
      
      const memberRes = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberPayload),
      });
      const memberData = await memberRes.json();
      if (!memberRes.ok) throw new Error(memberData.error || 'Failed to save member');

      // 1.5. Save links (GitHub and LinkedIn)
      const linksToSave = [];
      if (formData.github_url) {
        linksToSave.push({ name: 'GitHub', url: formData.github_url });
      }
      if (formData.linkedin_url) {
        linksToSave.push({ name: 'LinkedIn', url: formData.linkedin_url });
      }
      if (linksToSave.length > 0) {
        await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: memberId, links: linksToSave }),
        });
      }

      // 2. Save skills
      if (parsedData?.skills?.length) {
        await fetch('/api/member-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: memberId, skills: parsedData.skills }),
        });
      }

      // 3. Save experiences
      if (parsedData?.experiences?.length) {
        await fetch('/api/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: memberId, experiences: parsedData.experiences }),
        });
      }

      // 4. Save achievements
      if (parsedData?.achievements?.length) {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: memberId, achievements: parsedData.achievements }),
        });
      }

      toast({
        title: 'Profile created successfully',
        description: 'Your profile has been created and is now visible in the directory.',
      });
      router.push(`/profile/${memberId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Confirm Your Profile</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Review and confirm the information we extracted from your resume.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Please review and update your information before creating your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              
              {/* Profile Picture Upload */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="profile-picture">Profile Picture</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                      {picturePreview ? (
                        <img
                          src={picturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a profile picture (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, domain: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year of Study</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1"
                    max="5"
                    value={4 - Number(formData.year_of_study)}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, year_of_study: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Skills Section */}
            {parsedData?.skills && parsedData.skills.length > 0 && (
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Experiences Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Work Experience</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Experience
                </Button>
              </div>
              <div className="space-y-4">
                {formData.experiences.map((exp, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                              value={exp.role}
                              onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                              placeholder="Job title"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={exp.start_date}
                              onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={exp.end_date || ''}
                                onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                                disabled={exp.is_current}
                              />
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`current-${index}`}
                                  checked={exp.is_current}
                                  onCheckedChange={(checked) => 
                                    handleExperienceChange(index, 'is_current', checked as boolean)
                                  }
                                />
                                <Label htmlFor={`current-${index}`}>Current</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperience(index)}
                        className="ml-2"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Achievements Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Achievements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAchievement}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Achievement
                </Button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={achievement}
                      onChange={(e) => handleAchievementChange(index, e.target.value)}
                      placeholder="Enter your achievement"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievement(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/upload")}
            >
              Back
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating Profile..." : "Create Profile"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}