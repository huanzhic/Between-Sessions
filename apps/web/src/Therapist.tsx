import { useState } from "react";
import { activity, inbox } from "./fixtures";

const links = [
  ["Overview", "/therapist"],
  ["Clients", "/therapist/clients"],
  ["Letters", "/therapist/letters"],
  ["Reflection tasks", "/therapist/tasks"],
  ["Settings", "/therapist/settings"],
];
export function Therapist({ route }: { route: string }) {
  const [created, setCreated] = useState<{
    topic: string;
    questions: string[];
  } | null>(null);
  const [empty, setEmpty] = useState(false);
  const list = (
    <>
      <label className="check">
        <input
          type="checkbox"
          checked={empty}
          onChange={(e) => setEmpty(e.target.checked)}
        />
        Preview empty inbox
      </label>
      {empty ? (
        <div className="notice">
          <h2>No letters yet</h2>
          <p>Letters appear here only after a client chooses to send one.</p>
        </div>
      ) : (
        inbox.map((letter) => (
          <a
            className="card letter-row"
            href={`#/therapist/letters/${letter.id}`}
            key={letter.id}
          >
            <h2>{letter.sender.displayName}</h2>
            <p>{activity.topic}</p>
            <small>Example sent Nov 3, 2026 · Appointment Nov 5</small>
          </a>
        ))
      )}
    </>
  );
  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#/therapist">
          Between
          <br />
          Sessions
        </a>
        <nav aria-label="Therapist navigation">
          {links.map(([label, path]) => (
            <a
              key={path}
              href={`#${path}`}
              aria-current={route === path ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <p>
          Dr. Lee
          <br />
          <small>Therapist workspace</small>
        </p>
      </aside>
      <main id="main" tabIndex={-1} className="therapist-main">
        {route === "/therapist" ? (
          <>
            <header className="page-header">
              <div>
                <h1>Good morning, Dr. Lee</h1>
                <p>Prepare for the conversations ahead.</p>
              </div>
              <a className="button" href="#/therapist/tasks">
                Create reflection
              </a>
            </header>
            <div className="overview-grid">
              <section>
                <h2>Recent letters</h2>
                <p>Only letters clients have chosen to send appear here.</p>
                {list}
                <a className="button secondary" href="#/therapist/letters">
                  View all letters
                </a>
              </section>
              <aside>
                <h2>Coming up</h2>
                <div className="notice warm">
                  <strong>Thu, Nov 5 · 10:00 AM</strong>
                  <p>
                    Maya Chen
                    <br />
                    America/Los_Angeles
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : route === "/therapist/clients" ? (
          <>
            <h1>Clients</h1>
            <p>Fictional linked-client example</p>
            <div className="card">
              <h2>Maya Chen</h2>
              <p>Next appointment: Nov 5, 2026 · 10:00 AM PT</p>
              <a className="button" href="#/therapist/tasks">
                Create reflection
              </a>
            </div>
          </>
        ) : route === "/therapist/tasks" ? (
          <>
            <h1>Create a reflection</h1>
            <p>Offer a topic and questions for the next appointment.</p>
            <form
              className="task-form"
              onSubmit={(e) => {
                e.preventDefault();
                const values = new FormData(e.currentTarget);
                setCreated({
                  topic: String(values.get("topic")),
                  questions: activity.questions.map((q) =>
                    String(values.get(q.id)),
                  ),
                });
              }}
              onChange={() => setCreated(null)}
            >
              <label htmlFor="client">Client</label>
              <select id="client">
                <option>Maya Chen</option>
              </select>
              <p>Appointment: Nov 5, 2026 · 10:00 AM · America/Los_Angeles</p>
              <label htmlFor="topic">Topic</label>
              <input
                id="topic"
                name="topic"
                required
                defaultValue={activity.topic}
              />
              {activity.questions.map((q) => (
                <div key={q.id}>
                  <label htmlFor={q.id}>Question {q.position}</label>
                  <input
                    id={q.id}
                    name={q.id}
                    required
                    defaultValue={q.prompt}
                  />
                </div>
              ))}
              <button>Preview demo assignment</button>
              {created ? (
                <section role="status" className="notice">
                  <h2>{created.topic}</h2>
                  <ol>
                    {created.questions.map((text, index) => (
                      <li key={index}>{text}</li>
                    ))}
                  </ol>
                  <p>
                    Demo preview for Maya Chen. Nothing was created on the
                    server or assigned to a client.
                  </p>
                </section>
              ) : null}
            </form>
          </>
        ) : route === "/therapist/settings" ? (
          <>
            <h1>Settings</h1>
            <p>
              This demo uses the fictional Dr. Lee account. Account settings and
              authentication are not connected.
            </p>
            <a className="button secondary" href="#/client">
              Open client demo
            </a>
          </>
        ) : route === "/therapist/letters/letter-maya" ? (
          <>
            <a href="#/therapist/letters">Back to letters</a>
            <h1>A letter from Maya Chen</h1>
            <p>Fictional sent example · Nov 3, 2026</p>
            <article className="card letter">
              <h2>To Dr. Lee</h2>
              <p>{inbox[0].approvedBody}</p>
            </article>
            <p>
              This is a fixed approved letter example. Private answers and
              drafts are not included.
            </p>
          </>
        ) : (
          <>
            <h1>Letters</h1>
            <p>
              Only approved sent letters appear here. Sent does not imply read.
            </p>
            {list}
          </>
        )}
        <p className="workspace-footnote">
          Private reflections stay with the client. This workspace shows
          assignments and approved sent letters only.
        </p>
      </main>
    </div>
  );
}
