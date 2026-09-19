import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DocumentCard } from '../components/ui/DocumentCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { SafetyBanner } from '../components/layout/SafetyBanner';
import {
  Camera,
  Upload,
  Plus,
  FileText,
  Search
} from 'lucide-react';
import { DocumentItem, DocumentStatus } from '../types';

interface DocumentsPageProps {
  documents: DocumentItem[];
  onOpenScan: () => void;
  onOpenDocDetail: (doc: DocumentItem) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  documents,
  onOpenScan,
  onOpenDocDetail,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | DocumentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewState, setActivePreviewState] = useState<'normal' | 'loading' | 'error'>('normal');

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Your Documents"
        subtitle="Organize your healthcare information"
        action={
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenScan}
            icon={<Plus className="w-4 h-4" />}
          >
            Scan & Understand
          </Button>
        }
      />

      {/* Quick Action Banner */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          hoverable
          onClick={onOpenScan}
          className="p-3.5 text-center border-dashed border-warm-300 bg-warm-100/40 hover:bg-warm-100/70 flex flex-col items-center justify-center cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-warm-200 text-coffee-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-warm-900">Scan Prescription</span>
          <span className="text-[10px] text-warm-500 mt-0.5">Camera / Photo</span>
        </Card>

        <Card
          hoverable
          onClick={onOpenScan}
          className="p-3.5 text-center border-dashed border-caramel-300/80 bg-caramel-50/40 hover:bg-caramel-50/70 flex flex-col items-center justify-center cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-caramel-100 text-coffee-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-warm-900">Upload Care Plan</span>
          <span className="text-[10px] text-warm-500 mt-0.5">PDF or File</span>
        </Card>
      </div>

      {/* Search & Status Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-warm-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or doctors..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-warm-200 bg-white text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coffee-500/15 focus:border-coffee-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['all', 'ready', 'uploaded', 'processing'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-coffee-800 text-warm-50 shadow-2xs'
                  : 'bg-white text-warm-700 border border-warm-200 hover:bg-warm-100/60'
              }`}
            >
              {filter === 'all' ? 'All Documents' : filter === 'ready' ? 'Ready to Review' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* State Preview Switches for Demo */}
      <div className="flex items-center justify-between px-1 text-[11px] text-warm-500">
        <span>UI State Mode:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePreviewState('normal')}
            className={`font-semibold cursor-pointer ${activePreviewState === 'normal' ? 'text-coffee-800 underline' : 'text-warm-500 hover:text-warm-700'}`}
          >
            Normal List
          </button>
          <span>•</span>
          <button
            onClick={() => setActivePreviewState('loading')}
            className={`font-semibold cursor-pointer ${activePreviewState === 'loading' ? 'text-coffee-800 underline' : 'text-warm-500 hover:text-warm-700'}`}
          >
            Processing State
          </button>
          <span>•</span>
          <button
            onClick={() => setActivePreviewState('error')}
            className={`font-semibold cursor-pointer ${activePreviewState === 'error' ? 'text-coffee-800 underline' : 'text-warm-500 hover:text-warm-700'}`}
          >
            Error State
          </button>
        </div>
      </div>

      {/* Conditional UI States */}
      {activePreviewState === 'loading' && (
        <LoadingState
          title="Extracting Healthcare Document..."
          description="Optical text recognition is reading instructions and categorizing care routines."
        />
      )}

      {activePreviewState === 'error' && (
        <ErrorState
          title="Document Could Not Be Read Clearly"
          description="Information unclear. Please verify with your healthcare professional."
          onRetry={() => setActivePreviewState('normal')}
        />
      )}

      {activePreviewState === 'normal' && (
        <>
          {filteredDocs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => onOpenDocDetail(doc)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-6 h-6 text-warm-400" />}
              title="No documents found"
              description="No healthcare documents match your search or selected filter."
              actionText="Scan a Document"
              onAction={onOpenScan}
            />
          )}
        </>
      )}

      <SafetyBanner />
    </div>
  );
};
