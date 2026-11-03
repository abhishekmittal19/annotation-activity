import { AppShell } from "@/components/layout/AppShell";
import { TaskDetailsInspector } from "@/components/tasks/TaskDetailsInspector";

export default async function TaskDetailPage({ params }) {
  const { id } = await params;

  return (
    <AppShell>
      <TaskDetailsInspector id={id} />
    </AppShell>
  );
}
