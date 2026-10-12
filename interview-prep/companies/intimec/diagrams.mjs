// SVG diagrams for the Intimec defense page. Keys match the "diagram:NAME" tag on code fences in intimec-defense.md.
// Uses only the shared diagram classes from interview-prep/assets/style.css (n p g o r v, h m, ln lnp lnx, dash).
const RED = 'style="fill:var(--red)"';

export const diagrams = {
  architecture: {
    caption: 'One entry point, 11 services, one shared PostgreSQL. TLS ends at the edge proxy (inferred); everything inside is plain HTTP/gRPC.',
    svg: `<svg class="d" viewBox="0 0 760 420">
  <rect class="n" x="300" y="8" width="160" height="34" rx="8"/><text x="344" y="30">Browser / UI</text>
  <path class="ln" d="M380 42 V58"/>
  <rect class="v" x="240" y="60" width="280" height="36" rx="8"/><text x="262" y="83">Traefik (Dokploy) · TLS ends here*</text>
  <path class="ln" d="M380 96 V110"/>
  <rect class="p" x="230" y="112" width="300" height="46" rx="8"/><text class="h" x="318" y="132">API Gateway :8081</text><text class="m" x="262" y="148">JWT check · permission check · session</text>
  <path class="ln" d="M380 158 V172"/>
  <rect class="g dash" x="5" y="172" width="750" height="144" rx="12"/><text class="m" x="16" y="190">11 Spring Boot services (Docker Compose on dokploy-network). Sync: gRPC (plaintext). Async: Kafka.</text>
  <rect class="g" x="14" y="200" width="138" height="48" rx="8"/><text x="46" y="220">auth</text><text class="m" x="46" y="236">8090 / 8002</text>
  <rect class="g" x="164" y="200" width="138" height="48" rx="8"/><text x="196" y="220">identity</text><text class="m" x="196" y="236">8094 / 9096</text>
  <rect class="p" x="314" y="200" width="138" height="48" rx="8"/><text x="334" y="220">access-portal</text><text class="m" x="334" y="236">8099 (yours)</text>
  <rect class="g" x="464" y="200" width="138" height="48" rx="8"/><text x="478" y="220">app-permissions</text><text class="m" x="478" y="236">8095 / 8001</text>
  <rect class="g" x="614" y="200" width="132" height="48" rx="8"/><text x="634" y="220">workflows</text><text class="m" x="634" y="236">8098</text>
  <rect class="n" x="14" y="258" width="138" height="48" rx="8"/><text x="46" y="278">core</text><text class="m" x="46" y="294">8091 / 9095</text>
  <rect class="n" x="164" y="258" width="138" height="48" rx="8"/><text x="196" y="278">configuration</text><text class="m" x="196" y="294">8092 / 9091</text>
  <rect class="n" x="314" y="258" width="138" height="48" rx="8"/><text x="334" y="278">connector-runtime</text><text class="m" x="334" y="294">8093 / 9094</text>
  <rect class="n" x="464" y="258" width="138" height="48" rx="8"/><text x="478" y="278">task-management</text><text class="m" x="478" y="294">8096</text>
  <rect class="n" x="614" y="258" width="132" height="48" rx="8"/><text x="634" y="278">llm</text><text class="m" x="634" y="294">8097</text>
  <path class="ln" d="M380 316 V332"/>
  <rect class="o" x="5" y="334" width="176" height="72" rx="8"/><text class="h" x="18" y="358">PostgreSQL</text><text class="m" x="18" y="378">ONE shared DB (~100 tables)</text><text class="m" x="18" y="394">runs on the host</text>
  <rect class="o" x="197" y="334" width="176" height="72" rx="8"/><text class="h" x="210" y="358">Kafka</text><text class="m" x="210" y="378">1 broker, KRaft, RF=1</text><text class="m" x="210" y="394">topics auto-created</text>
  <rect class="o" x="389" y="334" width="176" height="72" rx="8"/><text class="h" x="402" y="358">OpenSearch</text><text class="m" x="402" y="378">logs + audit search</text><text class="m" x="402" y="394">1 node, security off</text>
  <rect class="o" x="581" y="334" width="174" height="72" rx="8"/><text class="h" x="594" y="358">Dgraph</text><text class="m" x="594" y="378">graph projection of</text><text class="m" x="594" y="394">roles + entitlements</text>
</svg>`,
  },

  accessflow: {
    caption: 'The approval pipeline. The Kafka send happens inside the database transaction: that is the dual-write risk the outbox removes.',
    svg: `<svg class="d" viewBox="0 0 760 310">
  <rect class="n" x="10" y="40" width="104" height="48" rx="8"/><text x="28" y="68">User cart</text>
  <path class="ln" d="M114 64 H138"/>
  <rect class="p" x="140" y="30" width="190" height="66" rx="8"/><text class="h" x="154" y="52">Access Portal</text><text class="m" x="154" y="70">submitRequest()  @Transactional</text><text class="m" x="154" y="86">save request + items + audit</text>
  <path class="ln" d="M330 63 H358"/>
  <rect class="o" x="360" y="40" width="130" height="48" rx="8"/><text class="h" x="378" y="62">role-events</text><text class="m" x="378" y="78">Kafka topic</text>
  <path class="ln" d="M490 64 H518"/>
  <rect class="g" x="520" y="30" width="170" height="66" rx="8"/><text class="h" x="534" y="52">workflows-service</text><text class="m" x="534" y="70">approval steps: manager,</text><text class="m" x="534" y="86">role owner, delegation</text>
  <text class="m" x="360" y="110" ${RED}>⚠ dual write: send inside the tx</text>
  <path class="ln" d="M605 96 V190 H534"/>
  <rect class="o" x="360" y="166" width="172" height="48" rx="8"/><text class="h" x="372" y="188">access-request-events</text>
  <path class="ln" d="M360 190 H334"/>
  <rect class="p" x="140" y="160" width="190" height="60" rx="8"/><text class="h" x="154" y="182">Portal consumer</text><text class="m" x="154" y="200">updates steps, status,</text><text class="m" x="154" y="214">provisioning, audit rows</text>
  <path class="ln" d="M235 220 V246"/>
  <rect class="o" x="140" y="248" width="190" height="42" rx="8"/><text x="154" y="274">PostgreSQL (request tables)</text>
  <text class="m" x="360" y="244">approval.created · approval.responded</text><text class="m" x="360" y="262">workflow.completed · provisioning.started</text><text class="m" x="360" y="280">role.assigned · role.assignment.failed</text>
</svg>`,
  },

  outbox: {
    caption: 'Left: two systems, no shared transaction. Right: the event is saved with the data; a relay delivers it later (at-least-once, so consumers dedupe by eventId).',
    svg: `<svg class="d" viewBox="0 0 760 310">
  <text class="h" x="16" y="22">Before: dual write</text>
  <rect class="n" x="16" y="36" width="170" height="52" rx="8"/><text x="30" y="58">submitRequest()</text><text class="m" x="30" y="76">save request + Kafka.send()</text>
  <path class="ln" d="M70 88 L70 144"/><path class="ln" d="M150 88 L260 144"/>
  <rect class="o" x="16" y="146" width="110" height="48" rx="8"/><text x="38" y="174">Postgres</text>
  <rect class="o" x="216" y="146" width="110" height="48" rx="8"/><text x="248" y="174">Kafka</text>
  <text class="m" x="16" y="222" ${RED}>commit fails after send = ghost event</text>
  <text class="m" x="16" y="240" ${RED}>send fails after commit = lost event</text>
  <text class="m" x="16" y="258" ${RED}>crash in between = either one</text>
  <path class="lnx" d="M380 20 V290"/>
  <text class="h" x="400" y="22">After: outbox</text>
  <rect class="p" x="400" y="36" width="200" height="52" rx="8"/><text x="414" y="58">submitRequest()</text><text class="m" x="414" y="76">ONE database transaction</text>
  <path class="ln" d="M500 88 V128"/>
  <rect class="o" x="400" y="130" width="210" height="64" rx="8"/><text class="h" x="414" y="152">Postgres</text><text class="m" x="414" y="170">request + items + audit</text><text class="m" x="414" y="186">+ outbox row (PENDING)</text>
  <path class="ln" d="M610 162 H648"/><text class="m" x="590" y="124">poll 1s · SKIP LOCKED</text>
  <rect class="v" x="650" y="136" width="100" height="52" rx="8"/><text class="h" x="660" y="160">OutboxRelay</text><text class="m" x="660" y="176">send + ack</text>
  <path class="ln" d="M700 188 V222"/>
  <rect class="o" x="650" y="224" width="100" height="44" rx="8"/><text x="684" y="252">Kafka</text>
  <text class="m" x="400" y="224">no ghost, no lost event</text><text class="m" x="400" y="242">relay retries with backoff</text><text class="m" x="400" y="260">DEAD rows trigger an alert</text>
  <text class="m" x="400" y="290">consumers dedupe by eventId (at-least-once)</text>
</svg>`,
  },

  ruleengine: {
    caption: 'One engine, four triggers. Matching happens in the database; every decision leaves an evidence receipt.',
    svg: `<svg class="d" viewBox="0 0 760 330">
  <rect class="n" x="10" y="30" width="180" height="46" rx="8"/><text x="22" y="50">create / update</text><text class="m" x="22" y="66">post-commit listener</text>
  <rect class="n" x="10" y="90" width="180" height="46" rx="8"/><text x="22" y="110">cron poller 60s</text><text class="m" x="22" y="126">FOR UPDATE SKIP LOCKED</text>
  <rect class="n" x="10" y="150" width="180" height="46" rx="8"/><text x="22" y="170">manual / evaluate-all</text><text class="m" x="22" y="186">API call</text>
  <path class="ln" d="M190 53 L236 82"/><path class="ln" d="M190 113 L236 100"/><path class="ln" d="M190 173 L236 112"/>
  <rect class="p" x="238" y="66" width="200" height="54" rx="8"/><text class="h" x="252" y="88">RuleEvaluationEngine</text><text class="m" x="252" y="106">safe wrapper, never throws</text>
  <path class="ln" d="M338 120 V140"/>
  <rect class="g dash" x="228" y="142" width="226" height="176" rx="10"/><text class="m" x="240" y="160">REQUIRES_NEW transaction per rule</text>
  <text class="m" x="242" y="188">1  WHERE: tenant + ACTIVE + groups</text>
  <text class="m" x="242" y="210">2  page through ids (500 / chunk)</text>
  <text class="m" x="242" y="232">3  bulk-load shadows + assignments</text>
  <text class="m" x="242" y="254">4  upsert / pending assignment</text>
  <text class="m" x="242" y="276">5  revoke stale assignments</text>
  <text class="m" x="242" y="298">6  save lastEvaluatedAt</text>
  <path class="ln" d="M454 190 H500"/><path class="ln" d="M454 232 H500"/><path class="ln" d="M454 276 H500"/>
  <rect class="o" x="502" y="166" width="248" height="46" rx="8"/><text x="516" y="186">history + match evidence</text><text class="m" x="516" y="202">JSONB receipt per identity</text>
  <rect class="v" x="502" y="212" width="248" height="46" rx="8"/><text x="516" y="232">audit: Kafka + DB table</text><text class="m" x="516" y="248">AOP aspect or engine</text>
  <rect class="g" x="502" y="258" width="248" height="46" rx="8"/><text x="516" y="278">result</text><text class="m" x="516" y="294">matched / created / revoked</text>
</svg>`,
  },

  authflow: {
    caption: 'Every API call: JWT verified locally, session activity written, permission checked over gRPC, then services trust the headers.',
    svg: `<svg class="d" viewBox="0 0 760 340">
  <rect class="n" x="8" y="140" width="100" height="52" rx="8"/><text x="26" y="170">Browser</text>
  <path class="ln" d="M108 166 H136"/>
  <rect class="p dash" x="138" y="14" width="316" height="316" rx="12"/><text class="h" x="154" y="36">API Gateway</text>
  <rect class="p" x="154" y="48" width="284" height="42" rx="8"/><text x="168" y="74">1  verify JWT (no database)</text>
  <rect class="p" x="154" y="100" width="284" height="42" rx="8"/><text x="168" y="126">2  set X-User-Id / X-Tenant-Id</text>
  <rect class="p" x="154" y="152" width="284" height="42" rx="8"/><text x="168" y="178">3  async gRPC: session activity</text>
  <rect class="p" x="154" y="204" width="284" height="42" rx="8"/><text x="168" y="230">4  gRPC: is endpoint managed?</text>
  <rect class="p" x="154" y="256" width="284" height="42" rx="8"/><text x="168" y="282">5  gRPC: has permission?</text>
  <path class="ln" d="M438 173 L512 92"/>
  <rect class="g" x="514" y="40" width="238" height="66" rx="8"/><text class="h" x="528" y="62">auth-service</text><text class="m" x="528" y="80">user_session.last_activity</text><text class="m" x="528" y="96">= a DB write on every request</text>
  <path class="ln" d="M438 225 L512 190"/><path class="ln" d="M438 277 L512 222"/>
  <rect class="g" x="514" y="150" width="238" height="100" rx="8"/><text class="h" x="528" y="172">app-permissions</text><text class="m" x="528" y="190">actions + roles + conditions</text><text class="m" x="528" y="206">Caffeine cache: grants, 5 min</text><text class="m" x="528" y="226" ${RED}>endpoint-managed check: uncached</text><text class="m" x="528" y="242" ${RED}>fails OPEN if service is down</text>
  <rect class="n" x="514" y="276" width="238" height="48" rx="8"/><text class="h" x="528" y="298">downstream service</text><text class="m" x="528" y="314">trusts the headers (no re-check)</text>
  <path class="ln" d="M438 120 C480 120 480 300 512 300"/>
</svg>`,
  },

  docker: {
    caption: 'A shared base-builder image means dependencies and shared libraries are built once, then reused by every service image.',
    svg: `<svg class="d" viewBox="0 0 760 210">
  <rect class="p" x="10" y="40" width="226" height="96" rx="10"/><text class="h" x="24" y="64">intimec-base-builder</text><text class="m" x="24" y="84">Maven deps downloaded once</text><text class="m" x="24" y="100">shared libs built once</text><text class="m" x="24" y="116">BuildKit cache mount (.m2)</text>
  <path class="ln" d="M236 88 H268"/><text class="m" x="240" y="32">FROM</text>
  <rect class="o" x="270" y="40" width="210" height="96" rx="10"/><text class="h" x="284" y="64">service builder stage</text><text class="m" x="284" y="84">copy ONLY this service</text><text class="m" x="284" y="100">mvn -pl service package</text><text class="m" x="284" y="116">-DskipTests</text>
  <path class="ln" d="M480 88 H512"/><text class="m" x="484" y="32">COPY jar</text>
  <rect class="g" x="514" y="40" width="236" height="96" rx="10"/><text class="h" x="528" y="64">runtime stage</text><text class="m" x="528" y="84">eclipse-temurin:21-jre-alpine</text><text class="m" x="528" y="100">non-root appuser · curl</text><text class="m" x="528" y="116">G1 GC flags via JAVA_TOOL_OPTIONS</text>
  <text class="m" x="10" y="176">11 services reuse the same cached base: minutes saved per build. Gaps: unpinned images, no resource limits, secrets in env.</text>
</svg>`,
  },
};
