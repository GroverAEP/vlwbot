export class SessionManager {
  constructor() {
    this.session = new Map();
  }

  setSession({ from, action = "", data = {} }) {
    switch (action) {
      case "WAIT_PROCESS":
        if (!this.session.has(from)) {
          this.session.set(from, { step: "WAIT_PROCESS" });
          return true;
        }
        break;

      case "CONFIRMED":
        this.session.set(from, { step: "CONFIRM", data });
        return false;

      case "SUCCESS":
      case "CANCELLED":
        this.session.delete(from);
        return false;
    }
    return false;
  }

  getSession() {
    return this.session;
  }

  deleteSession(from) {
    this.session.delete(from);
  }
}
