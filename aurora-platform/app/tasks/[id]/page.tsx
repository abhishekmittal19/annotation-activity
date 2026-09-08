import { AppShell } from "@/components/layout/AppShell";
import { TaskDetailsInspector } from "@/components/tasks/TaskDetailsInspector";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <TaskDetailsInspector id={id} />
    </AppShell>
  );
}
