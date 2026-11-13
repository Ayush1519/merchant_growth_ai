import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Flame,
  Plus,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GrowthTask, TaskCategory, TaskPriority, TaskStatus } from "@/lib/supabase/types";

export const Route = createFileRoute("/growth-plan")({
  head: () => ({
    meta: [
      { title: "Growth Plan — Merchant Growth AI" },
      { name: "description", content: "Actionable, prioritized tasks and strategic growth objectives." },
    ],
  }),
  component: GrowthPlanPage,
});

function GrowthPlanPage() {
  const { growthTasks, addGrowthTask, updateGrowthTask } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New Task Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("High");
  const [category, setCategory] = useState<TaskCategory>("Sales");
  const [impact, setImpact] = useState("+₹1,500 / mo");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");

  const completedCount = growthTasks.filter((t) => t.status === "Completed").length;
  const progressPercent = growthTasks.length > 0 ? Math.round((completedCount / growthTasks.length) * 100) : 0;

  const filteredTasks = growthTasks.filter((t) => {
    const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchPriority = selectedPriority === "all" || t.priority === selectedPriority;
    return matchStatus && matchPriority;
  });

  const handleToggleStatus = async (task: GrowthTask) => {
    const nextStatus: TaskStatus =
      task.status === "Pending"
        ? "In Progress"
        : task.status === "In Progress"
        ? "Completed"
        : "Pending";

    await updateGrowthTask(task.id, { status: nextStatus });
    if (nextStatus === "Completed") {
      toast.success("Objective Completed! 🎉", { description: task.title });
    } else {
      toast.info(`Task status: ${nextStatus}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    await addGrowthTask({
      title,
      description,
      priority,
      category,
      impact,
      difficulty,
      status: "Pending",
    });

    toast.success("Growth objective added");
    setDialogOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Execution Roadmap"
        title="AI Growth Plan"
        description="Structured growth sprints recommended by Growth AI to unlock higher revenue and repeat purchases."
        actions={
          <Btn onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Add Objective
          </Btn>
        }
      />

      {/* Progress Overview Card */}
      <div className="surface mb-8 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Growth Sprint Progress</h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {growthTasks.length} growth objectives completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-extrabold text-ink">{progressPercent}%</span>
            <div className="h-3 w-40 overflow-hidden rounded-full bg-border">
              <div
                className="bg-score h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {["all", "Pending", "In Progress", "Completed"].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedStatus === st
                ? "bg-ink text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            {st === "all" ? "All Statuses" : st}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {["all", "High", "Medium", "Low"].map((pr) => (
            <button
              key={pr}
              onClick={() => setSelectedPriority(pr)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedPriority === pr
                  ? "bg-primary/20 text-primary-foreground border border-primary"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {pr === "all" ? "All Priorities" : `${pr} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {growthTasks.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Target className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">No growth tasks yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Complete onboarding or click below to generate your initial AI growth roadmap.
          </p>
          <Btn onClick={() => setDialogOpen(true)} className="mt-6">
            <Plus className="size-4" /> Create Growth Task
          </Btn>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="surface p-8 text-center text-sm text-muted-foreground">
          No tasks match the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isCompleted = t.status === "Completed";
            const isInProgress = t.status === "In Progress";

            return (
              <div
                key={t.id}
                className={`surface lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-all ${
                  isCompleted ? "opacity-75 bg-card/50" : ""
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-6 text-accent-foreground fill-primary/20" />
                    ) : isInProgress ? (
                      <Clock className="size-6 text-warning" />
                    ) : (
                      <Circle className="size-6 text-muted-foreground" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-semibold text-ink ${
                          isCompleted ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {t.title}
                      </h3>
                      <Pill tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warn" : "neutral"}>
                        {t.priority}
                      </Pill>
                      <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {t.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground max-w-2xl">{t.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-xs font-bold text-accent-foreground">{t.impact}</p>
                    <p className="text-[10px] text-muted-foreground">Difficulty: {t.difficulty}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                      isCompleted
                        ? "border-accent-foreground/40 bg-accent text-accent-foreground"
                        : isInProgress
                        ? "border-warning/40 bg-warning/15 text-destructive"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Growth Objective</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Objective Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Launch VIP coffee subscription bundle"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Description & Strategy</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this matters and action steps to execute…"
                className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Retention">Retention</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Projected Impact</label>
                <input
                  type="text"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="e.g. +₹2,000 / mo"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-full border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <Btn type="submit" className="py-2 text-xs">
                Save Objective
              </Btn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
