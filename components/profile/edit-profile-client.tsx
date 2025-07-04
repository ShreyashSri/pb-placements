"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfileClient({ member }: { member: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    domain: member.domain,
    year_of_study: member.year_of_study,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: {
            id: member.id,
            name: formData.name,
            email: formData.email,
            domain: formData.domain,
            year_of_study: formData.year_of_study,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      router.push(`/profile/${member.id}`);
    } catch (err) {
      setSaving(false);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Domain</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={e => setFormData({ ...formData, domain: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Year of Study</label>
          <input
            type="number"
            name="year_of_study"
            value={formData.year_of_study}
            onChange={e => setFormData({ ...formData, year_of_study: e.target.value })}
            className="w-full border rounded px-3 py-2"
            min={1}
            max={10}
          />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
} 