import React, { useState, useEffect } from 'react';
import {
  NavTab,
  DocumentItem,
  ReminderItem,
  QuestionItem,
  UserProfile,
  UserPreferences,
  ToastMessage,
  IdentifiedInstruction,
} from './types';
import {
  INITIAL_PROFILE,
  INITIAL_PREFERENCES,
  INITIAL_DOCUMENTS,
  INITIAL_REMINDERS,
  INITIAL_QUESTIONS,
} from './data/mockData';
import {
  loadDocuments,
  saveDocument,
  persistDocuments,
  syncDocumentsFromBackend,
} from './services/documentService';
import {
  loadReminders,
  saveReminder,
  updateReminder,
  deleteReminder,
  toggleReminderCompletion,
  syncRemindersFromBackend,
  getTodayDateString,
  enrichReminder,
} from './services/reminderService';
import {
  loadQuestions,
  addQuestion,
  addQuestionsFromAI,
  toggleQuestion,
  deleteQuestion,
  saveQuestions,
  syncQuestionsFromBackend,
} from './services/questionService';
import { checkBackendHealth } from './services/api/apiClient';
import { NotificationService } from './services/notifications/notificationService';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RemindersPage } from './pages/RemindersPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ScanModal } from './components/modals/ScanModal';
import { AddReminderModal } from './components/modals/AddReminderModal';
import { ReviewReminderModal } from './components/modals/ReviewReminderModal';
import { AddQuestionModal } from './components/modals/AddQuestionModal';
import { DocumentDetailModal } from './components/modals/DocumentDetailModal';
import { DeleteReminderModal } from './components/modals/DeleteReminderModal';
import { DeleteQuestionModal } from './components/modals/DeleteQuestionModal';
import { CaregiverHandoffModal } from './components/handoff/CaregiverHandoffModal';
import { ReceiveHandoffModal } from './components/handoff/ReceiveHandoffModal';
import { CaregiverDashboardModal } from './components/handoff/CaregiverDashboardModal';
import { CaregiverHandoffData } from './types/handoff';
import { Toast } from './components/ui/Toast';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Core Data States (Local-First initialization)
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadDocuments());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => loadReminders());
  const [questions, setQuestions] = useState<QuestionItem[]>(() => loadQuestions());
  const [profile] = useState<UserProfile>(INITIAL_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);

  // Modal Control States
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<ReminderItem | null>(null);
  const [reviewingInstruction, setReviewingInstruction] = useState<{
    instruction: IdentifiedInstruction;
    docTitle?: string;
  } | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState<boolean>(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentItem | null>(null);

  // Cross-Device Caregiver Handoff States
  const [isHandoffOpen, setIsHandoffOpen] = useState<boolean>(false);
  const [isReceiveHandoffOpen, setIsReceiveHandoffOpen] = useState<boolean>(false);
  const [activeHandoffData, setActiveHandoffData] = useState<CaregiverHandoffData | null>(null);

  // Sync and Network Status
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (
    type: ToastMessage['type'],
    title: string,
    message?: string,
    actionText?: string,
    onAction?: () => void
  ) => {
    setToast({
      id: `toast-${Date.now()}`,
      type,
      title,
      message,
      actionText,
      onAction,
    });
  };

  // Sync data on mount: local-first instant render + background API sync
  useEffect(() => {
    async function initDataSync() {
      setIsSyncing(true);
      try {
        const isOnline = await checkBackendHealth();
        if (isOnline) {
          const [syncedDocs, syncedRems, syncedQuestions] = await Promise.all([
            syncDocumentsFromBackend(),
            syncRemindersFromBackend(),
            syncQuestionsFromBackend(),
          ]);
          if (syncedDocs.length > 0) setDocuments(syncedDocs);
          if (syncedRems.length > 0) setReminders(syncedRems);
          if (syncedQuestions.length > 0) setQuestions(syncedQuestions);
        }
      } catch {
        // Safe offline fallback
      } finally {
        setIsSyncing(false);
      }
    }
    initDataSync();
  }, []);

  // Periodic safe check for due reminders and notifications
  useEffect(() => {
    NotificationService.checkDueReminders(reminders, preferences.soundAlerts);

    const interval = setInterval(() => {
      NotificationService.checkDueReminders(reminders, preferences.soundAlerts);
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders, preferences.soundAlerts]);

  // 1. Reminder Actions with Local-First Persistence & Undo
  const handleToggleReminder = (id: string) => {
    const { reminders: updatedList, isCompleted, reminder } = toggleReminderCompletion(id);
    setReminders(updatedList);

    if (reminder) {
      if (isCompleted) {
        showToast(
          'success',
          'Routine Completed!',
          `${reminder.title} marked complete for today.`,
          'Undo',
          () => {
            const { reminders: reverted } = toggleReminderCompletion(id);
            setReminders(reverted);
            showToast('info', 'Undone', `${reminder.title} marked as uncompleted.`);
          }
        );
      } else {
        showToast(
          'info',
          'Marked Incomplete',
          `${reminder.title} set back to upcoming.`,
          'Undo',
          () => {
            const { reminders: reverted } = toggleReminderCompletion(id);
            setReminders(reverted);
            showToast('success', 'Routine Completed!', `${reminder.title} marked complete.`);
          }
        );
      }
    }
  };

  const handleSaveReminder = (reminder: ReminderItem) => {
    if (editingReminder) {
      const updated = updateReminder(reminder);
      setReminders(updated);
      showToast('success', 'Routine Updated', `Changes to "${reminder.title}" saved.`);
      setEditingReminder(null);
    } else {
      const updated = saveReminder(reminder);
      setReminders(updated);
      showToast('success', 'Routine Created & Saved', `"${reminder.title}" scheduled for ${reminder.time}.`);
    }
  };

  const handleDeleteReminder = (id: string) => {
    const updated = deleteReminder(id);
    setReminders(updated);
    showToast('info', 'Reminder Deleted', 'The routine has been removed from your schedule.');
    setDeletingReminder(null);
  };

  // 2. Question Actions with Local-First Persistence & Undo
  const handleToggleQuestion = (id: string) => {
    const { questions: updated, toggledQuestion } = toggleQuestion(id);
    setQuestions(updated);

    if (toggledQuestion) {
      const isResolved = toggledQuestion.resolved;
      showToast(
        'success',
        isResolved ? 'Marked as Discussed' : 'Question Reactivated',
        isResolved ? 'Clarified with healthcare professional' : 'Ready for next consultation',
        'Undo',
        () => {
          const { questions: reverted } = toggleQuestion(id);
          setQuestions(reverted);
          showToast('info', 'Status Reverted', 'Question status restored.');
        }
      );
    }
  };

  const handleAddQuestion = (newQuestion: QuestionItem) => {
    const updated = addQuestion(newQuestion);
    setQuestions(updated);
    showToast('success', 'Question Saved', 'Added to your doctor consultation list.');
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = deleteQuestion(id);
    setQuestions(updated);
    showToast('info', 'Question Deleted', 'Removed from your consultation list.');
    setDeletingQuestion(null);
  };

  // 3. Scan & Understand Completion Action + Auto-Ingest Questions
  const handleCompleteScan = (newDoc: DocumentItem) => {
    // Save document to documents state and local/backend persistence
    const updatedDocs = saveDocument(newDoc);
    setDocuments(updatedDocs);

    // Ingest doctor questions if present in AI analysis
    let questionsMsg = '';
    if (newDoc.analysis?.questionsForProfessional && newDoc.analysis.questionsForProfessional.length > 0) {
      const { updatedQuestions, addedCount } = addQuestionsFromAI(
        newDoc.analysis.questionsForProfessional,
        newDoc.title,
        newDoc.id
      );
      if (addedCount > 0) {
        setQuestions(updatedQuestions);
        questionsMsg = ` and added ${addedCount} doctor questions`;
      }
    }

    showToast(
      'success',
      'Document Saved',
      `"${newDoc.title}" saved${questionsMsg}.`
    );
    setActiveTab('documents');
  };

  // 4. View Document Source
  const handleViewDocumentSource = (sourceDocTitle: string, sourceDocId?: string) => {
    const foundDoc =
      documents.find((d) => d.id === sourceDocId || d.title.toLowerCase().includes(sourceDocTitle.toLowerCase())) ||
      documents[0];

    if (foundDoc) {
      setSelectedDocDetail(foundDoc);
    } else {
      showToast('warning', 'Source Document', `Document "${sourceDocTitle}" is archived or unavailable.`);
    }
  };

  // 5. Reset Demo State Handler
  const handleResetDemo = () => {
    const todayStr = getTodayDateString();
    const freshReminders: ReminderItem[] = INITIAL_REMINDERS.map((r, idx) => ({
      ...r,
      startDate: todayStr,
      createdAt: todayStr,
      completedDates: idx === 0 || idx === 1 ? [todayStr] : [],
      isDemo: true,
    }));
    persistDocuments(INITIAL_DOCUMENTS);
    localStorage.setItem('carebuddy_saved_reminders', JSON.stringify(freshReminders));
    saveQuestions(INITIAL_QUESTIONS);

    setDocuments(INITIAL_DOCUMENTS);
    setReminders(freshReminders.map((r) => enrichReminder(r, todayStr)));
    setQuestions(INITIAL_QUESTIONS);
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenScan={() => setIsScanOpen(true)}
            onOpenAddReminder={() => {
              setEditingReminder(null);
              setIsAddReminderOpen(true);
            }}
            onOpenDocDetail={(doc) => setSelectedDocDetail(doc)}
            onOpenReminderSchedule={(instruction, docTitle) => {
              setReviewingInstruction({ instruction, docTitle });
            }}
            onOpenHandoff={() => setIsHandoffOpen(true)}
            onOpenReceiveHandoff={() => setIsReceiveHandoffOpen(true)}
            documents={documents}
            reminders={reminders}
            questions={questions}
          />
        );
      case 'documents':
        return (
          <DocumentsPage
            documents={documents}
            onOpenScan={() => setIsScanOpen(true)}
            onOpenDocDetail={(doc) => setSelectedDocDetail(doc)}
          />
        );
      case 'reminders':
        return (
          <RemindersPage
            reminders={reminders}
            onToggleComplete={handleToggleReminder}
            onOpenAddReminder={() => {
              setEditingReminder(null);
              setIsAddReminderOpen(true);
            }}
            onEditReminder={(r) => {
              setEditingReminder(r);
              setIsAddReminderOpen(true);
            }}
            onDeleteReminder={(r) => setDeletingReminder(r)}
            onViewSourceDoc={handleViewDocumentSource}
          />
        );
      case 'questions':
        return (
          <QuestionsPage
            questions={questions}
            onToggleResolved={handleToggleQuestion}
            onOpenAddQuestion={() => setIsAddQuestionOpen(true)}
            onDeleteQuestion={(q) => setDeletingQuestion(q)}
            onViewSourceDoc={handleViewDocumentSource}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            preferences={preferences}
            onUpdatePreferences={(newPrefs) => setPreferences((prev) => ({ ...prev, ...newPrefs }))}
            onShowToast={(title, msg) => showToast('info', title, msg)}
            onResetDemo={handleResetDemo}
            onOpenHandoff={() => setIsHandoffOpen(true)}
            onOpenReceiveHandoff={() => setIsReceiveHandoffOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      isSyncing={isSyncing}
      onOpenNotifications={() => showToast('info', 'Notifications', 'All routines are on schedule for today.')}
      onOpenHandoff={() => setIsHandoffOpen(true)}
      onOpenReceiveHandoff={() => setIsReceiveHandoffOpen(true)}
    >
      {renderCurrentPage()}

      {/* Global Modals */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onComplete={handleCompleteScan}
        onSaveCustomReminder={(confirmedReminder) => {
          handleSaveReminder(confirmedReminder);
          setActiveTab('reminders');
        }}
      />

      <AddReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => {
          setIsAddReminderOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
        initialReminder={editingReminder}
      />

      {/* Review Reminder Modal triggered from Smart Insights */}
      {reviewingInstruction && (
        <ReviewReminderModal
          isOpen={!!reviewingInstruction}
          onClose={() => setReviewingInstruction(null)}
          sourceInstruction={reviewingInstruction.instruction}
          sourceDocTitle={reviewingInstruction.docTitle || 'Healthcare Document'}
          onConfirmSave={(confirmedReminder) => {
            handleSaveReminder(confirmedReminder);
            setReviewingInstruction(null);
            setActiveTab('reminders');
          }}
        />
      )}

      <DeleteReminderModal
        isOpen={!!deletingReminder}
        reminder={deletingReminder}
        onClose={() => setDeletingReminder(null)}
        onConfirmDelete={handleDeleteReminder}
      />

      <AddQuestionModal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        onSave={handleAddQuestion}
        availableDocs={documents.map((d) => d.title)}
      />

      <DeleteQuestionModal
        isOpen={!!deletingQuestion}
        question={deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirmDelete={handleDeleteQuestion}
      />

      <DocumentDetailModal
        isOpen={!!selectedDocDetail}
        document={selectedDocDetail}
        onClose={() => setSelectedDocDetail(null)}
        onCreateReminderFromDoc={(doc) => {
          if (doc.instructions && doc.instructions.length > 0) {
            const first = doc.instructions[0];
            const newReminder: ReminderItem = {
              id: `rem-${Date.now()}`,
              title: first.action,
              instruction: first.details,
              time: '08:00 AM',
              frequency: 'Once daily',
              startDate: getTodayDateString(),
              createdAt: getTodayDateString(),
              completedDates: [],
              tag: doc.category,
              category: 'medication',
              sourceDocumentId: doc.id,
              sourceDocumentTitle: doc.title,
              isDemo: false,
            };
            handleSaveReminder(newReminder);
            setActiveTab('reminders');
          }
        }}
      />

      {/* Cross-Device Caregiver Handoff Modals */}
      <CaregiverHandoffModal
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
        patientName={profile.name}
        documents={documents}
        reminders={reminders}
        questions={questions}
      />

      <ReceiveHandoffModal
        isOpen={isReceiveHandoffOpen}
        onClose={() => setIsReceiveHandoffOpen(false)}
        onHandoffLoaded={(data) => {
          setActiveHandoffData(data);
          showToast('success', 'Care Handoff Loaded', `Displaying care plan for ${data.patientName}`);
        }}
      />

      <CaregiverDashboardModal
        isOpen={!!activeHandoffData}
        onClose={() => setActiveHandoffData(null)}
        data={activeHandoffData}
      />

      {/* Floating Toast Alert with Action/Undo */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  );
};

export default App;
