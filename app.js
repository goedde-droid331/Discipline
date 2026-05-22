(function () {
  "use strict";

  const STORAGE_KEY = "student-discipline-v1";

  const teacherOptions = [
    "Mrs. Alvarez",
    "Mr. Brown",
    "Ms. Carter",
    "Mr. Duran",
    "Mrs. Fleming",
    "Office 101",
    "Room 204",
    "Room 318"
  ];

  const statusOptions = [
    { id: "assigned", name: "Assigned" },
    { id: "served", name: "Served" },
    { id: "no-show", name: "No Show" },
    { id: "excused", name: "Excused" },
    { id: "canceled", name: "Canceled" }
  ];

  function createSeedState() {
    const now = new Date();
    const today = toDateInputValue(now);
    const yesterday = toDateInputValue(addDays(now, -1));
    const tomorrow = toDateInputValue(addDays(now, 1));

    return {
      settings: {
        schoolName: "Mater Dei High School",
        dayLabel: "Discipline Records",
        currentTeacher: "Mrs. Alvarez"
      },
      students: [
        { id: "stu-101", name: "Ava Martinez", grade: "9", advisory: "Alvarez" },
        { id: "stu-102", name: "Ben Nguyen", grade: "10", advisory: "Brown" },
        { id: "stu-103", name: "Camila Reyes", grade: "11", advisory: "Carter" },
        { id: "stu-104", name: "Diego Santos", grade: "12", advisory: "Duran" },
        { id: "stu-105", name: "Emma Collins", grade: "9", advisory: "Fleming" },
        { id: "stu-106", name: "Isaac Taylor", grade: "10", advisory: "Alvarez" },
        { id: "stu-107", name: "Mia Johnson", grade: "11", advisory: "Brown" },
        { id: "stu-108", name: "Noah Wilson", grade: "12", advisory: "Carter" },
        { id: "stu-109", name: "Sofia Garcia", grade: "10", advisory: "Duran" },
        { id: "stu-110", name: "Tyler Brooks", grade: "9", advisory: "Fleming" }
      ],
      categories: [
        { id: "dress-code", name: "Dress Code", teacherDailyVisible: true },
        { id: "excessive-talking", name: "Excessive Talking", teacherDailyVisible: false },
        { id: "disrespect", name: "Disrespect", teacherDailyVisible: false },
        { id: "fighting", name: "Fighting", teacherDailyVisible: false },
        { id: "harassment", name: "Harassment", teacherDailyVisible: false },
        { id: "bullying", name: "Bullying", teacherDailyVisible: false },
        { id: "other", name: "Other", teacherDailyVisible: false }
      ],
      entries: [
        {
          id: "entry-201",
          studentId: "stu-101",
          categoryId: "dress-code",
          assignedBy: "Mrs. Fleming",
          assignedAt: addMinutes(now, -78).toISOString(),
          detentionDate: today,
          status: "assigned",
          statusUpdatedAt: addMinutes(now, -78).toISOString(),
          statusUpdatedBy: "Mrs. Fleming",
          notes: "Shirt policy reminder."
        },
        {
          id: "entry-202",
          studentId: "stu-104",
          categoryId: "dress-code",
          assignedBy: "Mr. Brown",
          assignedAt: addMinutes(now, -44).toISOString(),
          detentionDate: today,
          status: "served",
          statusUpdatedAt: addMinutes(now, -18).toISOString(),
          statusUpdatedBy: "Office 101",
          notes: "Repeat dress code issue."
        },
        {
          id: "entry-203",
          studentId: "stu-106",
          categoryId: "excessive-talking",
          assignedBy: "Mrs. Alvarez",
          assignedAt: addMinutes(now, -35).toISOString(),
          detentionDate: today,
          status: "assigned",
          statusUpdatedAt: addMinutes(now, -35).toISOString(),
          statusUpdatedBy: "Mrs. Alvarez",
          notes: "Continued talking after redirection."
        },
        {
          id: "entry-204",
          studentId: "stu-102",
          categoryId: "disrespect",
          assignedBy: "Mrs. Alvarez",
          assignedAt: addDays(now, -1).toISOString(),
          detentionDate: today,
          status: "no-show",
          statusUpdatedAt: addMinutes(now, -8).toISOString(),
          statusUpdatedBy: "Office 101",
          notes: "No show to assigned detention."
        },
        {
          id: "entry-205",
          studentId: "stu-109",
          categoryId: "fighting",
          assignedBy: "Office 101",
          assignedAt: addDays(now, -1).toISOString(),
          detentionDate: yesterday,
          status: "served",
          statusUpdatedAt: addDays(now, -1).toISOString(),
          statusUpdatedBy: "Office 101",
          notes: "Handled by admin."
        },
        {
          id: "entry-206",
          studentId: "stu-108",
          categoryId: "bullying",
          assignedBy: "Ms. Carter",
          assignedAt: addMinutes(now, -26).toISOString(),
          detentionDate: tomorrow,
          status: "assigned",
          statusUpdatedAt: addMinutes(now, -26).toISOString(),
          statusUpdatedBy: "Ms. Carter",
          notes: "Admin follow-up requested."
        }
      ]
    };
  }

  let state = loadState();
  let currentView = "teacher";
  let toastTimer = 0;

  const elements = {
    todayLine: document.getElementById("today-line"),
    teacherContext: document.getElementById("teacher-context"),
    toastStack: document.getElementById("toast-stack"),
    statToday: document.getElementById("stat-today"),
    statMyOpen: document.getElementById("stat-my-open"),
    statDressCode: document.getElementById("stat-dress-code"),
    statNoShow: document.getElementById("stat-no-show"),
    teacherVisibleCount: document.getElementById("teacher-visible-count"),
    teacherStudentSearch: document.getElementById("teacher-student-search"),
    teacherCategory: document.getElementById("teacher-category"),
    teacherDetentionDate: document.getElementById("teacher-detention-date"),
    teacherNotes: document.getElementById("teacher-notes"),
    teacherEntryStudentSearch: document.getElementById("teacher-entry-student-search"),
    teacherStatusFilter: document.getElementById("teacher-status-filter"),
    dressCodeCount: document.getElementById("dress-code-count"),
    teacherDressCodeList: document.getElementById("teacher-dress-code-list"),
    teacherEntryTable: document.getElementById("teacher-entry-table"),
    adminTotalCount: document.getElementById("admin-total-count"),
    adminStudentSearch: document.getElementById("admin-student-search"),
    adminCategory: document.getElementById("admin-category"),
    adminAssignedBy: document.getElementById("admin-assigned-by"),
    adminDetentionDate: document.getElementById("admin-detention-date"),
    adminNewStatus: document.getElementById("admin-new-status"),
    adminNotes: document.getElementById("admin-notes"),
    categoryCount: document.getElementById("category-count"),
    categoryList: document.getElementById("category-list"),
    categoryName: document.getElementById("category-name"),
    categoryTeacherVisible: document.getElementById("category-teacher-visible"),
    adminDateFilter: document.getElementById("admin-date-filter"),
    adminStudentFilter: document.getElementById("admin-student-filter"),
    adminCategoryFilter: document.getElementById("admin-category-filter"),
    adminStatusFilter: document.getElementById("admin-status-filter"),
    adminTeacherFilter: document.getElementById("admin-teacher-filter"),
    adminEntryTable: document.getElementById("admin-entry-table"),
    studentHistorySearch: document.getElementById("student-history-search"),
    studentHistoryList: document.getElementById("student-history-list"),
    teacherOptions: document.getElementById("teacher-options"),
    studentOptions: document.getElementById("student-options")
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    hydrateStaticControls();
    wireEvents();
    resetFormDates();
    render();
  }

  function wireEvents() {
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.addEventListener("click", () => switchView(button.dataset.nav));
    });

    elements.teacherContext.addEventListener("change", () => {
      state.settings.currentTeacher = elements.teacherContext.value;
      saveState();
      render();
    });

    document.getElementById("teacher-entry-form").addEventListener("submit", handleTeacherEntrySubmit);
    document.getElementById("admin-entry-form").addEventListener("submit", handleAdminEntrySubmit);
    document.getElementById("category-form").addEventListener("submit", handleCategorySubmit);

    document.getElementById("teacher-entry-form").addEventListener("reset", () => {
      window.setTimeout(resetFormDates, 0);
    });

    document.getElementById("admin-entry-form").addEventListener("reset", () => {
      window.setTimeout(() => {
        resetFormDates();
        elements.adminAssignedBy.value = state.settings.currentTeacher;
        elements.adminNewStatus.value = "assigned";
      }, 0);
    });

    [
      elements.teacherEntryStudentSearch,
      elements.adminStudentFilter,
      elements.teacherStatusFilter,
      elements.adminDateFilter,
      elements.adminCategoryFilter,
      elements.adminStatusFilter,
      elements.adminTeacherFilter,
      elements.studentHistorySearch
    ].forEach((control) => control.addEventListener("change", render));

    [
      elements.teacherEntryStudentSearch,
      elements.adminStudentFilter,
      elements.studentHistorySearch
    ].forEach((control) => control.addEventListener("input", render));

    elements.adminEntryTable.addEventListener("change", (event) => {
      const select = event.target.closest("[data-status-entry]");
      if (!select) return;
      updateEntryStatus(select.dataset.statusEntry, select.value);
    });

    document.body.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === "export-data") exportData();
      if (action === "reset-demo") resetDemo();
      if (action === "toggle-category") toggleCategoryVisibility(id);
    });
  }

  function hydrateStaticControls() {
    elements.teacherOptions.innerHTML = teacherOptions
      .map((teacher) => `<option value="${escapeHtml(teacher)}"></option>`)
      .join("");

    elements.teacherContext.innerHTML = teacherOptions
      .map((teacher) => `<option value="${escapeHtml(teacher)}">${escapeHtml(teacher)}</option>`)
      .join("");

    hydrateDynamicControls();
  }

  function hydrateDynamicControls() {
    const studentOptions = state.students
      .map((student) => `<option value="${escapeHtml(formatStudentSearchValue(student))}"></option>`)
      .join("");

    elements.studentOptions.innerHTML = studentOptions;

    const categoryOptions = state.categories
      .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
      .join("");

    elements.teacherCategory.innerHTML = categoryOptions;
    elements.adminCategory.innerHTML = categoryOptions;

    const statusOptionsMarkup = statusOptions
      .map((status) => `<option value="${status.id}">${escapeHtml(status.name)}</option>`)
      .join("");

    elements.adminNewStatus.innerHTML = statusOptionsMarkup;
    elements.teacherStatusFilter.innerHTML = `<option value="all">All Statuses</option>${statusOptionsMarkup}`;
    elements.adminStatusFilter.innerHTML = `<option value="all">All Statuses</option>${statusOptionsMarkup}`;
    elements.adminCategoryFilter.innerHTML = `<option value="all">All Categories</option>${categoryOptions}`;
    elements.adminDateFilter.innerHTML = [
      '<option value="all">All Dates</option>',
      '<option value="assigned-today">Assigned Today</option>',
      '<option value="detention-today">Detention Today</option>'
    ].join("");

    const assignedByOptions = uniqueAssignedByValues()
      .map((teacher) => `<option value="${escapeHtml(teacher)}">${escapeHtml(teacher)}</option>`)
      .join("");

    elements.adminTeacherFilter.innerHTML = `<option value="all">All Staff</option>${assignedByOptions}`;
  }

  function resetFormDates() {
    const today = toDateInputValue(new Date());
    elements.teacherDetentionDate.value = today;
    elements.adminDetentionDate.value = today;
    elements.adminAssignedBy.value = state.settings.currentTeacher;
    elements.adminNewStatus.value = "assigned";
  }

  function render() {
    hydrateDynamicControlsPreservingValues();
    elements.todayLine.textContent = `${state.settings.schoolName} - ${state.settings.dayLabel}`;
    elements.teacherContext.value = state.settings.currentTeacher;
    renderStats();
    renderTeacherDashboard();
    renderAdminDashboard();
  }

  function hydrateDynamicControlsPreservingValues() {
    const values = {
      teacherCategory: elements.teacherCategory.value,
      adminCategory: elements.adminCategory.value,
      adminNewStatus: elements.adminNewStatus.value,
      teacherStatusFilter: elements.teacherStatusFilter.value || "all",
      adminDateFilter: elements.adminDateFilter.value || "all",
      adminCategoryFilter: elements.adminCategoryFilter.value || "all",
      adminStatusFilter: elements.adminStatusFilter.value || "all",
      adminTeacherFilter: elements.adminTeacherFilter.value || "all"
    };

    hydrateDynamicControls();

    restoreSelectValue(elements.teacherCategory, values.teacherCategory);
    restoreSelectValue(elements.adminCategory, values.adminCategory);
    restoreSelectValue(elements.adminNewStatus, values.adminNewStatus || "assigned");
    restoreSelectValue(elements.teacherStatusFilter, values.teacherStatusFilter);
    restoreSelectValue(elements.adminDateFilter, values.adminDateFilter);
    restoreSelectValue(elements.adminCategoryFilter, values.adminCategoryFilter);
    restoreSelectValue(elements.adminStatusFilter, values.adminStatusFilter);
    restoreSelectValue(elements.adminTeacherFilter, values.adminTeacherFilter);
  }

  function renderStats() {
    const currentTeacher = state.settings.currentTeacher;
    const todayEntries = state.entries.filter((entry) => isToday(entry.assignedAt));
    const myOpenEntries = state.entries.filter((entry) => {
      return entry.assignedBy === currentTeacher && !["served", "canceled", "excused"].includes(entry.status);
    });
    const dressCodeToday = state.entries.filter((entry) => {
      return getCategory(entry.categoryId).id === "dress-code" && isToday(entry.assignedAt);
    });
    const noShows = state.entries.filter((entry) => entry.status === "no-show");

    elements.statToday.textContent = String(todayEntries.length);
    elements.statMyOpen.textContent = String(myOpenEntries.length);
    elements.statDressCode.textContent = String(dressCodeToday.length);
    elements.statNoShow.textContent = String(noShows.length);
  }

  function renderTeacherDashboard() {
    const visibleEntries = uniqueEntries([
      ...state.entries.filter((entry) => entry.assignedBy === state.settings.currentTeacher),
      ...state.entries.filter(isTeacherDailyVisible)
    ]);

    elements.teacherVisibleCount.textContent = `${visibleEntries.length} visible`;
    renderTeacherDressCodeList();
    renderTeacherEntryTable();
  }

  function renderTeacherDressCodeList() {
    const entries = sortEntries(state.entries.filter(isTeacherDailyVisible));
    elements.dressCodeCount.textContent = String(entries.length);

    if (!entries.length) {
      elements.teacherDressCodeList.innerHTML = emptyState("No teacher-visible detentions for today.");
      return;
    }

    elements.teacherDressCodeList.innerHTML = entries.map((entry) => {
      const student = getStudent(entry.studentId);
      const category = getCategory(entry.categoryId);
      const status = getStatus(entry.status);

      return `
        <article class="entry-card">
          <div class="entry-card-head">
            <h4>${escapeHtml(student.name)}</h4>
            ${statusTag(status)}
          </div>
          <div class="entry-meta">
            <span>Grade ${escapeHtml(student.grade)}</span>
            <span>${escapeHtml(category.name)}</span>
            <span>Assigned by ${escapeHtml(entry.assignedBy)}</span>
            <span>Detention ${escapeHtml(formatDate(entry.detentionDate))}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderTeacherEntryTable() {
    const statusFilter = elements.teacherStatusFilter.value || "all";
    const studentSearch = elements.teacherEntryStudentSearch.value || "";
    let entries = state.entries.filter((entry) => entry.assignedBy === state.settings.currentTeacher);

    if (statusFilter !== "all") {
      entries = entries.filter((entry) => entry.status === statusFilter);
    }

    if (studentSearch.trim()) {
      entries = entries.filter((entry) => studentMatchesSearch(getStudent(entry.studentId), studentSearch));
    }

    entries = sortEntries(entries);

    if (!entries.length) {
      elements.teacherEntryTable.innerHTML = `<tr><td colspan="5">${emptyText("No assigned detentions found.")}</td></tr>`;
      return;
    }

    elements.teacherEntryTable.innerHTML = entries.map((entry) => {
      const student = getStudent(entry.studentId);
      const category = getCategory(entry.categoryId);

      return `
        <tr>
          <td>
            <strong>${escapeHtml(student.name)}</strong><br>
            <span class="entry-meta">Grade ${escapeHtml(student.grade)}</span>
          </td>
          <td><span class="tag category">${escapeHtml(category.name)}</span></td>
          <td>${escapeHtml(formatDate(entry.detentionDate))}</td>
          <td>${statusTag(getStatus(entry.status))}</td>
          <td class="notes-cell">${escapeHtml(entry.notes || "None")}</td>
        </tr>
      `;
    }).join("");
  }

  function renderAdminDashboard() {
    elements.adminTotalCount.textContent = `${state.entries.length} total`;
    elements.categoryCount.textContent = String(state.categories.length);
    renderCategoryList();
    renderAdminEntryTable();
    renderStudentHistory();
  }

  function renderCategoryList() {
    elements.categoryList.innerHTML = state.categories.map((category) => {
      const visibilityClass = category.teacherDailyVisible ? "on" : "off";
      const visibilityLabel = category.teacherDailyVisible ? "Visible Daily" : "Admin Only";

      return `
        <article class="category-card">
          <div class="category-card-head">
            <h4>${escapeHtml(category.name)}</h4>
            <span class="visibility-chip ${visibilityClass}">${visibilityLabel}</span>
          </div>
          <div class="category-meta">
            <span>${escapeHtml(countEntriesForCategory(category.id))} entries</span>
            <button class="small-button" type="button" data-action="toggle-category" data-id="${escapeHtml(category.id)}">Toggle Visibility</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderAdminEntryTable() {
    const entries = sortEntries(getFilteredAdminEntries());

    if (!entries.length) {
      elements.adminEntryTable.innerHTML = `<tr><td colspan="7">${emptyText("No discipline entries found.")}</td></tr>`;
      return;
    }

    elements.adminEntryTable.innerHTML = entries.map((entry) => {
      const student = getStudent(entry.studentId);
      const category = getCategory(entry.categoryId);

      return `
        <tr>
          <td>
            <strong>${escapeHtml(student.name)}</strong><br>
            <span class="entry-meta">Grade ${escapeHtml(student.grade)}</span>
          </td>
          <td><span class="tag category">${escapeHtml(category.name)}</span></td>
          <td>${escapeHtml(entry.assignedBy)}</td>
          <td>${escapeHtml(formatDateTime(entry.assignedAt))}</td>
          <td>${escapeHtml(formatDate(entry.detentionDate))}</td>
          <td>
            <select class="status-select" data-status-entry="${escapeHtml(entry.id)}">
              ${statusOptions.map((status) => {
                const selected = status.id === entry.status ? " selected" : "";
                return `<option value="${status.id}"${selected}>${escapeHtml(status.name)}</option>`;
              }).join("")}
            </select>
          </td>
          <td class="notes-cell">${escapeHtml(entry.notes || "None")}</td>
        </tr>
      `;
    }).join("");
  }

  function renderStudentHistory() {
    const studentSearch = elements.studentHistorySearch.value || "";
    let entries = state.entries;

    if (studentSearch.trim()) {
      entries = entries.filter((entry) => studentMatchesSearch(getStudent(entry.studentId), studentSearch));
    }

    entries = sortEntries(entries);

    if (!entries.length) {
      elements.studentHistoryList.innerHTML = emptyState("No student history found.");
      return;
    }

    elements.studentHistoryList.innerHTML = entries.map((entry) => {
      const student = getStudent(entry.studentId);
      const category = getCategory(entry.categoryId);

      return `
        <article class="entry-card">
          <div class="entry-card-head">
            <h4>${escapeHtml(student.name)}</h4>
            ${statusTag(getStatus(entry.status))}
          </div>
          <div class="entry-meta">
            <span>Grade ${escapeHtml(student.grade)}</span>
            <span>${escapeHtml(category.name)}</span>
            <span>${escapeHtml(formatDateTime(entry.assignedAt))}</span>
            <span>Assigned by ${escapeHtml(entry.assignedBy)}</span>
          </div>
          <span class="entry-note">${escapeHtml(entry.notes || "None")}</span>
        </article>
      `;
    }).join("");
  }

  function getFilteredAdminEntries() {
    const dateFilter = elements.adminDateFilter.value || "all";
    const studentSearch = elements.adminStudentFilter.value || "";
    const categoryFilter = elements.adminCategoryFilter.value || "all";
    const statusFilter = elements.adminStatusFilter.value || "all";
    const teacherFilter = elements.adminTeacherFilter.value || "all";

    return state.entries.filter((entry) => {
      if (dateFilter === "assigned-today" && !isToday(entry.assignedAt)) return false;
      if (dateFilter === "detention-today" && !isToday(entry.detentionDate)) return false;
      if (studentSearch.trim() && !studentMatchesSearch(getStudent(entry.studentId), studentSearch)) return false;
      if (categoryFilter !== "all" && entry.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (teacherFilter !== "all" && entry.assignedBy !== teacherFilter) return false;
      return true;
    });
  }

  function handleTeacherEntrySubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const studentId = resolveStudentSearch(elements.teacherStudentSearch.value);
    const categoryId = formData.get("categoryId");
    const detentionDate = formData.get("detentionDate");
    const notes = String(formData.get("notes") || "").trim();

    if (!studentId) {
      showToast("Select one student from the search results.", "error");
      return;
    }

    state.entries.unshift(createEntry({
      studentId,
      categoryId,
      detentionDate,
      notes,
      assignedBy: state.settings.currentTeacher,
      status: "assigned"
    }));

    saveState();
    event.currentTarget.reset();
    resetFormDates();
    render();
    showToast("Detention assigned.", "success");
  }

  function handleAdminEntrySubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const assignedBy = String(formData.get("assignedBy") || "").trim();
    const studentId = resolveStudentSearch(elements.adminStudentSearch.value);

    if (!assignedBy) {
      showToast("Assigned By is required.", "error");
      return;
    }

    if (!studentId) {
      showToast("Select one student from the search results.", "error");
      return;
    }

    state.entries.unshift(createEntry({
      studentId,
      categoryId: formData.get("categoryId"),
      detentionDate: formData.get("detentionDate"),
      notes: String(formData.get("notes") || "").trim(),
      assignedBy,
      status: formData.get("status")
    }));

    if (!teacherOptions.includes(assignedBy)) {
      teacherOptions.push(assignedBy);
    }

    saveState();
    event.currentTarget.reset();
    resetFormDates();
    render();
    showToast("Entry saved.", "success");
  }

  function handleCategorySubmit(event) {
    event.preventDefault();
    const name = elements.categoryName.value.trim();
    const teacherDailyVisible = elements.categoryTeacherVisible.checked;

    if (!name) {
      showToast("Category name is required.", "error");
      return;
    }

    const id = uniqueCategoryId(name);
    state.categories.push({ id, name, teacherDailyVisible });
    saveState();
    event.currentTarget.reset();
    render();
    showToast("Category added.", "success");
  }

  function createEntry({ studentId, categoryId, detentionDate, notes, assignedBy, status }) {
    const now = new Date().toISOString();

    return {
      id: `entry-${Date.now()}`,
      studentId,
      categoryId,
      assignedBy,
      assignedAt: now,
      detentionDate,
      status,
      statusUpdatedAt: now,
      statusUpdatedBy: assignedBy,
      notes
    };
  }

  function updateEntryStatus(id, status) {
    const entry = state.entries.find((item) => item.id === id);
    if (!entry) return;

    entry.status = status;
    entry.statusUpdatedAt = new Date().toISOString();
    entry.statusUpdatedBy = "Admin";
    saveState();
    render();
    showToast("Status updated.", "success");
  }

  function toggleCategoryVisibility(id) {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;

    category.teacherDailyVisible = !category.teacherDailyVisible;
    saveState();
    render();
  }

  function switchView(view) {
    currentView = view;

    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.nav === view);
    });

    document.querySelectorAll(".view").forEach((section) => {
      section.classList.toggle("is-active", section.id === `view-${view}`);
    });

    render();
  }

  function isTeacherDailyVisible(entry) {
    const category = getCategory(entry.categoryId);
    return Boolean(category.teacherDailyVisible && isToday(entry.assignedAt));
  }

  function getStudent(id) {
    return state.students.find((student) => student.id === id) || {
      id,
      name: "Unknown Student",
      grade: "N/A",
      advisory: "N/A"
    };
  }

  function formatStudentSearchValue(student) {
    return `${student.name} - Grade ${student.grade}`;
  }

  function resolveStudentSearch(value) {
    const query = normalizeSearch(value);
    if (!query) return "";

    const exactMatch = state.students.find((student) => {
      return normalizeSearch(formatStudentSearchValue(student)) === query ||
        normalizeSearch(student.name) === query;
    });

    if (exactMatch) return exactMatch.id;

    const matches = state.students.filter((student) => studentMatchesSearch(student, value));
    return matches.length === 1 ? matches[0].id : "";
  }

  function studentMatchesSearch(student, value) {
    const query = normalizeSearch(value);
    if (!query) return true;

    return [
      student.name,
      student.grade,
      `grade ${student.grade}`,
      student.advisory,
      formatStudentSearchValue(student)
    ].some((candidate) => normalizeSearch(candidate).includes(query));
  }

  function normalizeSearch(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getCategory(id) {
    return state.categories.find((category) => category.id === id) || {
      id,
      name: "Unknown",
      teacherDailyVisible: false
    };
  }

  function getStatus(id) {
    return statusOptions.find((status) => status.id === id) || statusOptions[0];
  }

  function countEntriesForCategory(id) {
    return state.entries.filter((entry) => entry.categoryId === id).length;
  }

  function uniqueAssignedByValues() {
    return Array.from(new Set([...teacherOptions, ...state.entries.map((entry) => entry.assignedBy)])).sort();
  }

  function uniqueEntries(entries) {
    const seen = new Set();

    return entries.filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }

  function sortEntries(entries) {
    return [...entries].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  }

  function statusTag(status) {
    return `<span class="tag ${escapeHtml(status.id)}">${escapeHtml(status.name)}</span>`;
  }

  function emptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function emptyText(message) {
    return `<span class="entry-meta">${escapeHtml(message)}</span>`;
  }

  function restoreSelectValue(select, value) {
    if (!value) return;
    const hasValue = Array.from(select.options).some((option) => option.value === value);
    if (hasValue) select.value = value;
  }

  function uniqueCategoryId(name) {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category";

    let id = base;
    let counter = 2;

    while (state.categories.some((category) => category.id === id)) {
      id = `${base}-${counter}`;
      counter += 1;
    }

    return id;
  }

  function isToday(value) {
    const date = parseDate(value);
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }

  function parseDate(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T00:00:00`);
    }

    return new Date(value);
  }

  function formatDate(value) {
    return parseDate(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatDateTime(value) {
    return parseDate(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function loadState() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return createSeedState();

      const parsed = JSON.parse(stored);
      return normalizeState(parsed);
    } catch (error) {
      return createSeedState();
    }
  }

  function normalizeState(parsed) {
    const seed = createSeedState();

    return {
      settings: { ...seed.settings, ...(parsed.settings || {}) },
      students: Array.isArray(parsed.students) ? parsed.students : seed.students,
      categories: Array.isArray(parsed.categories) ? parsed.categories : seed.categories,
      entries: Array.isArray(parsed.entries) ? parsed.entries : seed.entries
    };
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetDemo() {
    const shouldReset = window.confirm("Reset demo data?");
    if (!shouldReset) return;

    state = createSeedState();
    saveState();
    resetFormDates();
    render();
    showToast("Demo data reset.", "success");
  }

  function exportData() {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `student-discipline-${toDateInputValue(new Date())}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Export started.", "success");
  }

  function showToast(message, tone) {
    window.clearTimeout(toastTimer);
    elements.toastStack.innerHTML = `<div class="toast ${tone || ""}">${escapeHtml(message)}</div>`;

    toastTimer = window.setTimeout(() => {
      elements.toastStack.innerHTML = "";
    }, 2600);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
