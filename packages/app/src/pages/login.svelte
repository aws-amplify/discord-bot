<script context="module">
  //
</script>

<script>
  import { Auth } from '@aws-amplify/auth'
  import {
    Button,
    Content,
    Grid,
    Row,
    Column,
    Form,
    TextInput,
    PasswordInput,
  } from 'carbon-components-svelte'
  import { user as userStore } from '$lib/store'
  import { goto } from '$app/navigation'

  let username
  let password
  let newPassword
  let confirmedNewPassword

  let confirmNewPasswordError
  let loginError
  let isSubmitting

  let view = 'login'

  function completeLogin() {
    view = 'login'
    goto('/')
  }

  async function handleLoginSubmit(event) {
    isSubmitting = true
    if (loginError) loginError = null
    event.preventDefault()

    let user
    try {
      user = await Auth.signIn(username, password)
    } catch (error) {
      console.log('error signing in', error)
      loginError = error
    }

    if (user?.challengeName === 'NEW_PASSWORD_REQUIRED') {
      view = 'new_password_required'
    } else {
      completeLogin()
    }

    userStore.set(user)
    isSubmitting = false
  }

  async function handleConfirmNewPasswordSubmit(event) {
    isSubmitting = true
    if (confirmNewPasswordError) confirmNewPasswordError = null
    event.preventDefault()

    if (newPassword !== confirmedNewPassword) {
      confirmNewPasswordError = 'Passwords do not match'
      isSubmitting = false
      return
    }

    let user
    try {
      user = await Auth.completeNewPassword($userStore, newPassword)
    } catch (error) {
      console.error('Error confirming new password', error)
      confirmNewPasswordError = error.message
      isSubmitting = false
      return
    }

    if (user) {
      userStore.set(user)
      completeLogin()
    }

    isSubmitting = false
  }
</script>

<Content class="adb--content">
  <Grid>
    <Row>
      <Column>
        {#if view === 'login'}
          <h1>Login</h1>
          <Form on:submit="{handleLoginSubmit}">
            <TextInput
              bind:value="{username}"
              hideLabel
              labelText="User name"
              placeholder="Username"
              disabled="{isSubmitting}"
              invalid="{loginError}"
            />
            <PasswordInput
              bind:value="{password}"
              hideLabel
              labelText="Password"
              placeholder="Password"
              disabled="{isSubmitting}"
              invalid="{loginError}"
              invalidText="{loginError}"
            />
            <Button class="adb--submit" type="submit">Submit</Button>
          </Form>
        {/if}

        {#if view === 'new_password_required'}
          <h1>Create New Password</h1>
          <Form on:submit="{handleConfirmNewPasswordSubmit}">
            <PasswordInput
              bind:value="{newPassword}"
              hideLabel
              labelText="New Password"
              placeholder="New Password"
              disabled="{isSubmitting}"
            />
            <PasswordInput
              bind:value="{confirmedNewPassword}"
              hideLabel
              labelText="Confirm New Password"
              placeholder="Confirm New Password"
              disabled="{isSubmitting}"
              invalid="{confirmNewPasswordError}"
              invalidText="{confirmNewPasswordError}"
            />
            <Button class="adb--submit" type="submit">Submit</Button>
          </Form>
        {/if}
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  :global(.bx--header ~ .bx--content) {
    height: calc(100vh - 3rem);
  }

  :global(.bx--form) {
    display: grid;
    max-width: 500px;
    grid-row-gap: var(--cds-spacing-02);
  }

  :global(.adb--submit) {
    justify-self: end;
  }
</style>
