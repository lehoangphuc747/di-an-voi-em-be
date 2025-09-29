"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  author_first_name?: string | null; // Thêm trường này để lưu tên tác giả
  author_last_name?: string | null;  // Thêm trường này để lưu họ tác giả
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

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const { data: notesData, error: notesError } = await supabase
      .from('public_notes')
      .select(`id, mon_an_id, user_id, content, created_at, updated_at`) // Chỉ chọn các trường trực tiếp của ghi chú
      .eq('mon_an_id', monAnId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error("Error fetching public notes:", notesError);
      showError('Lỗi khi tải ghi chú công khai.');
      setNotes([]);
      setLoading(false);
      return;
    }

    if (!notesData || notesData.length === 0) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Lấy tất cả các user_id duy nhất từ các ghi chú
    const uniqueUserIds = [...new Set(notesData.map(note => note.user_id))];

    // Lấy thông tin hồ sơ cho các user_id này
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', uniqueUserIds);

    if (profilesError) {
      console.error("Error fetching profiles for notes:", profilesError);
      showError('Lỗi khi tải thông tin người dùng cho ghi chú.');
      // Tiếp tục với ghi chú mà không có dữ liệu hồ sơ nếu có lỗi
      setNotes(notesData.map(note => ({ ...note, author_first_name: null, author_last_name: null })));
      setLoading(false);
      return;
    }

    const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

    // Ghép thông tin hồ sơ vào ghi chú
    const mergedNotes: PublicNote[] = notesData.map(note => {
      const profile = profilesMap.get(note.user_id);
      return {
        ...note,
        author_first_name: profile?.first_name || null,
        author_last_name: profile?.last_name || null,
      };
    });

    setNotes(mergedNotes);
    setLoading(false);
  }, [monAnId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async () => {
    if (!user || !newNoteContent.trim()) {
      showError('Vui lòng đăng nhập và nhập nội dung ghi chú.');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('public_notes')
      .insert({ mon_an_id: monAnId, user_id: user.id, content: newNoteContent.trim() })
      .select(`id, mon_an_id, user_id, content, created_at, updated_at`) // Chọn các trường trực tiếp
      .single();

    if (error) {
      console.error("Error adding public note:", error);
      showError(`Lỗi khi thêm ghi chú: ${error.message}`);
    } else if (data) {
      // Sau khi thêm thành công, chúng ta cần lấy lại thông tin profile cho ghi chú mới
      // hoặc thêm thủ công nếu profile của user hiện tại đã có sẵn
      const newNoteWithProfile: PublicNote = {
        ...data,
        author_first_name: user.user_metadata.first_name || null, // Giả định user_metadata có first_name
        author_last_name: user.user_metadata.last_name || null,   // Giả định user_metadata có last_name
      };
      setNotes(prev => [newNoteWithProfile, ...prev]);
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
      showError(`Lỗi khi cập nhật ghi chú: ${error.message}`);
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
      showError(`Lỗi khi xóa ghi chú: ${error.message}`);
    } else {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      showSuccess('Đã xóa ghi chú!');
    }
    setSubmitting(false);
  };

  const getDisplayName = (note: PublicNote) => {
    if (note.author_first_name || note.author_last_name) {
      return `${note.author_first_name || ''} ${note.author_last_name || ''}`.trim();
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