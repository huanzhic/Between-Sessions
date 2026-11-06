import { useState } from "react";
import { activity, inbox, newDraft, type PrivateDraft } from "./fixtures";
import {
  ClientTodoList,
  initialTodoList,
  reflectionPath,
  type TodoList,
  type TodoProgress,
} from "./Todos";

export function Client({
  route,
  todoLists,
  todoProgress,
  onSaveTodo,
}: {
  route: string;
  todoLists: TodoList[];
  todoProgress: TodoProgress;
  onSaveTodo: (listId: string, completed: number[]) => void;
}) {
  const reflectionRoute =
    route === "/client/reflection"
      ? reflectionPath(initialTodoList.id, initialTodoList.items[0].id)
      : route;
  const reflection = todoLists.flatMap((list) =>
    list.items.filter(
      (item) =>
        item.kind === "reflection" &&
        reflectionPath(list.id, item.id) === reflectionRoute,
    ),
  )[0];
  const draftKey = reflection ? reflectionRoute : "/client/summary";
  const [drafts, setDrafts] = useState<Record<string, PrivateDraft>>({});
  const draft = drafts[draftKey] ?? newDraft();
  const [questions, setQuestions] = useState<Record<string, number>>({});
  const question = questions[reflectionRoute] ?? 0;
  const [saveStatuses, setSaveStatuses] = useState<Record<string, string>>({});
  const save = saveStatuses[draftKey] ?? "Not saved · demo only";
  const [fail, setFail] = useState(false);
  const [busy, setBusy] = useState(false);
  const q = activity.questions[question];
  function setDraft(update: (value: PrivateDraft) => PrivateDraft) {
    setDrafts((current) => ({
      ...current,
      [draftKey]: update(current[draftKey] ?? newDraft()),
    }));
  }
  function setSave(status: string) {
    setSaveStatuses((current) => ({ ...current, [draftKey]: status }));
  }
  function setQuestion(update: (value: number) => number) {
    setQuestions((current) => ({
      ...current,
      [reflectionRoute]: update(current[reflectionRoute] ?? 0),
    }));
  }
  function changed() {
    setSave("Unsaved changes · demo only");
  }
  async function saveDraft() {
    setBusy(true);
    setSave("Saving demo draft…");
    await new Promise((resolve) => setTimeout(resolve, 450));
    if (fail)
      setSave(
        "Save failed. Your writing is still here. Turn off simulated failure and retry.",
      );
    else {
      setDraft((d) => ({
        ...d,
        version: d.version + 1,
        updatedAt: new Date().toISOString(),
      }));
      setSave("Saved in demo memory only · not sent");
    }
    setBusy(false);
  }
  const home =
    route === "/client" ||
    (!reflection &&
      ![
        "/client/reflection",
        "/client/summary",
        "/client/review",
        "/client/letters",
        "/client/todos",
      ].includes(route));
  return (
    <main
      id={route === "/sos" ? undefined : "main"}
      tabIndex={-1}
      className={`client-main ${home ? "home" : ""}`}
    >
      <header className="client-header">
        <a href="#/client">Between Sessions</a>
        <a className="button secondary" href="#/sos">
          SOS resources
        </a>
      </header>
      {home ? (
        <>
          <h1>Welcome back, Maya.</h1>
          <p className="lead">
            A space to gather what matters before your next session.
          </p>
          <Privacy />
          <section className="card">
            <h2>To-do lists</h2>
            {todoLists.length === 0 ? (
              <p>No to-do lists assigned yet.</p>
            ) : (
              <ul>
                {todoLists.map((list) => (
                  <li key={list.id}>
                    {list.title} · {todoProgress[list.id]?.length ?? 0} of{" "}
                    {list.items.length} complete
                  </li>
                ))}
              </ul>
            )}
            <a className="button secondary" href="#/client/todos">
              View to-do lists
            </a>
          </section>
          <Appointment />
          <a className="button secondary" href="#/client/letters">
            View sent letters
          </a>
        </>
      ) : route === "/client/todos" ? (
        <>
          <a href="#/client">Back to home</a>
          <h1>To-do lists</h1>
          <p>
            Your checkmarks are private. You can write your summary at any time.
          </p>
          {todoLists.length === 0 && <p>No to-do lists assigned yet.</p>}
          {todoLists.map((list) => (
            <ClientTodoList
              key={list.id}
              list={list}
              saved={todoProgress[list.id] ?? []}
              onSave={onSaveTodo}
            />
          ))}
          <a className="button secondary" href="#/client/summary">
            Write your summary
          </a>
        </>
      ) : reflection ? (
        <>
          <a href="#/client/todos">Back to to-do lists</a>
          <div className="writing-layout">
            <aside className="writing-context">
              <h2>{reflection.text}</h2>
              <p>From Dr. Lee</p>
              <Appointment />
            </aside>
            <section className="editor">
              <h1>{q.prompt}</h1>
              <p>
                Question {question + 1} of {activity.questions.length} · You may
                skip any question.
              </p>
              <label htmlFor="answer">Your private answer</label>
              <textarea
                id="answer"
                disabled={busy}
                value={draft.answers[question].text}
                onChange={(e) => {
                  const text = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    answers: d.answers.map((a) =>
                      a.questionId === q.id ? { ...a, text } : a,
                    ),
                  }));
                  changed();
                }}
              />
              <SaveControls
                busy={busy}
                save={save}
                fail={fail}
                setFail={setFail}
                onSave={saveDraft}
              />
              <div className="actions">
                <button
                  className="secondary"
                  disabled={question === 0 || busy}
                  onClick={() => setQuestion((n) => n - 1)}
                >
                  Previous
                </button>
                {question < activity.questions.length - 1 ? (
                  <button
                    disabled={busy}
                    onClick={() => setQuestion((n) => n + 1)}
                  >
                    Next / skip question
                  </button>
                ) : (
                  <a className="button" href="#/client/todos">
                    Return to to-do lists
                  </a>
                )}
              </div>
              <Privacy />
            </section>
          </div>
        </>
      ) : route === "/client/summary" ? (
        <>
          <a href="#/client/todos">Back to to-do lists</a>
          <h1>What would you like to bring?</h1>
          <p>Write your own letter. You decide what to share.</p>
          <label htmlFor="summary">Your letter draft</label>
          <textarea
            id="summary"
            disabled={busy}
            value={draft.summary.text}
            onChange={(e) => {
              const text = e.target.value;
              setDraft((d) => ({ ...d, summary: { text, origin: "manual" } }));
              changed();
            }}
          />
          <SaveControls
            busy={busy}
            save={save}
            fail={fail}
            setFail={setFail}
            onSave={saveDraft}
          />
          <p className="notice">
            AI help is optional and is not connected in this foundation demo.
            You can complete your letter manually.
          </p>
          <a className="button" href="#/client/review">
            Review letter
          </a>
        </>
      ) : route === "/client/review" ? (
        <>
          <h1>Review your letter</h1>
          <p>Check exactly what you want to share.</p>
          <article className="card letter">
            <h2>To {activity.recipient.displayName}</h2>
            <p>
              {draft.summary.text ||
                "Your letter is empty. Return to editing to add what you want to share."}
            </p>
          </article>
          <Appointment />
          <p>
            Only this letter would be shared. Your other answers stay private.
          </p>
          <p className="notice">
            Sending is unavailable in Milestone 1. The backend and sending
            policy are not connected. Nothing will be sent.
          </p>
          <button disabled>Send unavailable</button>
          <a className="button secondary" href="#/client/summary">
            Continue editing
          </a>
        </>
      ) : (
        <>
          <h1>Sent letters</h1>
          <p>Fictional examples · these were not sent by this app.</p>
          {inbox.map((letter) => (
            <article className="card letter" key={letter.id}>
              <h2>To {letter.recipient.displayName}</h2>
              <p>{letter.approvedBody}</p>
              <small>Example sent Nov 3, 2026</small>
            </article>
          ))}
          <a className="button secondary" href="#/client">
            Back to home
          </a>
        </>
      )}
      <p className="client-footnote">
        Fictional demo · Your own pace, your choice.
      </p>
    </main>
  );
}
function Appointment() {
  return (
    <aside className="notice warm">
      <strong>Your next appointment</strong>
      <p>
        Thu, Nov 5, 2026 · 10:00 AM
        <br />
        {activity.appointment.timeZone}
      </p>
    </aside>
  );
}
function Privacy() {
  return (
    <aside className="notice">
      <strong>Only you can see your drafts</strong>
      <p>Your therapist only sees a letter after you review and send it.</p>
    </aside>
  );
}
function SaveControls({
  busy,
  save,
  fail,
  setFail,
  onSave,
}: {
  busy: boolean;
  save: string;
  fail: boolean;
  setFail: (value: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="save-controls">
      <p
        role="status"
        className={save.startsWith("Save failed") ? "error" : ""}
      >
        {save}
      </p>
      <button disabled={busy} onClick={onSave}>
        {busy
          ? "Saving…"
          : save.startsWith("Save failed")
            ? "Retry demo save"
            : "Save demo draft"}
      </button>
      <label className="check">
        <input
          type="checkbox"
          checked={fail}
          disabled={busy}
          onChange={(e) => setFail(e.target.checked)}
        />
        Simulate save failure
      </label>
    </div>
  );
}
