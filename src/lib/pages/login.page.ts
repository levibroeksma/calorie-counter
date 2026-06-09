import { actions, isActionError } from "astro:actions";
import type Alpine from "alpinejs";

import nl from "@lib/copy/nl";

import { isLoggedIn, setSession } from "@lib/auth/session.client";
import { messageForActionError } from "@stores/actionMessages";

/** Login page data */
interface LoginPageData {
  password: string;
  error: string;
  isSubmitting: boolean;
  init(): void;
  submit(): Promise<void>;
}

/** Creates a login page component */
export default function loginPage(): Alpine.AlpineComponent<LoginPageData> {
  return {
    password: "",
    error: "",
    isSubmitting: false,

    /** Initializes the login page */
    init() {
      if (isLoggedIn()) {
        window.location.replace("/");
      }
    },

    /** Submits the login form */
    async submit() {
      this.error = "";

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
        this.password = "";
        window.location.replace("/");
      } catch {
        this.error = nl.auth.loginFailed;
      } finally {
        this.isSubmitting = false;
      }
    },
  };
}
