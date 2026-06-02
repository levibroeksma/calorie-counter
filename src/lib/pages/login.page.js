import { actions, isActionError } from 'astro:actions';
import { isLoggedIn, setSession } from '../auth/session.client.js';
import nl from '../copy/nl.js';
import { messageForActionError } from '../stores/actionMessages.js';

export default function loginPage() {
  return {
    password: '',
    error: '',
    isSubmitting: false,

    init() {
      if (isLoggedIn()) {
        window.location.replace('/');
      }
    },

    async submit() {
      this.error = '';

      if (!this.password.trim()) {
        this.error = nl.auth.passwordRequired;
        return;
      }

      this.isSubmitting = true;

      try {
        const { data, error } = await actions.login({
          password: this.password,
        });

        if (error) {
          this.error = isActionError(error)
            ? messageForActionError(error)
            : nl.auth.loginFailed;
          return;
        }

        if (!data?.writeToken) {
          this.error = nl.auth.loginFailed;
          return;
        }

        setSession({ writeToken: data.writeToken });
        this.password = '';
        window.location.replace('/');
      } catch {
        this.error = nl.auth.loginFailed;
      } finally {
        this.isSubmitting = false;
      }
    },
  };
}
