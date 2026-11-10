const courses = [
  { name: 'CSE 110', credits: 2, type: 'cse', completed: true },
  { name: 'CSE 111', credits: 2, type: 'cse', completed: true },
  { name: 'CSE 210', credits: 2, type: 'cse', completed: true },
  { name: 'WDD 130', credits: 2, type: 'wdd', completed: true },
  { name: 'WDD 131', credits: 2, type: 'wdd', completed: true },
  { name: 'WDD 231', credits: 2, type: 'wdd', completed: false }
];

const courseList = document.getElementById('course-list');
const totalCredits = document.getElementById('credit-total');
const filterButtons = document.querySelectorAll('.filter-btn');

function renderCourses(filter = 'all') {
  if (!courseList || !totalCredits) return;

  const visibleCourses = courses.filter((course) => {
    if (filter === 'all') return true;
    return course.type === filter;
  });

  courseList.innerHTML = '';

  if (visibleCourses.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'course-empty';
    emptyMessage.textContent = 'No courses are currently listed for this subject.';
    courseList.appendChild(emptyMessage);
  }

  visibleCourses.forEach((course) => {
    const card = document.createElement('li');
    card.className = `course-item${course.completed ? ' completed' : ''}`;
    const label = document.createElement('span');
    label.className = 'course-label';
    label.textContent = course.name;
    if (course.completed) {
      label.textContent += ' (Completed)';
    }
    card.appendChild(label);
    courseList.appendChild(card);
  });

  const total = visibleCourses.reduce((sum, course) => sum + course.credits, 0);
  totalCredits.textContent = total;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    renderCourses(button.dataset.filter);
  });
});

renderCourses();
