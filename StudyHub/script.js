const storageKeys = {
  tasks: 'studyhub.tasks',
  goals: 'studyhub.goals',
  pomodoroSessions: 'studyhub.pomodoroSessions'
};

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');
const weeklyProgress = document.getElementById('weekly-progress');
const progressText = document.getElementById('progress-text');
const todayLabel = document.getElementById('today-label');
const monthLabel = document.getElementById('month-label');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const flashcardQuestion = document.getElementById('flashcard-question');
const flashcardAnswer = document.getElementById('flashcard-answer');
const showAnswerBtn = document.getElementById('show-answer');
const nextCardBtn = document.getElementById('next-card');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pause-timer');
const resetBtn = document.getElementById('reset-timer');
const pomodoroStatus = document.getElementById('pomodoro-status');
const statsTasks = document.getElementById('stats-tasks');
const statsGoals = document.getElementById('stats-goals');
const statsSessions = document.getElementById('stats-sessions');

let tasks = JSON.parse(localStorage.getItem(storageKeys.tasks) || '[]');
let goals = JSON.parse(localStorage.getItem(storageKeys.goals) || '[]');
let pomodoroSessions = Number(localStorage.getItem(storageKeys.pomodoroSessions) || 0);
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let flashcardIndex = 0;
let timeLeft = 25 * 60;
let timerInterval = null;
let isRunning = false;

const flashcards = [
  { question: 'O que é uma revisão espaçada?', answer: 'É uma técnica que revisa conteúdos em intervalos crescentes para reforçar a memória.' },
  { question: 'Qual a vantagem do Pomodoro?', answer: 'Ajuda a manter foco e reduzir a fadiga mental com blocos curtos de estudo.' },
  { question: 'Como definir uma meta eficiente?', answer: 'Use metas específicas, mensuráveis e com prazo definido.' }
];

function saveState() {
  localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
  localStorage.setItem(storageKeys.goals, JSON.stringify(goals));
  localStorage.setItem(storageKeys.pomodoroSessions, String(pomodoroSessions));
}

function renderTasks() {
  taskList.innerHTML = '';
  if (!tasks.length) {
    taskList.innerHTML = '<li class="task-item"><span>Nenhuma tarefa ainda.</span></li>';
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;
    li.innerHTML = `
      <span>${task.text}</span>
      <div class="task-actions">
        <button data-action="toggle" data-index="${index}">${task.done ? '↺' : '✓'}</button>
        <button data-action="remove" data-index="${index}">✕</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function renderGoals() {
  goalList.innerHTML = '';
  if (!goals.length) {
    goalList.innerHTML = '<li class="goal-item"><span>Adicione sua primeira meta.</span></li>';
    return;
  }

  goals.forEach((goal, index) => {
    const li = document.createElement('li');
    li.className = `goal-item ${goal.done ? 'done' : ''}`;
    li.innerHTML = `
      <span>${goal.text}</span>
      <div class="goal-actions">
        <button data-action="goal-toggle" data-index="${index}">${goal.done ? '↺' : '✓'}</button>
        <button data-action="goal-remove" data-index="${index}">✕</button>
      </div>
    `;
    goalList.appendChild(li);
  });
}

function updateProgress() {
  const total = tasks.length + goals.length;
  const done = tasks.filter((task) => task.done).length + goals.filter((goal) => goal.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  weeklyProgress.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

function updateStats() {
  statsTasks.textContent = tasks.filter((task) => task.done).length;
  statsGoals.textContent = goals.filter((goal) => goal.done).length;
  statsSessions.textContent = pomodoroSessions;
}

function renderCalendar() {
  monthLabel.textContent = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  calendarGrid.innerHTML = '';

  for (let i = 0; i < firstDay; i += 1) {
    const filler = document.createElement('div');
    filler.className = 'day';
    calendarGrid.appendChild(filler);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const cell = document.createElement('div');
    cell.className = 'day';
    if (day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
      cell.classList.add('active');
    }
    cell.textContent = day;
    calendarGrid.appendChild(cell);
  }
}

function renderFlashcard() {
  flashcardQuestion.textContent = flashcards[flashcardIndex].question;
  flashcardAnswer.textContent = flashcards[flashcardIndex].answer;
  flashcardAnswer.classList.add('hidden');
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  pomodoroStatus.textContent = 'Foco ativo! Mantenha a concentração.';
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      pomodoroSessions += 1;
      saveState();
      updateStats();
      pomodoroStatus.textContent = 'Sessão concluída! Bom trabalho.';
      timeLeft = 25 * 60;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  pomodoroStatus.textContent = 'Timer pausado. Continue quando quiser.';
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  pomodoroStatus.textContent = 'Sessão pronta para começar.';
}

function init() {
  todayLabel.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  renderTasks();
  renderGoals();
  updateProgress();
  updateStats();
  renderCalendar();
  renderFlashcard();
  updateTimerDisplay();

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.unshift({ text, done: false });
    saveState();
    renderTasks();
    updateProgress();
    updateStats();
    taskForm.reset();
  });

  taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const { action, index } = button.dataset;
    if (action === 'toggle') {
      tasks[index].done = !tasks[index].done;
    } else if (action === 'remove') {
      tasks.splice(index, 1);
    }
    saveState();
    renderTasks();
    updateProgress();
    updateStats();
  });

  goalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = goalInput.value.trim();
    if (!text) return;
    goals.unshift({ text, done: false });
    saveState();
    renderGoals();
    updateProgress();
    updateStats();
    goalForm.reset();
  });

  goalList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const { action, index } = button.dataset;
    if (action === 'goal-toggle') {
      goals[index].done = !goals[index].done;
    } else if (action === 'goal-remove') {
      goals.splice(index, 1);
    }
    saveState();
    renderGoals();
    updateProgress();
    updateStats();
  });

  prevMonthBtn.addEventListener('click', () => {
    currentMonth -= 1;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentMonth += 1;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
    renderCalendar();
  });

  showAnswerBtn.addEventListener('click', () => {
    flashcardAnswer.classList.toggle('hidden');
  });

  nextCardBtn.addEventListener('click', () => {
    flashcardIndex = (flashcardIndex + 1) % flashcards.length;
    renderFlashcard();
  });

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
}

init();
