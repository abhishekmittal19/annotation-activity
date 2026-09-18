import { AppShell } from "@/components/layout/AppShell";
import { AnnotationWorkspace } from "@/components/annotation/AnnotationWorkspace";

export default async function AnnotationPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const params = await searchParams;
  const taskId = params.taskId;

  return (
    <AppShell>
      <AnnotationWorkspace taskId={taskId} />
    </AppShell>
  );
}
