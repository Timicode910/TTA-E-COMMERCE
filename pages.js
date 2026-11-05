const byId = id => document.getElementById(id);

// ---------- json-server API ----------
// Start it with:  npm run api   (serves db.json at http://localhost:3000)
const API = 'http://localhost:3000';
const SESSION_KEY = 'branchUserId'; // only the user's id lives in the browser; all details live in db.json

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.status === 204 ? null : res.json();
}

const findUserByEmail = async email => {
  const users = await api('/users?email=' + encodeURIComponent(email));
  return users[0] || null;
};
const getUserById = id => api('/users/' + encodeURIComponent(id));

const getSessionId = () => localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
const setSession = (id, remember) => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, id);
};
const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

const initials = account => ((account?.first || 'Guest').charAt(0) + (account?.last || 'User').charAt(0)).toUpperCase();
const nameFromEmail = email => email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\w/g, c => c.toUpperCase());
const SERVER_DOWN = 'Could not reach the server. Run "npm run api" and try again.';

// Demo only: passwords are saved as plain text in db.json. Never do this in a real app.

// ---------- login page ----------
if (byId('login-form')) {
  const message = byId('login-message');
  const say = (text, isError = false) => {
    message.textContent = text;
    message.classList.toggle('error', isError);
  };
  const readFields = () => ({
    email: byId('email').value.trim().toLowerCase(),
    password: byId('password').value
  });
  const valid = ({ email, password }) => {
    if (!email || password.length < 4) {
      say('Enter a valid email and a password of at least 4 characters.', true);
      return false;
    }
    return true;
  };

  byId('toggle-password').addEventListener('click', () => {
    const input = byId('password');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    byId('toggle-password').textContent = show ? 'Hide' : 'Show';
  });

  byId('login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const fields = readFields();
    if (!valid(fields)) return;
    try {
      const user = await findUserByEmail(fields.email);
      if (!user) {
        say('No account found for that email. Select "Create an account" to make one.', true);
        return;
      }
      if (user.password !== fields.password) {
        say('That password is not correct.', true);
        return;
      }
      setSession(user.id, byId('remember').checked);
      say('Signed in. Opening your profile…');
      setTimeout(() => (window.location.href = 'profile.html'), 550);
    } catch {
      say(SERVER_DOWN, true);
    }
  });

  byId('create-account').addEventListener('click', async () => {
    const fields = readFields();
    if (!valid(fields)) { byId('email').focus(); return; }
    try {
      if (await findUserByEmail(fields.email)) {
        say('An account with that email already exists. Try signing in.', true);
        return;
      }
      const parts = nameFromEmail(fields.email).split(' ');
      const user = await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          first: parts[0] || 'Branch',
          last: parts.slice(1).join(' ') || 'Customer',
          email: fields.email,
          password: fields.password,
          phone: '',
          createdAt: new Date().toISOString()
        })
      });
      setSession(user.id, byId('remember').checked);
      say('Account created. Opening your profile…');
      setTimeout(() => (window.location.href = 'profile.html'), 550);
    } catch {
      say(SERVER_DOWN, true);
    }
  });

  byId('forgot-link').addEventListener('click', event => {
    event.preventDefault();
    say('Password reset is not connected in this demo.');
  });
}

// ---------- profile page ----------
if (byId('profile-form')) {
  const message = byId('profile-message');
  const say = (text, isError = false) => {
    message.textContent = text;
    message.classList.toggle('error', isError);
  };
  let currentUser = null;

  const paint = account => {
    byId('sidebar-name').textContent = `${account.first || ''} ${account.last || ''}`.trim() || 'Branch customer';
    byId('sidebar-email').textContent = account.email || '';
    byId('avatar-initials').textContent = initials(account);
    byId('account-status').textContent = 'Active';
  };

  (async () => {
    const id = getSessionId();
    if (!id) return; // guest view
    try {
      currentUser = await getUserById(id);
      paint(currentUser);
      byId('profile-first').value = currentUser.first || '';
      byId('profile-last').value = currentUser.last || '';
      byId('profile-email').value = currentUser.email || '';
      byId('profile-phone').value = currentUser.phone || '';
    } catch {
      // account was deleted from db.json, or the server is off
      say(SERVER_DOWN, true);
    }
  })();

  byId('profile-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentUser) { say('Sign in first to save your details.', true); return; }
    const changes = {
      first: byId('profile-first').value.trim(),
      last: byId('profile-last').value.trim(),
      email: byId('profile-email').value.trim().toLowerCase(),
      phone: byId('profile-phone').value.trim()
    };
    try {
      const other = await findUserByEmail(changes.email);
      if (other && String(other.id) !== String(currentUser.id)) {
        say('That email is already used by another account.', true);
        return;
      }
      currentUser = await api('/users/' + encodeURIComponent(currentUser.id), {
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
      paint(currentUser);
      say('Your profile changes have been saved.');
    } catch {
      say(SERVER_DOWN, true);
    }
  });

  byId('logout-button').addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}
