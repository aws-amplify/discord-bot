<script lang="ts">
  import type { PageData } from './$types'
  import {
    Content,
    Grid,
    Row,
    Column,
    UnorderedList,
    ListItem,
    Link,
    Search,
  } from 'carbon-components-svelte'
  import fuzzy from 'fuzzy'
  import type { Question } from '@prisma/client'

  const { match } = fuzzy

  export let data: PageData
  $: ({ questions } = data)
  let filtered: Question[] = questions

  let search = ''

  $: filtered = questions.filter((question) => match(search, question.title))
</script>

<svelte:head>
  <title>Discord Questions</title>
</svelte:head>

<Content>
  <Grid>
    <Row>
      <Column class="ha--questions">
        <h1>Discord Questions</h1>
        <div class="ha--search-form">
          <Search placeholder="{'Search questions'}" bind:value="{search}" />
        </div>
        <UnorderedList>
          {#each filtered as question}
            <ListItem>
              <Link href="{`/questions/${question.id}`}"
                >{question.isSolved ? '✅' : '﹖'} [{question.channelName}] {question.title}</Link
              >
            </ListItem>
          {/each}
        </UnorderedList>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  :global(.ha--search-form) {
    display: flex;
    flex-direction: row;

    position: relative;
    left: unset;
    bottom: unset;
    right: unset;
  }

  @media (max-width: 33rem) {
    :global(.ha--search-form) {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  :global(.ha--questions) {
    display: grid;
    grid-gap: var(--cds-layout-02);
  }
</style>
