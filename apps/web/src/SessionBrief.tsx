import { useState } from "react";
import {
  briefEnd,
  briefPeriod,
  briefStart,
  type TaskRecords,
} from "./TaskRecords";
import { taskKey, type TodoList, type TodoProgress } from "./Todos";

export type DemoUpdate = { id: string; body: string; period: string };

type Source = {
  id: string;
  label: string;
  text: string;
  activity?: { key: string; title: string; target?: number };
  topic?: boolean;
  parent?: string;
  focus?: boolean;
};

export function briefSources(
  lists: TodoList[],
  progress: TodoProgress,
  records: TaskRecords,
  topic: string,
): Source[] {
  const sources: Source[] = [];
  for (const list of lists) {
    for (const item of list.items) {
      const key = taskKey(list.id, item.id);
      if (item.kind === "checklist" && progress[list.id]?.includes(item.id)) {
        sources.push({
          id: key + "/complete",
          label: item.text + " — marked complete",
          text: item.text + " — marked complete.",
        });
      }
      for (const record of records[key] ?? []) {
        if (record.date < briefStart || record.date > briefEnd) continue;
        const id = key + "/" + record.id;
        if (item.kind === "activity" && record.kind === "entry") {
          sources.push({
            id,
            label: item.text + " — " + record.date,
            text: "",
            activity: {
              key,
              title: item.text,
              target: item.target,
            },
          });
          if (record.text)
            sources.push({
              id: id + "/note",
              parent: id,
              label: "Share note: " + record.text,
              text: item.text + " (" + record.date + "): " + record.text,
              focus: !!item.focus,
            });
          continue;
        }
        const text =
          record.kind === "did-not-happen"
            ? item.text + " — reported that it didn’t happen this period."
            : item.text +
              (record.kind === "entry"
                ? " (" + record.date + ")"
                : " — progress note") +
              ": " +
              record.text;
        sources.push({ id, label: text, text, focus: !!item.focus });
      }
    }
  }
  if (topic.trim())
    sources.push({
      id: "topic",
      label: "For the next session: " + topic.trim(),
      text: topic.trim(),
      topic: true,
    });
  return sources;
}

export function composeBrief(sources: Source[]): string {
  const activities = new Map<
    string,
    { title: string; count: number; target?: number }
  >();
  for (const { activity } of sources) {
    if (!activity) continue;
    const entry = activities.get(activity.key);
    if (entry) entry.count++;
    else
      activities.set(activity.key, {
        title: activity.title,
        count: 1,
        target: activity.target,
      });
  }
  const progress = [...activities.values()].map(
    ({ title, count, target }) =>
      title +
      " — " +
      count +
      (count === 1 ? " shared record" : " shared records") +
      (target ? "; " + target + " planned." : "."),
  );
  const updates = sources.filter((source) => source.text && !source.topic);
  updates.sort((a, b) => Number(!!b.focus) - Number(!!a.focus));
  const topic = sources.find((source) => source.topic);
  return [
    progress.length && "Activity progress\n" + progress.join("\n"),
    updates.length &&
      "Updates\n" + updates.map((source) => source.text).join("\n"),
    topic && "For the next session\n" + topic.text,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function SessionBrief({
  sources,
  onSend,
}: {
  sources: Source[];
  onSend: (update: DemoUpdate) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [generatedFrom, setGeneratedFrom] = useState<string>();
  const [step, setStep] = useState<"edit" | "review" | "sent">("edit");
  const [id] = useState(() => crypto.randomUUID());
  const included = sources.filter(
    (source) =>
      selected.includes(source.id) &&
      (!source.parent || selected.includes(source.parent)),
  );
  const fingerprint = JSON.stringify(included);
  const stale = generatedFrom !== undefined && generatedFrom !== fingerprint;
  const canReview = !stale && !!body.trim();

  if (step === "sent")
    return (
      <>
        <h1>Demo update sent</h1>
        <p>Dr. Lee can see the confirmed update in the demo Letters inbox.</p>
        <a className="button secondary" href="#/client/letters">
          View sent letters
        </a>
      </>
    );

  if (step === "review" && canReview)
    return (
      <>
        <h1>Review your update</h1>
        <p>To Dr. Lee · {briefPeriod}</p>
        <article className="card letter">
          <p className="brief-body">{body}</p>
        </article>
        <p>This adds the confirmed text to the fictional inbox in this tab.</p>
        <div className="actions">
          <button
            onClick={() => {
              onSend({ id, body, period: briefPeriod });
              setStep("sent");
            }}
          >
            Send demo update
          </button>
          <button className="secondary" onClick={() => setStep("edit")}>
            Continue editing
          </button>
        </div>
      </>
    );

  return (
    <>
      <a href="#/client/todos">Back to tasks</a>
      <h1>Prepare an update</h1>
      <p>For Dr. Lee · {briefPeriod}</p>
      <section className="card">
        <h2>Choose what to share</h2>
        {sources.length ? (
          sources.map((source) => (
            <label
              className={source.parent ? "check brief-note" : "check"}
              key={source.id}
            >
              <input
                type="checkbox"
                checked={selected.includes(source.id)}
                disabled={!!source.parent && !selected.includes(source.parent)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setGeneratedFrom((previous) =>
                    previous === undefined ? undefined : "",
                  );
                  setSelected((current) =>
                    checked
                      ? [...current, source.id]
                      : current.filter(
                          (entry) =>
                            entry !== source.id &&
                            entry !== source.id + "/note",
                        ),
                  );
                }}
              />
              <span>{source.label}</span>
            </label>
          ))
        ) : (
          <p>No saved updates for this period. You can write your own below.</p>
        )}
        <button
          type="button"
          className="secondary"
          disabled={!included.length}
          onClick={() => {
            if (
              body &&
              !window.confirm("Replace the current text with a new demo draft?")
            )
              return;
            setBody(composeBrief(included));
            setGeneratedFrom(fingerprint);
          }}
        >
          Create demo draft
        </button>
      </section>
      <section className="card">
        <h2>Draft update</h2>
        <p>Review or edit the demo draft, or write your own update.</p>
        {stale && (
          <p role="status">
            Your selection changed. Create a new draft or clear this draft to
            start over.
          </p>
        )}
        <label className="task-field" htmlFor="brief-body">
          Update text
          <textarea
            id="brief-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <div className="actions">
          <button disabled={!canReview} onClick={() => setStep("review")}>
            Review update
          </button>
          {stale && (
            <button
              className="secondary"
              onClick={() => {
                setBody("");
                setGeneratedFrom(undefined);
              }}
            >
              Clear draft
            </button>
          )}
        </div>
      </section>
    </>
  );
}
