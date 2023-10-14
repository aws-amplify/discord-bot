<script lang="ts">
  import {
    Breadcrumb,
    BreadcrumbItem,
    Content,
    Grid,
    Row,
    Column,
    OverflowMenu,
    OverflowMenuItem,
  } from 'carbon-components-svelte'
  import { breadcrumbs } from './breadcrumbs'
</script>

<Content>
  <Grid>
    <Row>
      <Column>
        <Breadcrumb>
          {#each $breadcrumbs as { name, href, overflow }, index}
            {#if overflow?.length}
              <BreadcrumbItem>
                {#if name}
                  {#if href}
                    <a class:bx--link="{true}" href="{href}">{name}</a>
                  {:else}
                    {name}
                  {/if}
                {/if}
                <OverflowMenu>
                  {#each overflow as { name, href }}
                    <OverflowMenuItem href="{href}">{name}</OverflowMenuItem>
                  {/each}
                </OverflowMenu>
              </BreadcrumbItem>
            {:else}
              <BreadcrumbItem
                href="{href}"
                isCurrentPage="{$breadcrumbs.length - 1 === index}"
                >{name}</BreadcrumbItem
              >
            {/if}
          {/each}
        </Breadcrumb>

        <div>
          <slot />
        </div>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  div {
    margin-top: var(--cds-layout-03);
  }
</style>
