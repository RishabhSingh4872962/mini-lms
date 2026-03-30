export function generateCourseHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Course Content</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --indigo: #4F46E5;
      --indigo-light: #EEF2FF;
      --slate-900: #0F172A;
      --slate-700: #334155;
      --slate-500: #64748B;
      --slate-200: #E2E8F0;
      --slate-50: #F8FAFC;
      --white: #FFFFFF;
      --green: #10B981;
      --amber: #F59E0B;
      --red: #EF4444;
      --radius: 14px;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--slate-50);
      color: var(--slate-900);
      padding: 0;
      min-height: 100vh;
    }

    /* ── Loading State ── */
    #loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 16px;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--slate-200);
      border-top-color: var(--indigo);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #loading p { color: var(--slate-500); font-size: 14px; }

    /* ── Main Content ── */
    #content { display: none; padding-bottom: 40px; }

    /* ── Hero ── */
    .hero {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
    }
    .hero img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
    }
    .hero-badges {
      position: absolute;
      bottom: 14px; left: 16px;
      display: flex; gap: 8px;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      backdrop-filter: blur(8px);
    }
    .badge-category { background: rgba(79,70,229,0.85); color: white; }
    .badge-level-beginner { background: rgba(16,185,129,0.85); color: white; }
    .badge-level-intermediate { background: rgba(245,158,11,0.85); color: white; }
    .badge-level-advanced { background: rgba(239,68,68,0.85); color: white; }

    /* ── Body ── */
    .body { padding: 20px 16px 0; }

    .title {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.3;
      color: var(--slate-900);
      margin-bottom: 14px;
    }

    /* ── Stats ── */
    .stats {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--slate-500);
    }
    .stat-icon { font-size: 15px; }
    .stat strong { color: var(--slate-700); }

    /* ── Instructor ── */
    .instructor-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--white);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius);
      padding: 14px;
      margin-bottom: 20px;
    }
    .instructor-card img {
      width: 52px; height: 52px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .instructor-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--slate-500);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .instructor-name { font-size: 16px; font-weight: 700; color: var(--slate-900); }
    .instructor-location { font-size: 13px; color: var(--slate-500); }

    /* ── Section ── */
    .section { margin-bottom: 22px; }
    .section-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 12px;
    }
    .section-text {
      font-size: 14px;
      line-height: 1.7;
      color: var(--slate-500);
    }

    /* ── Curriculum ── */
    .curriculum { display: flex; flex-direction: column; gap: 8px; }
    .lesson {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--white);
      border: 1px solid var(--slate-200);
      border-radius: 10px;
      padding: 12px 14px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .lesson:active { background: var(--indigo-light); }
    .lesson-num {
      width: 28px; height: 28px;
      background: var(--indigo-light);
      color: var(--indigo);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      flex-shrink: 0;
    }
    .lesson-info { flex: 1; }
    .lesson-title { font-size: 14px; font-weight: 600; color: var(--slate-900); }
    .lesson-duration { font-size: 12px; color: var(--slate-500); margin-top: 2px; }
    .lesson-play {
      font-size: 18px;
      color: var(--slate-500);
    }

    /* ── CTA ── */
    .cta-bar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: var(--white);
      border-top: 1px solid var(--slate-200);
      padding: 14px 16px 28px;
    }
    .cta-btn {
      width: 100%;
      background: var(--indigo);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 15px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .cta-btn:active { opacity: 0.85; }
    .cta-btn.enrolled {
      background: var(--indigo-light);
      color: var(--indigo);
    }

    /* ── Progress bar ── */
    .progress-wrap {
      background: var(--slate-200);
      border-radius: 99px;
      height: 6px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: var(--indigo);
      border-radius: 99px;
      transition: width 0.6s ease;
    }

    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: 100px; left: 50%;
      transform: translateX(-50%);
      background: var(--slate-900);
      color: white;
      padding: 10px 20px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      white-space: nowrap;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>

<!-- Loading -->
<div id="loading">
  <div class="spinner"></div>
  <p>Loading course content…</p>
</div>

<!-- Content -->
<div id="content">
  <!-- Hero -->
  <div class="hero">
    <img id="hero-img" src="" alt="Course thumbnail" />
    <div class="hero-overlay"></div>
    <div class="hero-badges">
      <span id="badge-category" class="badge badge-category"></span>
      <span id="badge-level" class="badge"></span>
    </div>
  </div>

  <div class="body">
    <!-- Progress -->
    <div class="progress-wrap" style="margin-top:18px">
      <div class="progress-bar" id="progress-bar" style="width:0%"></div>
    </div>
    <p id="progress-label" style="font-size:12px;color:#64748B;margin-bottom:16px">
      0% complete
    </p>

    <h1 class="title" id="course-title"></h1>

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <span class="stat-icon">⭐</span>
        <strong id="stat-rating"></strong>
        <span id="stat-reviews"></span>
      </div>
      <div class="stat">
        <span class="stat-icon">👥</span>
        <span id="stat-students"></span>
      </div>
      <div class="stat">
        <span class="stat-icon">⏱</span>
        <span id="stat-duration"></span>
      </div>
    </div>

    <!-- Instructor -->
    <div class="instructor-card">
      <img id="instructor-img" src="" alt="Instructor" />
      <div>
        <div class="instructor-label">Instructor</div>
        <div class="instructor-name" id="instructor-name"></div>
        <div class="instructor-location" id="instructor-location"></div>
      </div>
    </div>

    <!-- About -->
    <div class="section">
      <div class="section-title">About this course</div>
      <div class="section-text" id="course-description"></div>
    </div>

    <!-- Curriculum -->
    <div class="section">
      <div class="section-title">Course Curriculum</div>
      <div class="curriculum" id="curriculum"></div>
    </div>
  </div>

  <!-- extra bottom space for CTA -->
  <div style="height:90px"></div>
</div>

<!-- Sticky CTA -->
<div class="cta-bar" id="cta-bar" style="display:none">
  <button class="cta-btn" id="cta-btn" onclick="handleCTA()">Enroll Now</button>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
  var courseData = null;
  var isEnrolled = false;
  var completedLessons = new Set();

  var LESSONS = [
    { title: 'Introduction & Overview', duration: '12 min' },
    { title: 'Setting Up Your Environment', duration: '18 min' },
    { title: 'Core Concepts Deep Dive', duration: '34 min' },
    { title: 'Practical Project - Part 1', duration: '28 min' },
    { title: 'Practical Project - Part 2', duration: '31 min' },
    { title: 'Advanced Techniques', duration: '22 min' },
    { title: 'Testing & Best Practices', duration: '19 min' },
    { title: 'Deploying Your Project', duration: '15 min' },
  ];

  var LEVEL_CLASSES = {
    Beginner: 'badge-level-beginner',
    Intermediate: 'badge-level-intermediate',
    Advanced: 'badge-level-advanced',
  };

  // ── Receive data from React Native ──────────────────────────────────────────
  window.addEventListener('message', function(event) {
    try {
      var msg = JSON.parse(event.data);
      if (msg.type === 'COURSE_DATA') {
        courseData = msg.payload;
        isEnrolled = msg.payload.isEnrolled || false;
        render();
      } else if (msg.type === 'TOGGLE_BOOKMARK') {
        showToast(msg.payload.bookmarked ? '🔖 Bookmarked!' : 'Bookmark removed');
      }
    } catch(e) {}
  });

  function render() {
    var d = courseData;
    if (!d) return;

    document.getElementById('hero-img').src = d.thumbnail;
    document.getElementById('badge-category').textContent = d.category;

    var levelBadge = document.getElementById('badge-level');
    levelBadge.textContent = d.level;
    levelBadge.className = 'badge ' + (LEVEL_CLASSES[d.level] || 'badge-level-beginner');

    document.getElementById('course-title').textContent = d.title;
    document.getElementById('course-description').textContent = d.description;

    document.getElementById('stat-rating').textContent = d.rating;
    document.getElementById('stat-reviews').textContent = '(' + d.reviewCount + ')';
    document.getElementById('stat-students').textContent = d.studentsCount.toLocaleString() + ' students';
    document.getElementById('stat-duration').textContent = d.duration;

    document.getElementById('instructor-img').src = d.instructor.picture.medium;
    document.getElementById('instructor-name').textContent =
      d.instructor.name.first + ' ' + d.instructor.name.last;
    document.getElementById('instructor-location').textContent =
      d.instructor.location.city + ', ' + d.instructor.location.country;

    buildCurriculum();
    updateEnrollState();
    updateProgress();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    document.getElementById('cta-bar').style.display = 'block';
  }

  function buildCurriculum() {
    var container = document.getElementById('curriculum');
    container.innerHTML = '';
    LESSONS.forEach(function(lesson, i) {
      var div = document.createElement('div');
      div.className = 'lesson';
      div.onclick = function() { toggleLesson(i); };
      div.innerHTML =
        '<div class="lesson-num">' + (i + 1) + '</div>' +
        '<div class="lesson-info">' +
          '<div class="lesson-title" id="lt-' + i + '">' + lesson.title + '</div>' +
          '<div class="lesson-duration">' + lesson.duration + '</div>' +
        '</div>' +
        '<span class="lesson-play" id="lp-' + i + '">▶</span>';
      container.appendChild(div);
    });
  }

  function toggleLesson(index) {
    if (completedLessons.has(index)) {
      completedLessons.delete(index);
      document.getElementById('lp-' + index).textContent = '▶';
      document.getElementById('lp-' + index).style.color = '#64748B';
    } else {
      completedLessons.add(index);
      document.getElementById('lp-' + index).textContent = '✓';
      document.getElementById('lp-' + index).style.color = '#10B981';
    }
    updateProgress();

    // Notify native app of progress
    sendToNative({ type: 'LESSON_PROGRESS', payload: {
      completedCount: completedLessons.size,
      totalCount: LESSONS.length,
      percentage: Math.round((completedLessons.size / LESSONS.length) * 100),
    }});
  }

  function updateProgress() {
    var pct = Math.round((completedLessons.size / LESSONS.length) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-label').textContent = pct + '% complete';
  }

  function updateEnrollState() {
    var btn = document.getElementById('cta-btn');
    if (isEnrolled) {
      btn.textContent = 'Continue Learning';
      btn.className = 'cta-btn enrolled';
    } else {
      btn.textContent = 'Enroll Now — $' + (courseData ? courseData.price.toFixed(2) : '');
      btn.className = 'cta-btn';
    }
  }

  function handleCTA() {
    if (isEnrolled) {
      showToast('📚 Keep it up!');
      return;
    }
    isEnrolled = true;
    updateEnrollState();
    showToast('🎉 Enrolled successfully!');
    sendToNative({ type: 'ENROLL', payload: { courseId: courseData && courseData.id } });
  }

  function sendToNative(data) {
    try {
      // React Native WebView bridge
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    } catch(e) {}
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2500);
  }
</script>
</body>
</html>
  `.trim();
}
