// ---------- Pop-ups (register / login) ----------
const modals = document.querySelectorAll(".modal");

const openModal = (id) => {
  modals.forEach((m) => m.classList.toggle("hidden", m.id !== id));
  document.querySelector(`#${id} input`)?.focus();
};
const closeModals = () => modals.forEach((m) => m.classList.add("hidden"));

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) {
    e.preventDefault(); // stay on this page instead of going to Register.html
    openModal(opener.dataset.open);
  }
  // the X button, or a click on the dark backdrop
  if (
    e.target.closest("[data-close]") ||
    e.target.classList.contains("modal")
  ) {
    closeModals();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModals();
});

// ---------- Users and session (practice only: never store real passwords like this) ----------
const getUsers = () => JSON.parse(localStorage.getItem("users")) ?? [];
const getSession = () => localStorage.getItem("session"); // email of who is logged in
const currentUser = () => getUsers().find((u) => u.email === getSession());

// Show Register / Log in, or "Hi, Name" / Log out, in the nav
const navRegister = document.querySelector("#navRegister");
const navLogin = document.querySelector("#navLogin");
const navUser = document.querySelector("#navUser");
const navLogout = document.querySelector("#navLogout");
const postForm = document.querySelector("#postForm");

const updateNav = () => {
  const user = currentUser();
  navRegister.hidden = navLogin.hidden = !!user;
  navUser.hidden = navLogout.hidden = !user;
  if (user) {
    navUser.textContent = `Hi, ${user.name}`;
    postForm.elements.email.value = user.email; // prefill "Your email"
  }
};

navLogout.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("session");
  postForm.elements.email.value = "";
  updateNav();
});

// ---------- Register ----------
const regForm = document.querySelector("#regForm");
const regMsg = document.querySelector("#regMsg");

regForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = regForm.elements;
  try {
    if (f.password.value.length < 8) throw new Error("Password too short");
    if (f.password.value !== f.confirm.value)
      throw new Error("Passwords do not match");

    const email = f.email.value.trim().toLowerCase();
    if (getUsers().some((u) => u.email === email))
      throw new Error("Email already used");

    const users = [
      ...getUsers(),
      { name: f.name.value.trim(), email, password: f.password.value },
    ];
    localStorage.setItem("users", JSON.stringify(users));
    regMsg.textContent = "";
    regForm.reset();
    openModal("login");
    logMsg.textContent = "Account created. Please log in.";
  } catch (error) {
    regMsg.textContent = error.message;
  }
});

// ---------- Login ----------
const logForm = document.querySelector("#logForm");
const logMsg = document.querySelector("#logMsg");

logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = logForm.elements;
  const mail = f.email.value.trim().toLowerCase();
  const user = getUsers().find((u) => u.email === mail);
  if (user?.password === f.password.value) {
    localStorage.setItem("session", user.email);
    logMsg.textContent = "";
    logForm.reset();
    closeModals();
    updateNav();
  } else {
    logMsg.textContent = "Wrong email or password";
  }
});

// ---------- Post a notice (needs a login) ----------
postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = currentUser();
  if (!user) {
    openModal("login");
    logMsg.textContent = "Please log in to post a notice.";
    return;
  }
  const f = postForm.elements;

  // Build the notice the same way as the others: <div><article class="notice">
  const article = document.createElement("article");
  article.className = "notice";

  const title = document.createElement("h2");
  title.textContent = f.title.value.trim();

  const meta = document.createElement("span");
  meta.className = "tag";
  meta.textContent = f.category.value;

  const body = document.createElement("p");
  body.textContent = f.message.value.trim();

  const by = document.createElement("small");
  by.className = "meta";
  by.textContent =
    `Posted by ${user.name}` + (f.date.value ? ` · ${f.date.value}` : "");

  article.append(title, meta, body, by);
  const wrapper = document.createElement("div");
  wrapper.append(article);

  document.querySelector("#deadlines").before(wrapper);
  postForm.reset();
  postForm.elements.email.value = user.email;
  wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ---------- Light / dark theme ----------
const root = document.documentElement;
const toggle = document.querySelector("#themeToggle");

const setTheme = (name) => {
  const dark = name === "dark";
  root.dataset.theme = name;
  toggle.textContent = dark ? "Light" : "Dark";
  localStorage.setItem("theme", name);
};

const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(localStorage.getItem("theme") ?? (systemDark ? "dark" : "light"));

toggle.onclick = () =>
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");

// ---------- Start ----------
updateNav();
