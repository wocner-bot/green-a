const test = require('node:test');
const assert = require('node:assert/strict');
const { assessEducationalFit } = require('../lib/educationalFit.js');

test('Excludes clear vlog / entertainment video', () => {
  const data = { title: 'Мой влог: прогулка по городу', transcript: 'привет, приятного просмотра, лайки и подписывайтесь' };
  const result = assessEducationalFit(data, [], {});
  assert.equal(result.exclude, true, 'Vlog should be excluded from rating');
});

test('Excludes interview-style content without teaching core', () => {
  const data = { title: 'Интервью с экспертом: мнение о науке', transcript: 'мы обсуждаем идеи, это интервью и размышления, без структуры урока' };
  const result = assessEducationalFit(data, [{ time: '00:00-00:30', type: 'интервью' }], { visualObservationCount: 0 });
  assert.equal(result.exclude, true, 'Interview content should be excluded even with subject terms');
});

test('Includes clear tutorial with practice and goal', () => {
  const data = { title: 'Урок SQL: практическое задание', transcript: 'цель урока: научиться писать join. Задание: напишите запрос и проверьте результат' };
  const result = assessEducationalFit(data, [{ time: '00:00-00:50', type: 'практика', source: 'media' }, { time: '00:50-01:40', type: 'теория' }, { time: '01:40-02:30', type: 'практика' }], { visualObservationCount: 0 });
  assert.equal(result.exclude, false, 'Tutorial with practice should not be excluded');
  assert.equal(result.eligible, true, 'Tutorial should be eligible');
});

test('Borderline educational text without teaching core is excluded if score low', () => {
  const data = { title: 'Обзор технологий', transcript: 'это обзор, немного примеров, но нет явной цели и практики' };
  const result = assessEducationalFit(data, [{ time: '00:00-00:40', type: 'обзор' }], {});
  assert.equal(result.exclude, true, 'Overview without teaching core should be excluded');
});

test('Excludes motivational content with quick promises and sales push', () => {
  const data = {
    title: 'Стань AI-экспертом за неделю: мотивационный интенсив',
    transcript: 'верьте в себя! За неделю вы станете экспертом! Это быстро, очень быстро и легко. За 7 дней преуспеете! Курс стоит 5000 рублей, купите прямо сейчас, спешите осталось мест. Не углубляться в детали, просто верьте и заработайте. Обещаю результаты! Гарантирую успех за неделю!'
  };
  const result = assessEducationalFit(data, [], { visualObservationCount: 0 });
  assert.equal(result.exclude, true, 'Motivational + quick promise + sales should be excluded');
  assert(result.markers.motivationalMarkers >= 2, `Should detect motivational markers, got ${result.markers.motivationalMarkers}`);
  assert(result.markers.quickPromiseMarkers >= 3, `Should detect quick promise markers, got ${result.markers.quickPromiseMarkers}`);
  assert(result.markers.salesPushMarkers >= 3, `Should detect sales markers, got ${result.markers.salesPushMarkers}`);
  assert(result.markers.guaranteeMarkers >= 1, `Should detect guarantee markers, got ${result.markers.guaranteeMarkers}`);
});

test('Excludes course-overview sales content without clear teaching mechanics', () => {
  const data = {
    title: 'Курс по трейдингу: обзор стратегий',
    transcript: 'Разберем популярные стратегии и почему они работают. Подписывайтесь и покупайте полный курс.'
  };
  const result = assessEducationalFit(data, [], {});
  assert.equal(result.exclude, true, 'Course promo overview should be excluded as not enough teaching mechanics');
});

test('Includes English lecture with examples and exercises', () => {
  const data = {
    title: 'Lecture: Linear Algebra basics',
    transcript: 'In this lecture we define vectors and matrices, explain core concepts, solve examples, and give exercises for independent practice.'
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:45', type: 'theory', note: 'definitions and concepts' },
    { time: '00:45-01:30', type: 'example', note: 'solve examples step by step' },
    { time: '01:30-02:15', type: 'practice', note: 'exercise for learners' }
  ], {});
  assert.equal(result.exclude, false, 'Structured lecture with examples/exercises should be included');
});

