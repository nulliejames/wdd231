const fallbackMembers = [
  {
    name: 'Atlantic View Hotel',
    tagline: 'Boutique hospitality and waterfront dining for visitors and business travelers.',
    address: '12 Lumley Beach Road, Freetown',
    phone: '+232 76 445 778',
    email: 'reservations@atlanticviewhotel.sl',
    website: 'https://www.atlanticviewhotel.sl',
    membership: 'Gold',
    image: 'images/atlanticviewhotel.jpg'
  },
  {
    name: 'Cotton Tree Cafe',
    tagline: 'A beloved gathering place serving local flavors and community events.',
    address: '9 Siaka Stevens Street, Freetown',
    phone: '+232 33 221 440',
    email: 'hello@cottontreecafe.sl',
    website: 'https://www.cottontreecafe.sl',
    membership: 'Silver',
    image: 'images/cottontreecafe.jpg'
  },
  {
    name: 'Green Hill Farm',
    tagline: 'Sustainable agriculture and fresh produce for households and restaurants.',
    address: '45 Regent Road, Waterloo',
    phone: '+232 30 555 901',
    email: 'sales@greenhillfarm.sl',
    website: 'https://www.greenhillfarm.sl',
    membership: 'Bronze',
    image: 'images/greenhillfarm.jpg'
  },
  {
    name: 'Krio Craft Collective',
    tagline: 'Handcrafted goods, cultural design, and artisan entrepreneurship.',
    address: '14 Kissy Road, Freetown',
    phone: '+232 78 300 111',
    email: 'studio@kriocraftcollective.sl',
    website: 'https://www.kriocraftcollective.sl',
    membership: 'Silver',
    image: 'images/kriocraftcollective.jpg'
  },
  {
    name: 'Peninsula Medical Center',
    tagline: 'Modern healthcare services focused on patient-centered care.',
    address: '7 Mende Close, Freetown',
    phone: '+232 76 600 204',
    email: 'care@peninsulamedical.sl',
    website: 'https://www.peninsulamedical.sl',
    membership: 'Gold',
    image: 'images/peninsularmedicalcenter.jpg'
  },
  {
    name: 'Salone Digital Works',
    tagline: 'Creative digital marketing, design, and technology support for growing brands.',
    address: '22 Campbell Street, Freetown',
    phone: '+232 79 210 444',
    email: 'hello@salonedigitalworks.sl',
    website: 'https://www.salonedigitalworks.sl',
    membership: 'Gold',
    image: 'images/salonedigitalwork.jpg'
  },
  {
    name: 'Sierra Logistics',
    tagline: 'Efficient freight, warehousing, and supply chain support across the region.',
    address: '88 Kingtom Industrial Area, Freetown',
    phone: '+232 30 900 340',
    email: 'ops@sierralogistics.sl',
    website: 'https://www.sierralogistics.sl',
    membership: 'Platinum',
    image: 'images/sierralogistics.jpg'
  },
  {
    name: 'WERA',
    tagline: 'Empowering women-led businesses through enterprise training and mentorship.',
    address: '3 Wilkinson Road, Freetown',
    phone: '+232 77 540 660',
    email: 'info@wera.sl',
    website: 'https://www.wera.sl',
    membership: 'Silver',
    image: 'images/wera.jpg'
  }
];

const memberList = document.querySelector('#member-list');
const countElement = document.querySelector('#directory-count');
const gridButton = document.querySelector('#grid-view');
const listButton = document.querySelector('#list-view');

async function getMembers() {
  try {
    const response = await fetch('members.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.status}`);
    }

    const members = await response.json();
    return Array.isArray(members) && members.length ? members : fallbackMembers;
  } catch (error) {
    console.warn('Using fallback chamber member data.', error);
    return fallbackMembers;
  }
}

function setFooterInfo() {
  const yearElement = document.querySelector('#current-year');
  const modifiedElement = document.querySelector('#last-modified');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (modifiedElement) {
    modifiedElement.textContent = new Date(document.lastModified).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

function createMemberCard(member) {
  const card = document.createElement('article');
  card.className = 'member-card';

  card.innerHTML = `
    <img src="${member.image}" alt="${member.name} storefront" loading="lazy">
    <div class="member-details">
      <h2>${member.name}</h2>
      <p class="member-tagline">${member.tagline}</p>
      <address>
        <span>${member.address}</span><br>
        <a href="tel:${member.phone.replace(/\s+/g, '')}">${member.phone}</a><br>
        <a href="mailto:${member.email}">${member.email}</a><br>
        <a href="${member.website}" target="_blank" rel="noopener noreferrer">${member.website.replace(/^https?:\/\//, '')}</a>
      </address>
      <span class="membership">${member.membership} member</span>
    </div>
  `;

  return card;
}

function renderDirectory(members) {
  if (!memberList) return;

  memberList.innerHTML = '';
  members.forEach((member) => memberList.appendChild(createMemberCard(member)));

  if (countElement) {
    const label = members.length === 1 ? 'member' : 'members';
    countElement.textContent = `${members.length} ${label} listed in the chamber directory`;
  }

  memberList.setAttribute('aria-busy', 'false');
}

function setView(view) {
  if (!memberList || !gridButton || !listButton) return;

  const isListView = view === 'list';
  memberList.classList.toggle('list-view', isListView);
  gridButton.classList.toggle('is-active', !isListView);
  listButton.classList.toggle('is-active', isListView);
  gridButton.setAttribute('aria-pressed', String(!isListView));
  listButton.setAttribute('aria-pressed', String(isListView));
}

document.addEventListener('DOMContentLoaded', async () => {
  setFooterInfo();

  const members = await getMembers();
  renderDirectory(members);
  setView('grid');

  gridButton?.addEventListener('click', () => setView('grid'));
  listButton?.addEventListener('click', () => setView('list'));
});
