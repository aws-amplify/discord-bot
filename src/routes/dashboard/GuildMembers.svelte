<script lang="ts">
  import { Column, Row } from 'carbon-components-svelte'
  import { ArrowUp, Group } from 'carbon-icons-svelte'

  export let guild: {
    totalMemberCount: number
    onlineMemberCount: number
  }
</script>

<Row>
  <Column noGutterRight>
    <div
      class="ha-dashboard--member-container"
      style:background="rgb(15, 98, 254, 0.1)"
    >
      <span class="ha-dashboard--member-title">
        {guild.totalMemberCount}
        <ArrowUp size="{32}" color="#0c4fcc" />
      </span>
      <p class="ha-dashboard--member-description">Total Members</p>
    </div>
  </Column>
  <Column noGutterLeft>
    <div
      class="ha-dashboard--member-container"
      style:background="rgb(0, 255, 0, 0.1)"
    >
      <span class="ha-dashboard--member-title">
        {guild.onlineMemberCount}
        <Group size="{32}" color="#036b03" />
      </span>
      <p class="ha-dashboard--member-description">Members Online</p>
    </div>
  </Column>
</Row>

<style>
  .ha-dashboard--member-container {
    /* display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; */
    padding: var(--cds-spacing-06);
    padding-left: var(--cds-spacing-06);
    height: 100%;
  }

  @media (min-width: 640px) {
    .ha-dashboard--member-container {
      padding-left: var(--cds-spacing-08);
    }
  }

  span.ha-dashboard--member-title {
    font-size: var(--cds-productive-heading-07-font-size);
    font-weight: var(--cds-productive-heading-07-font-weight);
    letter-spacing: var(--cds-productive-heading-07-letter-spacing);
    line-height: var(--cds-productive-heading-07-line-height);
    margin-bottom: var(--cds-layout-01);
  }

  p.ha-dashboard--member-description {
    font-size: var(--cds-productive-heading-03-font-size);
    font-weight: var(--cds-productive-heading-03-font-weight);
    line-height: var(--cds-productive-heading-03-line-height);
    letter-spacing: var(--cds-productive-heading-03-letter-spacing);
  }
</style>
