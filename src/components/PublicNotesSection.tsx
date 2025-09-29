"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Edit, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PublicNote {
  id: string;
  mon_an_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Array<{ // Thay đổi để chấp nhận mảng các profile
    first_name: string | null;
    last_name: string | null;
  }> | null; // Có thể là null nếu không có profile
}

interface PublicNotesSectionProps {
  monAnId: string;
}

export const PublicNotesSection = ({ monAnId }: PublicNotesSectionProps) => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_notes')
      .select(`
        id,
        mon_an_id,
        user_id,
        content,
        created_at,
        updated_at,
        profiles (first_name, last_name)
      `)
      .eq('mon_an_id', monAnId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching public notes:", error);
      showError('Lỗi khi tải ghi chú công khai.');
      setNotes([]);
    } else {
      // Ép kiểu an toàn hơn bằng cách chuyển đổi qua unknown trước
      setNotes(data as unknown as PublicNote[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [monAnId]);

  const handleAddNote = async () => {
    if (!user || !newNoteContent.trim()) {
      showError('Vui lòng đăng nhập và nhập nội dung ghi chú.');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('public_notes')
      .insert({ mon_an_id: monAnId, user_id: user.id, content: newNoteContent.trim() })
      .select(`
        id,
        mon_an_id,
        user_id,
        content,
        created_at,
        updated_at,
        profiles (first_name, last_name)
      `)
      .single();

    if (error) {
      console.error("Error adding public note:", error);
      showError('Lỗi khi thêm ghi chú.');
    } else if (data) {
      // Ép kiểu an toàn hơn bằng cách chuyển đổi qua unknown trước
      setNotes(prev => [data as unknown as PublicNote, ...prev]);
      setNewNoteContent('');
      showSuccess('Đã thêm ghi chú công khai!');
    }
    setSubmitting(false);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!user || !editingNoteContent.trim()) {
      showError('Vui lòng nhập nội dung ghi chú.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('public_notes')
      .update({ content: editingNoteContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error updating public note:", error);
      showError('Lỗi khi cập nhật ghi chú.');
    } else {
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, content: editingNoteContent.trim(), updated_at: new Date().toISOString() } : note
      ));
      setEditingNoteId(null);
      setEditingNoteContent('');
      showSuccess('Đã cập nhật ghi chú!');
    }
    setSubmitting(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để xóa ghi chú.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('public_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting public note:", error);
      showError('Lỗi khi xóa ghi chú.');
    } else {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      showSuccess('Đã xóa ghi chú!');
    }
    setSubmitting(false);
  };

  const getDisplayName = (note: PublicNote) => {
    // Truy cập phần tử đầu tiên của mảng profiles một cách an toàn
    const profile = note.profiles?.[0]; 
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return 'Người dùng ẩn danh';
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Ghi chú công khai
        </CardTitle>
      </CardHeader>
      <CardContent>
        {user && (
          <div className="mb-6 space-y-2">
            <Textarea
              placeholder="Viết ghi chú công khai về món ăn này..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            <Button onClick={handleAddNote} disabled={submitting || !newNoteContent.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4 mr-2" /> Gửi ghi chú
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="sr-only">Đang tải ghi chú...</span>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Chưa có ghi chú công khai nào. Hãy là người đầu tiên!</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 bg-card">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{getDisplayName(note)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      rows={3}
                      disabled={submitting}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateNote(note.id)} disabled={submitting || !editingNoteContent.trim()}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditingNoteId(null);
                        setEditingNoteContent('');
                      }} disabled={submitting}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                )}
                
                {user && user.id === note.user_id && editingNoteId !== note.id && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingNoteId(note.id);
                      setEditingNoteContent(note.content);
                    }}>
                      <Edit className="h-4 w-4 mr-2" /> Sửa
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa ghi chú này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Ghi chú sẽ bị xóa vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteNote(note.id)} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};