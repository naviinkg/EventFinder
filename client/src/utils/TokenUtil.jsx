class TokenUtil {
  constructor() {
    this.token = this.getStoredToken();
  }

  // Store the token in both the instance and localStorage
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Retrieve the token from the instance if available, otherwise from localStorage
  getToken() {
    return this.token;
  }

  // Clear the token from both the instance and localStorage
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Retrieve the token from localStorage on initialization
  getStoredToken() {
    return localStorage.getItem('authToken');
  }
}

export default new TokenUtil();
