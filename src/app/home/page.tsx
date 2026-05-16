"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import { z } from "zod";
import {
  Sparkles,
  LogOut,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  Circle,
  ListTodo,
  Trophy,
  Flame,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"tasks">;
type Filter = "all" | "active" | "completed";

const titleSchema = z.string().trim().min(1, "Add a title").max(200, "Too long");

export default function AppPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  // Fetch tasks
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("completed", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) toast.error(error.message);
      else setTasks(data ?? []);
      setLoadingTasks(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const activeCount = total - completed;
    const dueToday = tasks.filter(
      (t) => !t.completed && t.due_date && isToday(new Date(t.due_date))
    ).length;
    return { total, completed, active: activeCount, dueToday };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = titleSchema.safeParse(title);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!user) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: parsed.data,
        due_date: dueDate ? dueDate.toISOString() : null,
      })
      .select()
      .single();
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTasks((prev) => [data, ...prev]);
    setTitle("");
    setDueDate(undefined);
  };

  const toggleTask = async (task: Task) => {
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );
    const { error } = await supabase
      .from("tasks")
      .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } else if (newCompleted) {
      toast.success("Nice work!");
    }
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setTasks(prev);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const completionPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>       
            <span className="font-display text-xl font-semibold">Sprig</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            {/* <Button variant="ghost" size="sm" onClick={() => signOut()}> */}
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Greeting + Stats */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{greeting()}, friend.</h1>
          <p className="mt-1 text-muted-foreground">
            {stats.dueToday > 0
              ? `You have ${stats.dueToday} task${stats.dueToday > 1 ? "s" : ""} due today.`
              : stats.active > 0
              ? `${stats.active} task${stats.active > 1 ? "s" : ""} in your queue.`
              : "Your space is clear. Add something below."}
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={ListTodo} label="Total" value={stats.total} />
          <StatCard icon={Circle} label="Active" value={stats.active} />
          <StatCard icon={Trophy} label="Completed" value={stats.completed} accent />
          <StatCard icon={Flame} label="Done %" value={`${completionPct}%`} />
        </div>

        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            maxLength={200}
          />
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" type="button" className="font-normal">
                  <CalendarIcon className="h-4 w-4" />
                  {dueDate ? format(dueDate, "MMM d") : "Due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                {dueDate && (
                  <div className="border-t border-border p-2">
                    <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setDueDate(undefined)}>
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Button type="submit" variant="default" disabled={adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-soft w-fit">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors capitalize",
                filter === f ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {loadingTasks ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <p className="font-display text-xl text-muted-foreground">
                {filter === "completed"
                  ? "No completed tasks yet."
                  : filter === "active"
                  ? "Nothing pending. Beautiful."
                  : "Your list is empty. Add your first task above."}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task)} onDelete={() => deleteTask(task.id)} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border p-4 shadow-soft", accent ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-card")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", accent ? "opacity-90" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", accent ? "opacity-90" : "text-muted-foreground")}>{label}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const due = task.due_date ? new Date(task.due_date) : null;
  const overdue = due && !task.completed && isPast(due) && !isToday(due);
  const today = due && isToday(due);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated",
        task.completed && "opacity-60"
      )}
    >
      <button onClick={onToggle} className="shrink-0 transition-transform hover:scale-110" aria-label={task.completed ? "Mark as not done" : "Mark as done"}>
        {task.completed ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-base", task.completed && "line-through text-muted-foreground")}>{task.title}</div>
        {due && (
          <div className={cn("mt-0.5 flex items-center gap-1 text-xs", overdue ? "text-destructive" : today ? "text-warning" : "text-muted-foreground")}>
            <CalendarIcon className="h-3 w-3" />
            {overdue ? "Overdue · " : today ? "Today · " : ""}
            {format(due, "MMM d, yyyy")}
          </div>
        )}
      </div>

      <button onClick={onDelete} className="rounded-md p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label="Delete task">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}