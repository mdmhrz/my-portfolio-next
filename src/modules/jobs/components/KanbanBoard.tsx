'use client';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { JobApplicationData } from '@/store/usePortfolioStore';
import { JobCard } from './JobCard';
import { JOB_STATUSES } from './job-constants';

interface KanbanBoardProps {
  jobs: JobApplicationData[];
  onOpenDetail: (job: JobApplicationData) => void;
  onEdit: (job: JobApplicationData) => void;
  onDelete: (job: JobApplicationData) => void;
  onStatusChange: (job: JobApplicationData, status: string) => void;
  onMove: (jobId: string, destStatus: string, overJobId: string | null) => void;
}

export function KanbanBoard({ jobs, onOpenDetail, onEdit, onDelete, onStatusChange, onMove }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const overIsColumn = overId.startsWith('column-');
    const destStatus = overIsColumn ? overId.replace('column-', '') : jobs.find((j) => j.id === overId)?.status;
    if (!destStatus) return;

    onMove(activeId, destStatus, overIsColumn ? null : overId);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {JOB_STATUSES.map((status) => {
          const items = jobs.filter((j) => j.status === status.value);
          return (
            <KanbanColumn
              key={status.value}
              status={status.value}
              label={status.label}
              items={items}
              onOpenDetail={onOpenDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

interface KanbanColumnProps {
  status: string;
  label: string;
  items: JobApplicationData[];
  onOpenDetail: (job: JobApplicationData) => void;
  onEdit: (job: JobApplicationData) => void;
  onDelete: (job: JobApplicationData) => void;
  onStatusChange: (job: JobApplicationData, status: string) => void;
}

function KanbanColumn({ status, label, items, onOpenDetail, onEdit, onDelete, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 rounded-xl border p-3 transition-colors ${
        isOver ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-muted/30'
      }`}
    >
      <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <SortableContext items={items.map((j) => j.id)} strategy={verticalListSortingStrategy}>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pb-1">
          {items.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onOpenDetail={onOpenDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
