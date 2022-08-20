<script context="module" lang="ts">
  /** @type {import('@sveltejs/kit').Load} */
  export async function load({ props }) {
    return {
      props,
    }
  }
</script>

<script lang="ts">
  import { Content, Link, Grid, Row, Column } from 'carbon-components-svelte'
  import type { Question } from '@prisma/client'
  import Launch from 'carbon-icons-svelte/lib/Launch.svelte'

  export let question: Question

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
          {title}
        </p>
        <Link href="{question.url}">View in Discord<Launch /></Link>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  p {
    margin-bottom: var(--cds-layout-02);
  }
</style>
