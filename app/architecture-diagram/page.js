// The AI1 × Alloy onboarding architecture, as built in this repo. Parts of the original design that
// aren't built yet are marked "Planned". Keep this in sync when routes, tables, or statuses change.

// ---------- Diagram drawing ----------

const COLORS = {
  text: "#1f2937",
  muted: "#6b7280",
  line: "#d1d5db",
  ai1: "#8a4ed3",
  ai1Soft: "#f6effc",
  alloy: "#0f7b6c",
  alloySoft: "#e3f3ef",
  async: "#c2410c",
  planned: "#9ca3af",
  soft: "#f3f4f6",
  ok: "#15803d",
  bad: "#b91c1c",
}
const SANS = "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

const TEXT = {
  title: { fontFamily: SANS, fontSize: 13, fontWeight: 700, fill: COLORS.text },
  body: { fontFamily: SANS, fontSize: 12, fill: COLORS.text },
  mono: { fontFamily: MONO, fontSize: 11, fill: COLORS.muted },
  zone: { fontFamily: SANS, fontSize: 11, fontWeight: 700, fill: COLORS.muted, letterSpacing: "0.06em" },
  label: { fontFamily: SANS, fontSize: 11, fontWeight: 700, fill: COLORS.text },
}
const muted = (style) => ({ ...style, fill: COLORS.muted })

const BOX = {
  plain: { fill: "#fff", stroke: COLORS.line, strokeWidth: 1.3 },
  ai1: { fill: "#fff", stroke: COLORS.ai1, strokeWidth: 1.5 },
  alloy: { fill: COLORS.alloySoft, stroke: COLORS.alloy, strokeWidth: 1.8 },
  planned: { fill: COLORS.soft, stroke: COLORS.planned, strokeWidth: 1.3, strokeDasharray: "5 4" },
}

const LINE = {
  sync: { stroke: COLORS.text },
  async: { stroke: COLORS.async, strokeDasharray: "6 4" },
  planned: { stroke: COLORS.planned, strokeDasharray: "6 4" },
}

