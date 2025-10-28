"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Edit, Trash2, Send, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface PersonalNote {
  id: string;
  mon_an_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface VisitedEntryDetails {
  rating: number | null;
  notes: string | null;
}

interface UserFeedbackSectionProps {
  monAnId: string;
}

const StarRating = ({ rating, onRatingChange, disabled = false }: { rating: number | null, onRatingChange: (newRating: number) => void, disabled?: boolean }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(null)}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <Star className={cn(
            "h-6 w-6 transition-colors",
            (hoverRating || rating || 0) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )} />
        </button>
      ))}
    </div>
  );
};

export const UserFeedbackSection = ({ monAnId }: UserFeedbackSectionProps) => {
  const { user } = useSession();
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>([]);
  const [newPersonalNoteContent, setNewPersonalNoteContent] = useState('');
  const [editingPersonalNoteId, setEditingPersonalNoteId] = useState<string | null>(null);
  const [editingPersonalNoteContent, setEditingPersonalNoteContent] = useState('');

  const [visitedRating, setVisitedRating] = useState<number | null>(null);
  const [visitedNotes, setVisitedNotes] = useState('');
  const [isEditingVisited, setIsEditingVisited] = useState(false);
  const [hasVisitedEntry, setHasVisitedEntry] = useState(false); // To know if an entry exists in 'visited' table

  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchFeedback = useCallback(async () => {
    if (!user) {
      setPersonalNotes([]);
      setVisitedRating(null);
      setVisitedNotes('');
      setHasVisitedEntry(false);
      setLoadingFeedback(false);
      return;
    }
    setLoadingFeedback(true);
    try {
      // Fetch personal notes
      const { data: notesData, error: notesError } = await supabase
        .from('personal_notes')
        .select(`*`)
        .eq('mon_an_id', monAnId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setPersonalNotes(notesData || []);

      // Fetch visited entry
      const { data: visitedData, error: visitedError } = await supabase
        .from('visited')
        .select('rating, notes')
        .eq('mon_an_id', monAnId)
        .eq('user_id', user.id)
        .single();

      if (visitedError && visitedError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw visitedError;
      }

      if (visitedData) {
        setVisitedRating(visitedData.rating);
        setVisitedNotes(visitedData.notes || '');
        setHasVisitedEntry(true);
      } else {
        setVisitedRating(null);
        setVisitedNotes('');
        setHasVisitedEntry(false);
      }

    } catch (error: any) {
      console.error("Error fetching user feedback:", error);
      showError(`Lỗi khi tải phản hồi cá nhân: ${error.message}`);
    } finally {
      setLoadingFeedback(false);
    }
  }, [monAnId, user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Personal Notes Handlers
  const handleAddPersonalNote = async () => {
    if (!user || !newPersonalNoteContent.trim()) {
      showError('Vui lòng đăng nhập và nhập nội dung ghi chú.');
      return;
    }
    setSubmittingFeedback(true);
    const { data, error } = await supabase
      .from('personal_notes')
      .insert({ mon_an_id: monAnId, user_id: user.id, content: newPersonalNoteContent.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error adding personal note:", error);
      showError(`Lỗi khi thêm ghi chú: ${error.message}`);
    } else if (data) {
      setPersonalNotes(prev => [data, ...prev]);
      setNewPersonalNoteContent('');
      showSuccess('Đã thêm ghi chú cá nhân!');
    }
    setSubmittingFeedback(false);
  };

  const handleUpdatePersonalNote = async (noteId: string) => {
    if (!user || !editingPersonalNoteContent.trim()) {
      showError('Vui lòng nhập nội dung ghi chú.');
      return;
    }
    setSubmittingFeedback(true);
    const { error } = await supabase
      .from('personal_notes')
      .update({ content: editingPersonalNoteContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error updating personal note:", error);
      showError(`Lỗi khi cập nhật ghi chú: ${error.message}`);
    } else {
      setPersonalNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, content: editingPersonalNoteContent.trim(), updated_at: new Date().toISOString() } : note
      ));
      setEditingPersonalNoteId(null);
      setEditingPersonalNoteContent('');
      showSuccess('Đã cập nhật ghi chú cá nhân!');
    }
    setSubmittingFeedback(false);
  };

  const handleDeletePersonalNote = async (noteId: string) => {
    if (!user) {
      showError('Bạn cần đăng nhập để xóa ghi chú.');
      return;
    }
    setSubmittingFeedback(true);
    const { error } = await supabase
      .from('personal_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error deleting personal note:", error);
      showError(`Lỗi khi xóa ghi chú: ${error.message}`);
    } else {
      setPersonalNotes(prev => prev.filter(note => note.id !== noteId));
      showSuccess('Đã xóa ghi chú cá nhân!');
    }
    setSubmittingFeedback(false);
  };

  // Visited Feedback Handlers
  const handleSaveVisitedFeedback = async () => {
    if (!user) {
      showError('Bạn cần đăng nhập để lưu đánh giá.');
      return;
    }
    setSubmittingFeedback(true);

    const payload = {
      user_id: user.id,
      mon_an_id: monAnId,
      rating: visitedRating,
      notes: visitedNotes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (hasVisitedEntry) {
      const { error: updateError } = await supabase
        .from('visited')
        .update(payload)
        .eq('user_id', user.id)
        .eq('mon_an_id', monAnId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('visited')
        .insert(payload);
      error = insertError;
      if (!error) setHasVisitedEntry(true); // Mark as having an entry now
    }

    if (error) {
      console.error("Error saving visited feedback:", error);
      showError(`Lỗi khi lưu đánh giá: ${error.message}`);
    } else {
      showSuccess('Đã lưu đánh giá của bạn!');
      setIsEditingVisited(false);
    }
    setSubmittingFeedback(false);
  };

  const handleCancelVisitedEdit = () => {
    fetchFeedback(); // Re-fetch to revert changes
    setIsEditingVisited(false);
  };

  return (
    <Card className="mt-8">
      <Accordion type="single" collapsible defaultValue="user-feedback">
        <AccordionItem value="user-feedback">
          <CardHeader className="p-0">
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" /> Ghi chú & Đánh giá cá nhân
              </CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent className="px-6 pb-6">
            <CardContent className="p-0">
              {user ? (
                <>
                  {loadingFeedback ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Visited Rating & Notes Section */}
                      <div className="mb-8 border-b pb-6">
                        <h3 className="text-lg font-semibold mb-3">Đánh giá của bạn</h3>
                        <div className="space-y-2">
                          <StarRating 
                            rating={visitedRating} 
                            onRatingChange={setVisitedRating} 
                            disabled={!isEditingVisited} 
                          />
                          {isEditingVisited ? (
                            <Textarea
                              value={visitedNotes}
                              onChange={(e) => setVisitedNotes(e.target.value)}
                              placeholder="Ghi chú về trải nghiệm của bạn..."
                              rows={3}
                              disabled={submittingFeedback}
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px]">
                              {visitedNotes || 'Chưa có ghi chú về trải nghiệm.'}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          {isEditingVisited ? (
                            <>
                              <Button size="sm" onClick={handleSaveVisitedFeedback} disabled={submittingFeedback}>
                                {submittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu đánh giá
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelVisitedEdit} disabled={submittingFeedback}>
                                Hủy
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setIsEditingVisited(true)} disabled={submittingFeedback}>
                              {visitedRating || visitedNotes ? 'Sửa đánh giá' : 'Thêm đánh giá'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Personal Notes Section */}
                      <h3 className="text-lg font-semibold mb-3">Ghi chú riêng tư</h3>
                      <div className="mb-6 space-y-2">
                        <Textarea
                          placeholder="Viết ghi chú riêng tư về món ăn này..."
                          value={newPersonalNoteContent}
                          onChange={(e) => setNewPersonalNoteContent(e.target.value)}
                          rows={3}
                          disabled={submittingFeedback}
                        />
                        <Button onClick={handleAddPersonalNote} disabled={submittingFeedback || !newPersonalNoteContent.trim()}>
                          {submittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Send className="h-4 w-4 mr-2" /> Lưu ghi chú
                        </Button>
                      </div>

                      {personalNotes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Bạn chưa có ghi chú riêng tư nào cho món này.</p>
                      ) : (
                        <div className="space-y-4">
                          {personalNotes.map((note) => (
                            <div key={note.id} className="border rounded-lg p-4 bg-card">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: vi })}
                                </span>
                              </div>
                              {editingPersonalNoteId === note.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editingPersonalNoteContent}
                                    onChange={(e) => setEditingPersonalNoteContent(e.target.value)}
                                    rows={3}
                                    disabled={submittingFeedback}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleUpdatePersonalNote(note.id)} disabled={submittingFeedback || !editingPersonalNoteContent.trim()}>
                                      {submittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Lưu
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingPersonalNoteId(null)} disabled={submittingFeedback}>
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                                  <div className="flex gap-2 mt-3">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setEditingPersonalNoteId(note.id);
                                      setEditingPersonalNoteContent(note.content);
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
                                          <AlertDialogAction onClick={() => handleDeletePersonalNote(note.id)} disabled={submittingFeedback}>
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
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Đăng nhập để thêm ghi chú và đánh giá cá nhân của bạn!
                </p>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};