test('Includes Russian step-by-step tool tutorial with assignment', () => {
  const data = {
    title: 'Гайд по Figma',
    transcript: 'Сегодня пошагово покажу интерфейс Figma, сделаем прототип и в конце дам практическое задание для самостоятельной проверки.'
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:50', type: 'теория', note: 'обзор интерфейса' },
    { time: '00:50-01:40', type: 'пример', note: 'делаем прототип' },
    { time: '01:40-02:25', type: 'практика', note: 'задание и проверка' }
  ], {});
  assert.equal(result.exclude, false, 'Step-by-step tutorial with assignment should be included');
});

test('Marks borderline explainer as uncertain (not excluded)', () => {
  const data = {
    title: 'Разбор темы: что такое event loop',
    transcript: 'В этом видео разберем базовую идею event loop и почему это важно. Без практического задания, только концептуальное объяснение.'
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:50', type: 'теория', note: 'концептуальное объяснение' },
    { time: '00:50-01:35', type: 'пример', note: 'упрощенный пример' }
  ], {});
  assert.equal(result.exclude, false, 'Borderline explainer should not be force-excluded');
  assert.equal(result.uncertain, true, 'Borderline explainer should be marked uncertain');
  assert.equal(result.classification, 'uncertain', 'Classification should be uncertain');
});

test('Excludes talk-show guest format by title', () => {
  const data = {
    title: 'Школа Злословия. Гость программы - Рената Литвинова',
    transcript: 'разговор о жизни, интервью и обсуждение личного опыта'
  };
  const result = assessEducationalFit(data, [], {});
  assert.equal(result.exclude, true, 'Talk-show guest format should be excluded');
  assert.equal(result.classification, 'non-educational', 'Talk-show guest format should be non-educational');
});

test('Includes educational video by title + description when transcript is missing', () => {
  const data = {
    title: 'Урок по алгебре: квадратные уравнения',
    description: 'Цель урока: научиться решать квадратные уравнения. Пошаговый разбор, пример и практическое задание для самостоятельной проверки.',
    transcript: ''
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:45', type: 'теория', source: 'description' },
    { time: '00:45-01:30', type: 'пример', source: 'description' },
    { time: '01:30-02:10', type: 'практика', source: 'description' }
  ], {});
  assert.equal(result.exclude, false, 'Educational description should not be excluded when transcript missing');
  assert.equal(result.classification, 'educational', 'Educational description should classify as educational');
});

test('Marks title-only beginner lesson as uncertain instead of non-educational when data is sparse', () => {
  const data = {
    title: '1. Грузинский язык с нуля - Я есть, ты есть',
    description: '',
    transcript: ''
  };
  const result = assessEducationalFit(data, [], {});
  assert.equal(result.exclude, false, 'Sparse title-only beginner lesson should not be hard-excluded');
  assert.equal(result.classification, 'uncertain', 'Sparse title-only lesson should be uncertain');
});

test('Classifies lesson as educational when description has objective and practice even without transcript', () => {
  const data = {
    title: 'Грузинский язык с нуля. Урок 1',
    description: 'Вы научитесь строить базовые фразы. Пошаговый разбор, примеры и упражнение для самостоятельной проверки.',
    transcript: ''
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:40', type: 'теория', source: 'description' },
    { time: '00:40-01:20', type: 'пример', source: 'description' },
    { time: '01:20-02:00', type: 'практика', source: 'description' }
  ], {});
  assert.equal(result.exclude, false, 'Lesson with description objective/practice should not be excluded');
  assert.equal(result.classification, 'educational', 'Lesson with clear description teaching mechanics should be educational');
});

test('Excludes satirical film review even if transcript contains incidental educational words', () => {
  const data = {
    title: '[BadComedian] - РЖАКА С КОЗЛОВСКИМ И ГАЛУСТЯНОМ (Российская комедия в 2026 году)',
    description: '#BadComedian обзор комедии. Российская комедия про пердеж с Козловским в 2026 году.',
    transcript: 'Сегодня по сути мы смотрим фильм. Это обзор комедии. В школе у нас не было действительно нужного урока ДНК России. Вместо него мы почему-то думали, что полезно изучать иностранный язык. Но вернемся к сюжету фильма и шуткам про пердеж.'
  };
  const result = assessEducationalFit(data, [
    { time: '00:00-00:50', type: 'обзор', note: 'сатирический разбор фильма' },
    { time: '00:50-01:40', type: 'пример', note: 'шутки и комментарии автора' }
  ], {});
  assert.equal(result.exclude, true, 'Satirical entertainment review should be excluded from educational rating');
  assert.equal(result.classification, 'non-educational', 'Satirical entertainment review should classify as non-educational');
});
