import { AppShell } from '@/components/layout/AppShell';
import { TaskManagementTable } from '@/components/tasks/TaskManagementTable';

export default function TasksPage() {
  return (
    <AppShell>
      <TaskManagementTable />
    </AppShell>
  );
}
