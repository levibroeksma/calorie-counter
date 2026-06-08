const SESSION_LOGGED_IN_KEY = "isLoggedIn" as const;
const SESSION_WRITE_TOKEN_KEY = "writeToken" as const;

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_LOGGED_IN_KEY) === "true";
}

export function getWriteToken(): string | null {
  return sessionStorage.getItem(SESSION_WRITE_TOKEN_KEY);
}

export function setSession({ writeToken }: { writeToken: string }): void {
  sessionStorage.setItem(SESSION_LOGGED_IN_KEY, "true");
  sessionStorage.setItem(SESSION_WRITE_TOKEN_KEY, writeToken);
}
