
class AuthInterface {
  async register(email, password, captchaToken) {
    throw new Error('Not implemented');
  }

  async login(email, password, captchaToken) {
    throw new Error('Not implemented');
  }

  async loginWithProvider(provider) {
    throw new Error('Not implemented');
  }

  async logout() {
    throw new Error('Not implemented');
  }

  async resetPassword(email) {
    throw new Error('Not implemented');
  }

  async updatePassword(password) {
    throw new Error('Not implemented');
  }

  async updateProfile(metadata) {
    throw new Error('Not implemented');
  }

  onAuthStateChanged(callback) {
    throw new Error('Not implemented');
  }

  getCurrentUser() {
    throw new Error('Not implemented');
  }
}

export default AuthInterface;
