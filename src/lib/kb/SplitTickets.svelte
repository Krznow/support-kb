<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { groupByCause, uniqueById, type Cause, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per cause found in a merged ticket, with the ticket that now owns it.
  // Counts come from the data at render time; only the ticket links are typed.
  type Outcome = { state: string; note: string; closed: string };
  let {
    ticket,
    tickets,
    outcomes = {},
  }: { ticket: number; tickets: Partial<Record<Cause | 'unplaced', string>>; outcomes?: Partial<Record<Cause | 'unplaced', Outcome>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));

  const WHAT: Record<string, string> = {
    parser: 'the shared parser reads day-first dates month first',
    hint: "booking-v3's form prints MM/DD/YYYY; people type month first, the form reads day first",
    unplaced: 'no tenant on file, or a month-first locale',
  };
  const issueNo = (url: string) => '#' + url.split('/').pop();
</script>

<table>
  <thead><tr><th>problem</th><th>cause</th><th>reports</th><th>share</th><th>ticket</th><th>outcome</th></tr></thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr>
        <td>{WHAT[g.cause]}</td>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{Math.round((g.reports.length / merged.length) * 100)}%</td>
        <td>{#if tickets[g.cause]}<a href={tickets[g.cause]}>{issueNo(tickets[g.cause])}</a>{:else}none yet{/if}</td>
        <td>{#if outcomes[g.cause]}<b>{outcomes[g.cause].state}</b> · {outcomes[g.cause].note} · closed {outcomes[g.cause].closed}{:else}open{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>
