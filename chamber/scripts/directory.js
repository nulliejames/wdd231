const memberList = document.querySelector("#member-list");
const directoryCount = document.querySelector("#directory-count");
const gridButton = document.querySelector("#grid-view");
const listButton = document.querySelector("#list-view");
const yearElement = document.querySelector("#current-year");
const modifiedElement = document.querySelector("#last-modified");

const membershipNames = {
  1: "Member",
  2: "Silver Member",
  3: "Gold Member"
};

function setLayout(layout) {
  const isList = layout === "list";
  memberList.classList.toggle("list-view", isList);
  gridButton.classList.toggle("is-active", !isList);
  listButton.classList.toggle("is-active", isList);
  gridButton.setAttribute("aria-pressed", String(!isList));
  listButton.setAttribute("aria-pressed", String(isList));
}

function createMemberCard(member) {
  const article = document.createElement("article");
  article.className = "member-card";

  const image = document.createElement("img");
  image.src = `images/${member.image}`;
  image.alt = `${member.name} business artwork`;
  image.width = 640;
  image.height = 360;
  image.loading = "lazy";

  const details = document.createElement("div");
  details.className = "member-details";

  const name = document.createElement("h2");
  name.textContent = member.name;

  const tagline = document.createElement("p");
  tagline.className = "member-tagline";
  tagline.textContent = member.tagline;

  const contact = document.createElement("address");
  contact.append(document.createTextNode(`${member.address} · `));
  const phone = document.createElement("a");
  phone.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
  phone.textContent = member.phone;
  contact.append(phone, document.createElement("br"));

  const website = document.createElement("a");
  website.href = member.website;
  website.target = "_blank";
  website.rel = "noopener noreferrer";
  website.textContent = "Visit website";
  contact.append(website);

  const membership = document.createElement("span");
  membership.className = "membership";
  membership.textContent = membershipNames[member.membershipLevel] ?? "Member";

  details.append(name, tagline, contact, membership);
  article.append(image, details);
  return article;
}

async function loadMembers() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) {
      throw new Error(`Member data request failed (${response.status}).`);
    }

    const members = await response.json();
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("Member data is missing or has an invalid format.");
    }

    const cards = members.map(createMemberCard);
    memberList.replaceChildren(...cards);
    memberList.setAttribute("aria-busy", "false");
    directoryCount.textContent = `${members.length} chamber members`;
  } catch (error) {
    memberList.setAttribute("aria-busy", "false");
    directoryCount.textContent = "The member directory could not be loaded.";
    const message = document.createElement("p");
    message.className = "load-error";
    message.setAttribute("role", "alert");
    message.textContent = "Please try again later. Member information is temporarily unavailable.";
    memberList.replaceChildren(message);
    console.error("Unable to load chamber members:", error);
  }
}

gridButton.addEventListener("click", () => setLayout("grid"));
listButton.addEventListener("click", () => setLayout("list"));
yearElement.textContent = String(new Date().getFullYear());

const modifiedDate = new Date(document.lastModified);
if (Number.isNaN(modifiedDate.getTime())) {
  modifiedElement.removeAttribute("datetime");
  modifiedElement.textContent = "";
} else {
  const timestamp = modifiedDate.toISOString();
  modifiedElement.dateTime = timestamp;
  modifiedElement.textContent = timestamp.slice(0, 10);
}

loadMembers();
