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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PersonalNote {
  id: string;
  mon_an_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PersonalNotesSectionProps {
  monAnId: string;
}

export const PersonalNotesSection = ({ monAnId }: PersonalNotesSectionProps) => {
  const { user } = useSession();
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_notes')
      .select(`*`)
      .eq('mon_an_id', monAnId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching personal notes:", error);
      showError('Lỗi khi tải ghi chú cá nhân.');
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  }, [monAnId, user]);

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
      .from('personal_notes')
      .insert({ mon_an_id: monAnId, user_id: user.id, content: newNoteContent.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error adding personal note:", error);
      showError(`Lỗi khi thêm ghi chú: ${error.message}`);
    } else if (data) {
      setNotes(prev => [data, ...prev]);
      setNewNoteContent('');
      showSuccess('Đã thêm ghi chú!');
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
      .from('personal_notes')
      .update({ content: editingNoteContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error updating personal note:", error);
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
      .from('personal_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting personal note:", error);
      showError(`Lỗi khi xóa ghi chú: ${error.message}`);
    } else {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      showSuccess('Đã xóa ghi chú!');
    }
    setSubmitting(false);
  };

  return (
    <Card className="mt-8">
      <Accordion type="single" collapsible defaultValue="personal-notes">
        <AccordionItem value="personal-notes">
          <CardHeader className="p-0">
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" /> Ghi chú cá nhân
              </CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent className="px-6 pb-6">
            <CardContent className="p-0">
              {user ? (
                <>
                  <div className="mb-6 space-y-2">
                    <Textarea
                      placeholder="Viết ghi chú riêng tư về món ăn này..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      disabled={submitting}
                    />
                    <Button onClick={handleAddNote} disabled={submitting || !newNoteContent.trim()}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="h-4 w-4 mr-2" /> Lưu ghi chú
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Bạn chưa có ghi chú nào cho món này.</p>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4 bg-card">
                          <div className="flex justify-between items-center mb-2">
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
                                <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)} disabled={submitting}>
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
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
                                        Hành động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteNote(note.id)} disabled={submitting}>
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Đăng nhập để thêm ghi chú cá nhân của bạn!
                </p>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};