import { useEffect, useRef, useState } from "react";
import { WeeklySummarySources, type WeeklySummarySuggestion } from "@between-sessions/contracts";
import { requestWeeklySummary, weeklyLetter } from "../api/weekly-summary";

export type WeeklyTask = WeeklySummarySources["tasks"][number];
export type IntervalContext = WeeklySummarySources["period"] & { personalMessage: string };

export function WeeklySummary({ tasks, version, context, letter, disabled, onContextChange, onAdopt }: {
  tasks: WeeklyTask[];
  version: number;
  context: IntervalContext;
  letter: string;
  disabled: boolean;
  onContextChange: (context: IntervalContext) => void;
  onAdopt: (text: string) => void;
}) {
  const [included, setIncluded] = useState(() => tasks.map((task) => task.id));
  const [preview, setPreview] = useState<WeeklySummarySources | null>(null);
  const [suggestion, setSuggestion] = useState<WeeklySummarySuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const active = useRef<AbortController | null>(null);
  const snapshot = JSON.stringify({ tasks, context, included, version, letter });

  useEffect(() => {
    active.current?.abort();
    active.current = null;
    setPreview(null);
    setSuggestion(null);
    setLoading(false);
    setMessage("");
    return () => {
      active.current?.abort();
      active.current = null;
    };
  }, [snapshot]);

  function previewInterval() {
    const parsed = WeeklySummarySources.safeParse({
      kind: "treatment_interval",
      sourceDraftVersion: version,
      period: { previousSession: context.previousSession, nextSession: context.nextSession },
      tasks: tasks.filter((task) => included.includes(task.id)),
      personalMessage: context.personalMessage,
    });
    if (!parsed.success) {
      setMessage("Enter both session dates in order and include tasks or your own message (maximum 20,000 characters).");
      return;
    }
    setPreview(parsed.data);
    setSuggestion(null);
    setMessage("");
  }

  async function generate() {
    if (!preview || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 40_000);
    setLoading(true);
    setSuggestion(null);
    setMessage("");
    try {
      const result = await requestWeeklySummary(preview, controller.signal);
      if (controller.signal.aborted) return;
      setSuggestion(result);
      setMessage("Your interval summary is ready for review.");
    } catch (error) {
      if (active.current !== controller) return;
      setMessage(controller.signal.aborted ? "Summary generation timed out. Try again or continue writing."
        : error instanceof Error ? error.message : "Summary generation failed. Try again.");
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) {
        active.current = null;
        setLoading(false);
      }
    }
  }

  const suggestionText = suggestion ? weeklyLetter(suggestion) : "";
  return (
    <section className="card ai-summary" aria-labelledby="weekly-summary-heading">
      <h2 id="weekly-summary-heading">Summary between sessions</h2>
      <p>Bring together your task completion, reflection answers and what you want to express. Use fictional content in this demo.</p>
      <label htmlFor="previous-session">Previous session date</label>
      <input id="previous-session" type="date" value={context.previousSession} disabled={disabled}
        onChange={(event) => onContextChange({ ...context, previousSession: event.target.value })} />
      <label htmlFor="next-session">Next session date</label>
      <input id="next-session" type="date" value={context.nextSession} disabled={disabled}
        onChange={(event) => onContextChange({ ...context, nextSession: event.target.value })} />
      <fieldset disabled={loading || disabled}>
        <legend>Tasks in this session interval</legend>
        <p>All current tasks are selected. Confirm which belong to this interval. Completion uses your saved checkmarks.</p>
        {tasks.length === 0 && <p>No tasks assigned. You can still summarize your own message.</p>}
        {tasks.map((task) => (
          <label className="ai-answer" key={task.id}>
            <span><input type="checkbox" checked={included.includes(task.id)} onChange={(event) => {
              const checked = event.target.checked;
              setIncluded((current) => checked ? [...current, task.id] : current.filter((id) => id !== task.id));
            }} /> {task.title}</span>
            <span>{task.completed ? "Marked complete" : "Not marked complete"} · {task.answers.length} reflection answers</span>
          </label>
        ))}
      </fieldset>
      <label htmlFor="personal-message">What I want to express this interval</label>
      <textarea id="personal-message" value={context.personalMessage} disabled={disabled} maxLength={10_000}
        onChange={(event) => onContextChange({ ...context, personalMessage: event.target.value })} />
      <p>This message and the included task records will be sent to DeepSeek when you generate.</p>
      <button className="secondary" disabled={loading || disabled} onClick={previewInterval}>Preview interval content</button>
      {preview && (
        <div className="ai-preview">
          <h3>Content to send to DeepSeek</h3>
          <p>{preview.period.previousSession} – {preview.period.nextSession}</p>
          <p>{preview.tasks.filter((task) => task.completed).length} of {preview.tasks.length} tasks marked complete</p>
          {preview.tasks.map((task) => (
            <div key={task.id}>
              <strong>{task.title} · {task.completed ? "Marked complete" : "Not marked complete"}</strong>
              {task.answers.map((answer) => <p className="ai-source-text" key={answer.questionId}>{answer.question}<br />{answer.text}</p>)}
            </div>
          ))}
          {preview.personalMessage.trim() && <p className="ai-source-text">{preview.personalMessage}</p>}
          <button disabled={loading || disabled} onClick={() => void generate()}>{loading ? "Generating…" : "Generate summary"}</button>
        </div>
      )}
      <p role="status" aria-live="polite">{loading ? "Generating your interval summary…" : message}</p>
      {suggestion && (
        <div className="ai-suggestion">
          <h3>Suggested interval summary</h3>
          <p className="ai-source-text">{suggestionText}</p>
          <p>Review the facts. Adopting this summary replaces the current letter text. You can edit it afterward.</p>
          <div className="actions">
            <button disabled={disabled} onClick={() => { onAdopt(suggestionText); setSuggestion(null); }}>Use suggestion</button>
            <button className="secondary" onClick={() => { setSuggestion(null); setMessage("Suggestion discarded."); }}>Discard suggestion</button>
          </div>
        </div>
      )}
    </section>
  );
}