// Arrowheads. SVG ids are page-wide, so each diagram passes its own prefix.
const Markers = ({ prefix }) => (
  <defs>
    {Object.entries(LINE).map(([kind, style]) => (
      <marker key={kind} id={`${prefix}-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={style.stroke} />
      </marker>
    ))}
  </defs>
)

const Arrow = ({ d, kind = "sync", prefix }) => (
  <path d={d} fill="none" strokeWidth={1.6} {...LINE[kind]} markerEnd={`url(#${prefix}-${kind})`} />
)

const Label = ({ x, y, kind = "sync", anchor = "start", children }) => (
  <text x={x} y={y} textAnchor={anchor} style={{ ...TEXT.label, fill: LINE[kind].stroke }}>
    {children}
  </text>
)

// A box with a bold title and rows of text. A row is a string, or { text, mono, indent }.
// `aside` adds a second column of rows, starting `aside.x` from the box's left edge.
const Node = ({ x, y, w, h, kind = "plain", title, titleStyle, rows = [], gap = 16, aside }) => {
  const planned = kind === "planned"
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} {...BOX[kind]} />
      <text x={x + 14} y={y + 22} style={titleStyle ?? (planned ? muted(TEXT.title) : TEXT.title)}>
        {title}
      </text>
      {rows.map((row, i) => {
        const r = typeof row === "string" ? { text: row } : row
        const style = r.mono ? TEXT.mono : TEXT.body
        return (
          <text key={i} x={x + 14 + (r.indent ?? 0)} y={y + 42 + i * gap} style={planned ? muted(style) : style}>
            {r.text}
          </text>
        )
      })}
      {aside?.rows.map((row, i) => (
        <text key={`aside-${i}`} x={x + aside.x} y={y + 42 + i * gap} style={TEXT.body}>
          {row}
        </text>
      ))}
    </g>
  )
}

const m = (text, indent) => ({ text, mono: true, indent })

const ArchitectureSvg = () => {
  const p = "arch"
  return (
    <svg
      viewBox="0 0 1280 744"
      role="img"
      aria-label="AI1 architecture as built: the browser posts the sign-up to the Next.js server, which saves a pending application in Postgres and calls Alloy's evaluations API. Review answers and documents go through the server to Alloy. Alloy's signed webhooks are verified and stored. A worker to process them and an email provider are planned."
      className="block h-auto w-full"
    >
      <Markers prefix={p} />

      {/* Legend */}
      <line x1="20" y1="28" x2="60" y2="28" strokeWidth={1.6} {...LINE.sync} markerEnd={`url(#${p}-sync)`} />
      <text x="68" y="32" style={TEXT.body}>Synchronous request / response</text>
      <line x1="290" y1="28" x2="330" y2="28" strokeWidth={1.6} {...LINE.async} markerEnd={`url(#${p}-async)`} />
      <text x="338" y="32" style={TEXT.body}>Asynchronous (webhook)</text>
      <line x1="520" y1="28" x2="560" y2="28" strokeWidth={1.6} {...LINE.planned} markerEnd={`url(#${p}-planned)`} />
      <text x="568" y="32" style={TEXT.body}>Planned, not built yet</text>

      {/* Zones */}
      <rect x="20" y="60" width="260" height="640" rx="12" fill="none" stroke={COLORS.line} strokeWidth={1.5} strokeDasharray="6 5" />
      <text x="36" y="84" style={TEXT.zone}>APPLICANT&apos;S BROWSER</text>
      <rect x="380" y="60" width="500" height="640" rx="12" fill={COLORS.ai1Soft} stroke={COLORS.ai1} strokeWidth={1.2} />
      <text x="396" y="84" style={TEXT.zone}>AI1 BACK END (one Next.js app)</text>
      <rect x="940" y="60" width="320" height="640" rx="12" fill={COLORS.soft} stroke={COLORS.line} strokeWidth={1.2} />
      <text x="956" y="84" style={TEXT.zone}>THIRD-PARTY SERVICES</text>

      {/* Browser */}
      <Node x={36} y={100} w={228} h={84} kind="ai1" title="AI1 front end (Next.js)"
        rows={["Home · Log in · Sign up", "Onboarding · Dashboard", "Settings · Header + Footer"]} />
      <Node x={36} y={200} w={228} h={108} title="Sign-up form"
        rows={["Name · DOB · SSN · email ·", "password · address", "SSN: masked input, never kept", "in browser storage or URLs"]} />
      <Node x={36} y={324} w={228} h={92} title="Status screen (/onboarding)"
        rows={["Approved · In review · Pending", "Denied · Error", "Review: questions + ID upload"]} />
      <Node x={36} y={432} w={228} h={76} title="Account picker → Dashboard"
        rows={["Pick demo accounts, then see", "balances + sample transactions"]} />
      <Node x={36} y={524} w={228} h={60} title="Address autocomplete" rows={["Geoapify; one current address"]} />

      {/* AI1 back end */}
      <Node x={396} y={100} w={468} h={236} kind="ai1" title="Next.js server: API routes + server pages"
        rows={[
          m("GET /api/auth/email-available"),
          m("POST /api/signup"),
          m("POST /api/login · /api/logout"),
          m("GET /api/applications/[id]"),
          m("PATCH /api/applications/[id]"),
          m("POST /api/applications/[id]/documents"),
          m("POST /api/applications/[id]/review (demo)"),
          m("GET /api/accounts/options"),
          m("POST /api/accounts/select"),
          m("GET /api/accounts"),
          m("GET /api/accounts/[id]/transactions"),
        ]}
        aside={{
          x: 314,
          rows: ["• zod validation", "• iron-session cookie", "• Alloy client", "• lib/kyc state machine", "• DOB encrypted", "• pages read the DB", "• demo mode (no Alloy)"],
        }} />
      <Node x={396} y={360} w={240} h={264} title="PostgreSQL (via Prisma)"
        rows={[
          m("users (email UNIQUE,"),
          m("kycStatus, reapplyAfter)", 10),
          m("addresses"),
          m("kyc_applications (tokens,"),
          m("outcome, tags, requiredFields)", 10),
          m("alloy_webhook_events"),
          m("(request_token UNIQUE)", 10),
          m("notifications"),
          m("(app + template UNIQUE)", 10),
          m("financial_accounts"),
          m("transactions"),
          m("audit_log"),
          "DOB: AES-GCM, per-user key",
        ]} />
      <Node x={652} y={360} w={212} h={108} kind="ai1" title="Webhook receiver"
        rows={[m("POST /webhooks/alloy"), "1. verify HMAC (raw body)", "2. skip duplicates", "3. store it, reply 200"]} />
      <Node x={652} y={488} w={212} h={92} kind="planned" title="Worker (planned)"
        rows={["process stored events,", "apply review decisions,", "send queued emails"]} />
      <Node x={396} y={644} w={468} h={52} title="Environment variables"
        rows={["Alloy token + secret · webhook secret · session secret · PII key"]} />

      {/* Third parties */}
      <Node x={956} y={100} w={288} h={300} kind="alloy" gap={18} title="Alloy"
        titleStyle={{ ...TEXT.title, fontSize: 14, fill: COLORS.alloy }}
        rows={[
          m("sandbox.alloy.co/v1 (default)"),
          "Onboarding workflow, picked by",
          "the workflow token: data services",
          "→ rules → outcome",
          "Entity P-… = the applicant, keyed",
          "by Alloy-External-Entity-ID (users.id)",
          "Review Queue: analysts decide",
          "Documents API: uploads for review",
          "Webhooks: HMAC-signed",
          "Demo mode: lib/alloy.js answers",
          "in Alloy's place; nothing is sent",
        ]} />
      <Node x={956} y={520} w={288} h={60} kind="planned" title="Email provider (planned)" rows={["emails wait in notifications"]} />
      <Node x={956} y={640} w={288} h={48} title="Geoapify Autocomplete API" />

      {/* Browser → server */}
      <Arrow prefix={p} d="M264,240 L394,240" />
      <Label x={329} y={232} anchor="middle">① sign up</Label>
      <Arrow prefix={p} d="M264,352 L344,352 L344,262 L394,262" />
      <Label x={270} y={345}>⑤ status</Label>
      <Arrow prefix={p} d="M264,396 L356,396 L356,284 L394,284" />
      <Label x={270} y={389}>⑥ review</Label>
      <Arrow prefix={p} d="M264,470 L368,470 L368,306 L394,306" />
      <Label x={270} y={463}>⑨ select</Label>

      {/* Server → Postgres */}
      <Arrow prefix={p} d="M500,336 L500,358" />
      <Label x={508} y={352}>② save</Label>

      {/* Server ↔ Alloy */}
      <Arrow prefix={p} d="M864,136 L954,136" />
      <Label x={910} y={128} anchor="middle">③ evaluate</Label>
      <Arrow prefix={p} d="M954,176 L866,176" />
      <Label x={910} y={194} anchor="middle">④ result</Label>
      <Arrow prefix={p} d="M864,232 L954,232" />
      <Label x={910} y={224} anchor="middle">⑥ review</Label>

      {/* Webhooks */}
      <Arrow prefix={p} kind="async" d="M954,384 L866,384" />
      <Label x={910} y={376} kind="async" anchor="middle">⑦ webhook</Label>
      <rect x="884" y="392" width="52" height="20" rx="5" fill="#fff" stroke={COLORS.async} strokeWidth={1.3} />
      <Label x={910} y={406} kind="async" anchor="middle">HMAC</Label>
      <Arrow prefix={p} kind="async" d="M652,420 L638,420" />

      {/* Planned worker */}
      <Arrow prefix={p} kind="planned" d="M758,468 L758,486" />
      <Arrow prefix={p} kind="planned" d="M652,540 L638,540" />
      <Arrow prefix={p} kind="planned" d="M864,500 L1000,500 L1000,402" />
      <Label x={1006} y={460} kind="planned">⑧ re-fetch</Label>
      <Arrow prefix={p} kind="planned" d="M864,548 L954,548" />
      <Label x={910} y={540} kind="planned" anchor="middle">⑧ email</Label>

      {/* Browser → Geoapify */}
      <Arrow prefix={p} d="M150,584 L150,716 L1100,716 L1100,690" />
      <text x="640" y="734" textAnchor="middle" style={TEXT.label}>
        Browser → Geoapify directly (public browser key; sends only the address text being typed)
      </text>
    </svg>
  )
}

// A pill-shaped state for the state machine
const State = ({ x, y, w = 200, h = 54, name, note, stroke = COLORS.line, strokeWidth = 1.3 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" stroke={stroke} strokeWidth={strokeWidth} />
    <text x={x + w / 2} y={y + h / 2 - 3} textAnchor="middle" style={TEXT.title}>{name}</text>
    <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" style={TEXT.mono}>{note}</text>
  </g>
)

const StateMachineSvg = () => {
  const p = "state"
  return (
    <svg
      viewBox="0 0 1180 390"
      role="img"
      aria-label="AI1 application statuses as built: pending moves to approved or denied directly, or to pending_vendor, in_review, or error_retrying. in_review moves to approved or denied when a reviewer decides, and answering review questions re-runs the evaluation. approved moves to active when accounts are picked. Moving out of pending_vendor needs the planned webhook worker, and error_retrying has no retry yet."
      className="block h-auto w-full"
    >
      <Markers prefix={p} />

      <line x1="20" y1="16" x2="60" y2="16" strokeWidth={1.6} {...LINE.sync} markerEnd={`url(#${p}-sync)`} />
      <text x="68" y="20" style={TEXT.body}>Built</text>
      <line x1="130" y1="16" x2="170" y2="16" strokeWidth={1.6} {...LINE.planned} markerEnd={`url(#${p}-planned)`} />
      <text x="178" y="20" style={TEXT.body}>Planned</text>

      <State x={20} y={150} w={150} h={56} name="pending" note="application created" stroke={COLORS.ai1} strokeWidth={1.5} />
      <State x={340} y={50} name="pending_vendor" note="202 · waiting on a vendor" />
      <State x={340} y={150} h={56} name="in_review" note="Manual Review · missing data" />
      <State x={340} y={262} name="error_retrying" note="5xx · timeout · no retry yet" />
      <State x={760} y={80} w={170} h={56} name="approved" note="→ pick accounts" stroke={COLORS.ok} strokeWidth={2} />
      <State x={760} y={220} w={170} h={56} name="denied" note="30-day cool-off" stroke={COLORS.bad} strokeWidth={2} />
      <State x={990} y={80} w={170} h={56} name="active" note="accounts linked" />

      {/* Straight from Alloy's answer at sign-up */}
      <Arrow prefix={p} d="M95,150 C120,-10 650,-10 758,100" />
      <Label x={400} y={14} anchor="middle">Approved (sign-up response)</Label>
      <Arrow prefix={p} d="M95,206 C120,390 650,390 758,250" />
      <Label x={400} y={374} anchor="middle">Denied (sign-up response)</Label>
      <Arrow prefix={p} d="M170,168 C250,140 270,76 338,76" />
      <Arrow prefix={p} d="M170,178 L338,178" />
      <Arrow prefix={p} d="M170,190 C250,215 270,288 338,288" />

      {/* Review */}
      <Arrow prefix={p} d="M470,150 C470,116 530,116 530,148" />
      <Label x={462} y={124} anchor="end">answers re-run it</Label>
      <Arrow prefix={p} d="M540,168 C640,160 690,118 758,112" />
      <Arrow prefix={p} d="M540,190 C640,198 690,240 758,244" />
      <Label x={600} y={232} anchor="middle">review decision</Label>

      {/* Vendor results arrive by webhook, which nothing processes yet */}
      <Arrow prefix={p} kind="planned" d="M540,72 C640,70 690,92 758,98" />
      <Arrow prefix={p} kind="planned" d="M540,86 C650,110 700,200 758,234" />
      <Label x={845} y={182} kind="planned" anchor="middle">vendor results (planned)</Label>

      <Arrow prefix={p} d="M930,108 L988,108" />
      <Label x={959} y={70} anchor="middle">picks accounts</Label>
    </svg>
  )
}

// ---------- Page building blocks ----------

const Code = ({ children }) => (
  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-gray-100">{children}</code>
)

const Pre = ({ children }) => (
  <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[13px] leading-relaxed text-gray-200">
    <code>{children}</code>
  </pre>
)

const TAG_STYLES = {
  sync: "bg-brand/20 text-brand-light",
  async: "bg-orange-500/15 text-orange-300",
  planned: "bg-white/10 text-gray-400",
}

const Tag = ({ kind, children }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${TAG_STYLES[kind]}`}>
    {children ?? kind}
  </span>
)

const H2 = ({ id, children }) => (
  <h2 id={id} className="mt-16 border-t border-white/10 pt-8 text-2xl font-extrabold tracking-tight text-white">
    {children}
  </h2>
)

const H3 = ({ children }) => <h3 className="mt-10 mb-3 text-lg font-bold text-white">{children}</h3>

const P = ({ children }) => <p className="my-3 max-w-3xl leading-relaxed text-gray-300">{children}</p>

const Panel = ({ title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    {title && <h3 className="mb-3 font-bold text-white">{title}</h3>}
    {children}
  </div>
)

const List = ({ ordered, children }) => {
  const ListTag = ordered ? "ol" : "ul"
  return (
    <ListTag className={`space-y-2 pl-5 text-sm leading-relaxed text-gray-300 ${ordered ? "list-decimal" : "list-disc"}`}>
      {children}
    </ListTag>
  )
}

const Figure = ({ caption, children }) => (
  <figure className="card mt-6 p-4 sm:p-6">
    {/* The diagram keeps its size and scrolls sideways on small screens */}
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">{children}</div>
    </div>
    <figcaption className="mt-4 text-sm leading-relaxed text-gray-600">{caption}</figcaption>
  </figure>
)

const Table = ({ head, rows, minWidth = "min-w-[760px]" }) => (
  <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
    <table className={`w-full ${minWidth} border-collapse text-left text-sm`}>
      <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-400">
        <tr>
          {head.map((h) => (
            <th key={h} className="px-4 py-3 font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 text-gray-300">
        {rows.map((cells, i) => (
          <tr key={i} className="align-top">
            {cells.map((cell, j) => (
              <td key={j} className="px-4 py-3 leading-relaxed">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const Outcome = ({ tone, children }) => {
  const color = { ok: "text-green-300", bad: "text-red-300", warn: "text-amber-300", info: "text-brand-light" }[tone]
  return <span className={`font-semibold ${color}`}>{children}</span>
}

// ---------- Content ----------

const steps = [
  ["0", "Browser → Geoapify", "Autocomplete",
    "Partial address text in, a structured address back (street, city, state code, ZIP). The form takes one address, the current one.",
    <Tag key="t" kind="sync" />],
  ["–", "Browser → API", <Code key="c">GET /api/auth/email-available</Code>,
    <>Returns <Code>{"{ available }"}</Code>. The route exists, but the sign-up form doesn&apos;t call it yet. The <Code>UNIQUE</Code> index on <Code>users.email</Code> is the real guard: a duplicate gets <b>409</b> on submit.</>,
    <Tag key="t" kind="sync" />],
  ["1", "Browser → API", <Code key="c">POST /api/signup</Code>,
    "Name, DOB, SSN, email, password and address as JSON. zod checks every field again on the server: a 12+ character password, a 9-digit SSN, a 2-letter state, a 5-digit ZIP, US only. The SSN is never logged or sent back.",
    <Tag key="t" kind="sync" />],
  ["2", "API → Postgres", "One nested create",
    <>Creates <Code>users</Code> (<Code>kycStatus</Code> pending, bcrypt hash, <Code>ssnLast4</Code>, encrypted DOB), its <Code>addresses</Code> row and a pending <Code>kyc_applications</Code> row <b>before</b> calling Alloy. Then it sets the session cookie, so the applicant stays signed in even if Alloy is slow.</>,
    <Tag key="t" kind="sync" />],
  ["3", "API → Alloy", <Code key="c">POST /v1/evaluations</Code>,
    <>The flat body below, Basic auth with the workflow token and secret, and <Code>Alloy-External-Entity-ID: users.id</Code>. 20-second timeout, no retry yet. In demo mode no call goes out.</>,
    <Tag key="t" kind="sync" />],
  ["4", "Alloy → API", "Response",
    <><Code>lib/kyc</Code> turns it into a status (table below). It saves the tokens, outcome, reasons, tags and required fields, writes <Code>audit_log</Code>, and queues a <Code>notifications</Code> row. The browser then goes to <Code>/onboarding</Code>.</>,
    <Tag key="t" kind="sync" />],
  ["5", "Browser → Next.js server", <Code key="c">/onboarding</Code>,
    "The status screen is rendered on the server from our database, never from Alloy, each time it loads. It doesn't poll yet: the applicant refreshes.",
    <Tag key="t" kind="sync" />],
  ["6", "Browser → API → Alloy", <><Code>PATCH /api/applications/[id]</Code><br /><Code>POST …/[id]/documents</Code></>,
    <>During review, answers go to <Code>{"PATCH /v1/evaluations/{token}"}</Code> and Alloy&apos;s new result is applied the same way as step 4. Files go to Alloy&apos;s Documents API (create the record, then upload the bytes) and are logged in <Code>audit_log</Code>.</>,
    <Tag key="t" kind="sync" />],
  ["7", "Alloy → Webhook receiver", <Code key="c">POST /webhooks/alloy</Code>,
    <>Checks the HMAC over the raw body, stores the event once in <Code>alloy_webhook_events</Code> (<Code>request_token</Code> UNIQUE) and answers 200.</>,
    <Tag key="t" kind="async" />],
  ["8", "Worker → Alloy, email", "—",
    <>Process stored events: re-fetch the evaluation from Alloy, apply review decisions with <Code>applyReviewDecision</Code>, and send queued emails. Not built yet.</>,
    <Tag key="t" kind="planned" />],
  ["9", "Browser → API", <><Code>GET /api/accounts/options</Code><br /><Code>POST /api/accounts/select</Code></>,
    "The approved applicant picks demo accounts. One transaction flips approved → active (so a double submit can't link twice), creates the accounts and their sample transactions, and writes audit_log.",
    <Tag key="t" kind="sync" />],
  ["10", "Browser → Next.js server", <Code key="c">/dashboard</Code>,
    <>Reads the accounts and the last 10 transactions straight from the database. Anyone who isn&apos;t active is sent to <Code>/onboarding</Code>.</>,
    <Tag key="t" kind="sync" />],
]

const statusMapping = [
  ["202: waiting on a data vendor", <Outcome key="o" tone="info">pending_vendor</Outcome>],
  [<>Any success response with a <Code>required</Code> list (Alloy documents this as 200 Waiting)</>, <><Outcome tone="warn">in_review</Outcome>, with each <Code>required[].key</Code> saved in <Code>requiredFields</Code></>],
  ["201 (or 206) with outcome Approved", <Outcome key="o" tone="ok">approved</Outcome>],
  ["201 (or 206) with outcome Denied", <Outcome key="o" tone="bad">denied</Outcome>],
  ["201 (or 206) with Manual Review, or an outcome it doesn't recognize", <Outcome key="o" tone="warn">in_review</Outcome>],
  ["4xx, 5xx, or no response (timeout, network error)", <><Outcome tone="bad">error_retrying</Outcome>, with <Code>lastErrorCode</Code></>],
]

const outcomes = [
  [
    <><Outcome tone="ok">Approved</Outcome><br /><span className="text-xs text-gray-400">In the sign-up response, after answering review questions, or by a review decision</span></>,
    <>Application <Code>approved</Code>, outcome and <Code>decidedAt</Code> saved. User <Code>approved</Code>, <Code>approvedAt</Code>.</>,
    "\"You're approved, {name}!\", then Choose your accounts.",
    <>Queued in <Code>notifications</Code>. Sending is <Tag kind="planned">planned</Tag></>,
    <>The applicant picks accounts. <Code>POST /api/accounts/select</Code> creates them with sample transactions and makes the user <Code>active</Code>, which unlocks the dashboard.</>,
  ],
  [
    <Outcome key="o" tone="bad">Denied</Outcome>,
    <>Application <Code>denied</Code>, <Code>decidedAt</Code>, reasons kept internal. User <Code>denied</Code>, <Code>reapplyAfter</Code> = decision + 30 days. No accounts.</>,
    "\"We couldn't open an account for you. We weren't able to verify your identity. You can apply again after {date}.\" No reasons are shown.",
    <>Queued. Sending is <Tag kind="planned">planned</Tag></>,
    <>Nothing else yet. Reapplying and blocking repeat sign-ups are <Tag kind="planned">planned</Tag> (see the cool-off section).</>,
  ],
  [
    <><Outcome tone="warn">Manual Review</Outcome><br /><span className="text-xs text-gray-400">Also when Alloy is waiting on missing fields: there&apos;s no separate &quot;needs info&quot; status</span></>,
    <>Application <Code>in_review</Code>, <Code>reviewStartedAt</Code>, <Code>slaDueAt</Code> (48 hours, kept if review repeats), <Code>requiredFields</Code>.</>,
    "\"We're taking a closer look… up to 2 days.\" Plus Answer a few questions when Alloy asked for fields, and Upload a document with a list of what's been sent.",
    "Queued once per application.",
    <>Answers re-run the evaluation. A reviewer decides: the demo buttons today, Alloy&apos;s webhook through the worker <Tag kind="planned">planned</Tag>.</>,
  ],
  [
    <><Outcome tone="info">Pending vendor</Outcome><br /><span className="text-xs text-gray-400">HTTP 202</span></>,
    <>Application <Code>pending_vendor</Code>, tokens saved.</>,
    "\"We're still checking your details. Refresh this page to see if it's done.\"",
    "None.",
    <>Alloy&apos;s <Code>update:evaluations:async_update</Code> webhook is received and stored. Applying it is <Tag kind="planned">planned</Tag></>,
  ],
  [
    <><Outcome tone="warn">Partial / exited early</Outcome><br /><span className="text-xs text-gray-400">HTTP 206: a data service failed or lacked data</span></>,
    <>Status follows the outcome Alloy returned, and <Code>exitedEarly</Code> is set.</>,
    "Same as that outcome (usually Manual Review).",
    "Same as that outcome.",
    "Treated as that outcome. The flag lets a reviewer or ops see that the workflow didn't run every check.",
  ],
  [
    <><Outcome tone="bad">System error</Outcome><br /><span className="text-xs text-gray-400">Alloy 4xx/5xx, timeout, network error</span></>,
    <>Application <Code>error_retrying</Code>, <Code>attemptCount</Code>, <Code>lastErrorCode</Code> (&quot;network&quot; or the HTTP status).</>,
    "\"We hit a problem checking your details. This is on our end, not yours.\" No raw errors are shown.",
    "None.",
    <>Retrying is <Tag kind="planned">planned</Tag>. The full SSN isn&apos;t stored, so a retry would need the applicant to enter it again.</>,
  ],
]

const requestExample = `POST https://sandbox.alloy.co/v1/evaluations                // ALLOY_BASE_URL; sandbox by default
Authorization: Basic base64(workflow_token:workflow_secret)  // selects the onboarding workflow
Alloy-External-Entity-ID: 3f6c2a9e-…                         // users.id: links Alloy's entity to our row
Content-Type: application/json

{
  "name_first": "Ada",
  "name_last": "Lovelace",
  "birth_date": "1990-12-10",
  "document_ssn": "123456789",        // from this request only; never stored
  "email_address": "ada@example.com",
  "phone_number": "5555550123",       // only if provided; the sign-up form doesn't ask yet
  "address_line_1": "1 Main St",
  "address_line_2": "Apt 4",
  "address_city": "Brooklyn",
  "address_state": "NY",
  "address_postal_code": "11201",
  "address_country_code": "US"        // the API only accepts US addresses
}`

const responseExample = `HTTP 201                                // lib/alloy.js uses the HTTP status
{
  "evaluation_token": "L-…",            // saved; used by PATCH /v1/evaluations/{token}
  "entity_token": "P-…",                // saved; used by the Documents API
  "application_token": "…",             // saved
  "summary": {
    "outcome": "Approved",              // Approved | Denied | Manual Review
    "outcome_reasons": [ … ],           // saved for audit, never shown to the applicant
    "tags": [ … ]                       // saved for audit, never shown to the applicant
  },
  "required": [ { "key": "phone_number", … } ]   // keys saved as requiredFields, no values
}`

const webhookExample = `// app/webhooks/alloy/route.js (shortened)
export async function POST(request) {
  const raw = await request.text()        // the raw body, before JSON parsing
  if (!verifyWebhook(raw, request.headers.get("authorization"))) {
    return Response.json({ error: "Bad signature" }, { status: 401 })
  }

  const event = JSON.parse(raw)
  // request_token is UNIQUE, so a repeat delivery is skipped
  await prisma.alloyWebhookEvent.createMany({
    data: [{ requestToken: event.request_token, type: event.type, payload: event }],
    skipDuplicates: true,
  })
  return new Response(null, { status: 200 })  // a worker will process it (planned)
}

// app/lib/alloy.js (shortened)
export function verifyWebhook(rawBody, signature) {
  const given = Buffer.from(signature, "base64")
  const expected = crypto
    .createHmac("sha256", process.env.ALLOY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest()
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}`

const references = [
  ["Onboard a Person (POST /v1/evaluations)", "https://developer.alloy.com/public/reference/onboard-a-person-1"],
  ["Evaluation status overview", "https://help.alloy.com/en/articles/16820388-evaluation-status-overview"],
  ["PATCH evaluation", "https://developer.alloy.com/public/reference/patch_evaluations-evaluation-token"],
  ["GET evaluation", "https://developer.alloy.com/public/reference/get_entities-entity-token-evaluations-evaluation-token-2"],
  ["External Entity ID", "https://developer.alloy.com/public/docs/entities-evaluations"],
  ["Manual review via API", "https://developer.alloy.com/public/reference/manually-reviewing-via-api"],
  ["Webhook events", "https://developer.alloy.com/public/docs/webhook-events"],
  ["HMAC", "https://developer.alloy.com/public/docs/hash-based-message-authentication-code-hmac"],
  ["Webhook source IPs", "https://developer.alloy.com/public/docs/webhook-source-ip-addresses"],
]

// ---------- Page ----------

const ArchitectureDiagram = () => {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
      <p className="section-title px-0">Architecture</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        AI1 (All-in-One) × Alloy: Onboarding Solutions Architecture
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300">
        How an applicant&apos;s data moves from the AI1 sign-up page, through the AI1 back end, to Alloy&apos;s Evaluations
        API and back, and what the app does with every outcome Alloy can return.
      </p>
      <p className="mt-3 max-w-3xl text-sm text-gray-400">
        This page describes what&apos;s built. Parts of the design that aren&apos;t built yet are marked{" "}
        <Tag kind="planned">planned</Tag>.
      </p>

      {/* ============ 1. Architecture ============ */}
      <H2 id="architecture">1. End-to-end architecture</H2>

      <Figure
        caption={
          <>
            Solid arrows are synchronous calls that wait for a response. The orange dashed arrow is Alloy&apos;s webhook, which
            arrives later. Gray dashed boxes and arrows are planned. The browser never talks to Alloy: only the Next.js server
            holds Alloy credentials. The numbers match the step table below.
          </>
        }
      >
        <ArchitectureSvg />
      </Figure>

      <H3>Where the components sit</H3>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="AI1 (built in this repo)">
          <List>
            <li><b className="text-white">Front end</b>: Next.js pages for Home, Log in, Sign up, the status screen, the account picker, Dashboard and Settings, with a shared header and footer. &quot;Create account&quot; goes to <Code>/signup</Code>.</li>
            <li><b className="text-white">Next.js server</b>: the API routes under <Code>app/api</Code> are the only code that calls Alloy. The status, dashboard and settings pages are rendered on the server and read Postgres directly.</li>
            <li><b className="text-white">Webhook receiver</b>: <Code>POST /webhooks/alloy</Code>, a route in the same app. It checks the signature and stores each event once.</li>
            <li><b className="text-white">PostgreSQL</b> through Prisma: the system of record for users, applications and accounts. Secrets come from environment variables.</li>
            <li><b className="text-white">Planned</b>: a worker to process stored webhooks and send emails, and an IP allowlist in front of the webhook route.</li>
          </List>
        </Panel>
        <Panel title="Alloy (SaaS, outside our network)">
          <List>
            <li>Runs the onboarding <b className="text-white">workflow</b> that the workflow token points to: it calls data vendors (identity, SSN, watchlists, fraud), applies rules, and sets an outcome.</li>
            <li>Hosts the <b className="text-white">Review Queue</b>, where compliance analysts work Manual Review cases, and stores uploaded documents on the applicant&apos;s entity.</li>
            <li>Sends <b className="text-white">webhooks</b> when a reviewer decides (<Code>create:reviews:is_entity</Code>), when a pending evaluation finishes (<Code>update:evaluations:async_update</Code>), and for ongoing monitoring (<Code>create:evaluations:recurring_create</Code>). AI1 receives and stores them; processing is planned.</li>
            <li><b className="text-white">Demo mode</b> (<Code>ALLOY_DEMO=true</Code>): <Code>lib/alloy.js</Code> answers in Alloy&apos;s place and nothing is sent. The last name picks the outcome: Needsinfo, Review, Denied, or anything else for Approved.</li>
          </List>
        </Panel>
      </div>

      <H3>Step by step: synchronous vs. asynchronous</H3>
      <Table head={["#", "From → To", "Call", "What's sent / returned", "Mode"]} rows={steps} minWidth="min-w-[900px]" />

      <H3>What the back end sends to Alloy (call ③)</H3>
      <Pre>{requestExample}</Pre>

      <H3>What comes back (call ④) and what lib/kyc does with it</H3>
      <Pre>{responseExample}</Pre>
      <Table head={["Alloy returns", "Status lib/kyc sets"]} rows={statusMapping} minWidth="min-w-[560px]" />
      <P>
        Which fields Alloy requires depends on the data services in your workflow; <Code>GET /v1/parameters</Code> shows exactly
        what it expects. The evaluation body has one set of <Code>address_*</Code> fields, so AI1 sends the current address.
      </P>

      <H3>Receiving webhooks securely</H3>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <List ordered>
            <li><b className="text-white">HMAC.</b> Alloy signs the body with HMAC-SHA256 using a shared secret and sends the base64 digest in the <Code>authorization</Code> header. The route reads the raw body, recomputes the signature and compares in constant time. A mismatch gets 401.</li>
            <li><b className="text-white">Duplicates.</b> Events go into <Code>alloy_webhook_events</Code> with <Code>request_token</Code> UNIQUE. A repeat delivery is skipped and still gets 200.</li>
            <li><b className="text-white">Fast reply.</b> The route only stores the event and returns 200, well inside Alloy&apos;s 10-second timeout.</li>
            <li><b className="text-white">Network layer</b> <Tag kind="planned">planned</Tag>: accept <Code>/webhooks/alloy</Code> only from Alloy&apos;s published source IPs, at the load balancer.</li>
            <li><b className="text-white">Replay window</b> <Tag kind="planned">planned</Tag>: reject events whose <Code>timestamp</Code> is too old.</li>
            <li><b className="text-white">Worker and reconciler</b> <Tag kind="planned">planned</Tag>: re-fetch the evaluation instead of trusting the webhook body, only move statuses forward, and re-check anything stuck for hours.</li>
          </List>
        </Panel>
        <Pre>{webhookExample}</Pre>
      </div>

      <H3>Protecting sensitive data</H3>
      <List>
        <li><b className="text-white">In the UI</b>: the SSN field is a masked input (<Code>type=&quot;password&quot;</Code>, numeric keyboard, autocomplete off). Form data is never logged. After sign-up, only <Code>•••-••-1234</Code> is shown, in Settings.</li>
        <li><b className="text-white">At rest</b>: only <Code>ssnLast4</Code> is stored. The full SSN goes to Alloy during the sign-up request and is then dropped. The date of birth is encrypted with AES-256-GCM using a key per user, and that key is wrapped by a master key from an environment variable (a cloud key service is the production plan). Passwords are hashed with bcrypt.</li>
        <li><b className="text-white">Sessions</b>: an encrypted iron-session cookie that scripts can&apos;t read, sent only over HTTPS in production, valid for 8 hours. A wrong email and a wrong password get the same error and take the same time.</li>
        <li><b className="text-white">What applicants see</b>: Alloy&apos;s tags and outcome reasons are stored for audit and never sent to the browser.</li>
        <li><Tag kind="planned">planned</Tag> Log redaction, rate limiting on log-in and the email check, and secrets in a secrets manager.</li>
      </List>

      {/* ============ 2. Outcomes ============ */}
      <H2 id="outcomes">2. Handling the outcomes</H2>
      <P>
        Alloy decisions resolve to three outcomes: <Outcome tone="ok">Approved</Outcome>, <Outcome tone="bad">Denied</Outcome> and{" "}
        <Outcome tone="warn">Manual Review</Outcome>. The HTTP status says whether decisioning has finished. AI1 mirrors this in
        one state machine on <Code>kyc_applications.status</Code> and <Code>users.kycStatus</Code>, and every change writes an{" "}
        <Code>audit_log</Code> row. Missing data isn&apos;t a separate status: when Alloy asks for more fields, the application goes
        to review and the review screen asks for them.
      </P>

      <Figure
        caption={
          <>
            Solid arrows are built and happen inside a request: sign-up, answering review questions, a review decision, picking
            accounts. Gray dashed arrows need the planned webhook worker. Only <Code>approved → active</Code> unlocks the
            dashboard.
          </>
        }
      >
        <StateMachineSvg />
      </Figure>

      <Table head={["Outcome / status", "Database", "In the UI", "Email", "What happens next"]} rows={outcomes} minWidth="min-w-[1000px]" />

      <H3>30-day cool-off after a denial</H3>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Built">
          <List>
            <li>When an application is denied, the same transaction sets <Code>users.reapplyAfter</Code> to 30 days after the decision. That&apos;s true whether the denial came in Alloy&apos;s response or from a reviewer, so a denial after review counts from the reviewer&apos;s decision.</li>
            <li>The 30 days is <Code>DENIAL_COOLDOWN_DAYS</Code> in <Code>lib/kyc.js</Code>.</li>
            <li>The denied screen shows the date they can apply again.</li>
            <li>Emails are unique, so the same email can&apos;t sign up twice.</li>
          </List>
        </Panel>
        <Panel title="Planned">
          <List>
            <li>A reapply route that returns 403 during the cool-off, checked before any Alloy call.</li>
            <li>A <Code>denial_blocks</Code> table (normalized email plus an HMAC of the SSN), so a new account with a different email but the same SSN gets a generic &quot;We can&apos;t open an application right now&quot;.</li>
            <li>A day-30 &quot;You can apply again&quot; email, and clearing the block if a denial is reversed on review.</li>
          </List>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="How a Manual Review case gets worked">
          <List ordered>
            <li>Alloy returns Manual Review, or says it&apos;s waiting on missing fields (a <Code>required</Code> list). <Code>lib/kyc</Code> sets <Code>in_review</Code>, records when review started and a 48-hour deadline, and queues the email.</li>
            <li>If Alloy asked for fields, the review screen shows a form built from <Code>requiredFields</Code>. Answers go to <Code>{"PATCH /v1/evaluations/{token}"}</Code>, a phone number is also saved to the profile, and Alloy&apos;s new result goes through the same code as sign-up.</li>
            <li>The applicant can upload a driver&apos;s license, passport or utility bill (JPEG, PNG or PDF, up to 10 MB). It goes to Alloy&apos;s Documents API and is recorded in <Code>audit_log</Code>. The upload shows during every review; asking only when a reviewer requests it is <Tag kind="planned">planned</Tag></li>
            <li>A reviewer decides. In demo mode, Approve review and Deny review call <Code>POST /api/applications/[id]/review</Code> (a 404 outside demo mode). In production, Alloy&apos;s <Code>create:reviews:is_entity</Code> webhook would go through the worker <Tag kind="planned">planned</Tag></li>
            <li>Both paths call <Code>applyReviewDecision</Code>, which records the outcome, clears open questions, writes a <Code>review_decided</Code> audit row and queues the email.</li>
          </List>
        </Panel>
        <Panel title="How the decision gets back to the applicant">
          <List>
            <li><b className="text-white">One code path</b>: Alloy responses (<Code>applyAlloyResponse</Code>) and review decisions (<Code>applyReviewDecision</Code>) both save through <Code>recordStatus</Code>. One transaction updates the application and user, writes <Code>audit_log</Code> and queues the email.</li>
            <li><b className="text-white">UI</b>: the status screen reads our database each time it loads, and the review form and demo buttons reload it right away. The dashboard sends anyone who isn&apos;t active back to the status screen.</li>
            <li><b className="text-white">Email</b>: <Code>notifications</Code> rows are unique per application and template, so the same email is never queued twice. Sending them is <Tag kind="planned">planned</Tag></li>
          </List>
        </Panel>
      </div>

      <H3>Sync vs. async at a glance</H3>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Synchronous (the applicant is waiting)">
          <List>
            <li>Address autocomplete</li>
            <li><Code>POST /api/signup</Code>, then the database write, then Alloy <Code>POST /v1/evaluations</Code></li>
            <li>Instant outcomes when Alloy has finished deciding</li>
            <li>Answering review questions (<Code>PATCH</Code>) and uploading documents</li>
            <li>Demo review decisions</li>
            <li>Loading the status screen and dashboard from our database</li>
            <li>Picking accounts</li>
          </List>
        </Panel>
        <Panel title="Asynchronous (the applicant may be gone)">
          <List>
            <li>Receiving Alloy webhooks: verified and stored</li>
            <li><Tag kind="planned">planned</Tag> Processing them in a worker</li>
            <li><Tag kind="planned">planned</Tag> Sending emails</li>
            <li><Tag kind="planned">planned</Tag> Retrying Alloy errors, and a reconciler for stuck applications</li>
            <li><Tag kind="planned">planned</Tag> Live updates on the status screen</li>
          </List>
        </Panel>
      </div>

      <p className="mt-12 text-xs leading-relaxed text-gray-500">
        References, from Alloy&apos;s developer docs and help center:{" "}
        {references.map(([label, href], i) => (
          <span key={href}>
            <a href={href} className="text-brand-light hover:underline" target="_blank" rel="noreferrer">{label}</a>
            {i < references.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
    </div>
  )
}

export default ArchitectureDiagram
