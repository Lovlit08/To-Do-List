document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const dateSelector = document.getElementById('dateSelector');
    const currentDateDisplay = document.getElementById('currentDateDisplay');

    let selectedDate;

    // --- Helper Functions ---

    // Function to format the date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Function to get the display name for the date
    function getDisplayDate(dateString) {
        const today = formatDate(new Date());
        const date = new Date(dateString.replace(/-/g, '/')); // Use replace for consistent date parsing

        if (dateString === today) {
            return "Today";
        }
        
        // Use a more readable format for other dates
        return date.toLocaleDateString('en-US', {
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // --- Core Data Management ---

    // Get tasks for the selected date from localStorage
    function getTasks() {
        // Ensure selectedDate is valid before fetching
        if (!selectedDate) return []; 
        const tasks = localStorage.getItem(selectedDate);
        return tasks ? JSON.parse(tasks) : [];
    }

    // Save the current tasks list to localStorage
    function saveTasks(tasks) {
        if (!selectedDate) return; 
        localStorage.setItem(selectedDate, JSON.stringify(tasks));
    }

    // --- Task Rendering and Interaction ---

    // Renders the list based on the tasks stored for the selectedDate
    function renderTasks() {
        // *** FIX: Clear the list before rendering new tasks ***
        taskList.innerHTML = '';
        currentDateDisplay.textContent = getDisplayDate(selectedDate);
        const tasks = getTasks();

        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'task-item';
            emptyMessage.style.borderLeft = 'none';
            emptyMessage.innerHTML = `<span class="task-text" style="color:#888;">No tasks for ${getDisplayDate(selectedDate)}.</span>`;
            taskList.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('task-item');
            if (task.completed) {
                listItem.classList.add('completed');
            }
            listItem.dataset.index = index; // Store index for easier manipulation

            listItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(listItem);
        });
    }

    // Handles adding a new task
    function addTask() {
        const text = taskInput.value.trim();

        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const tasks = getTasks();
        tasks.push({ text: text, completed: false });
        saveTasks(tasks);
        
        taskInput.value = '';
        renderTasks(); // Re-render the list to show the new task
    }

    // Handles clicks on the task list (toggle completion and delete)
    function handleTaskClick(e) {
        const listItem = e.target.closest('.task-item');
        if (!listItem || listItem.style.borderLeft === 'none') return; // Ignore empty message

        const index = listItem.dataset.index;
        const tasks = getTasks();

        if (e.target.classList.contains('task-text')) {
            // Toggle completion
            tasks[index].completed = !tasks[index].completed;
        } else if (e.target.closest('.delete-btn')) {
            // Delete task
            tasks.splice(index, 1);
        } else {
            return; // Clicked on the list item background, do nothing
        }

        saveTasks(tasks);
        renderTasks(); // Re-render the list
    }

    // --- Event Listeners and Initialization ---

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    taskList.addEventListener('click', handleTaskClick);

    // Date selector change event
    dateSelector.addEventListener('change', () => {
        selectedDate = dateSelector.value;
        // *** FIX: This is the crucial line that triggers the update ***
        renderTasks();
    });

    // Initialization: Set the default date to today and render the list
    function initialize() {
        // Set date selector value to today
        const today = formatDate(new Date());
        dateSelector.value = today;
        
        // Set the currently selected date variable
        selectedDate = today; 
        
        // Render the initial tasks (for today)
        renderTasks();
    }

    initialize();
});