<script lang="ts">
  import type { PageData } from './$types'
  import { Content, Link, Grid, Row, Column } from 'carbon-components-svelte'
  import Launch from 'carbon-icons-svelte/lib/Launch.svelte'

  export let data: PageData
  const { question } = data

  let title =
    question.title.length > 64
      ? question.title.slice(0, 61) + '...'
      : question.title
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Content>
  <Grid>
    <Row>
      <Column>
        <Link href="/questions">&larr; Back to Questions</Link>
        <h1>Question {question.isSolved ? '(Solved)' : ''}</h1>
        <p>
          {question.title}
        </p>
        <Link href="{question.url?.replace(/^https/, 'discord')}">
          View in Discord
          <Launch />
        </Link>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  p {
    margin-bottom: var(--cds-layout-02);
  }
</style>
