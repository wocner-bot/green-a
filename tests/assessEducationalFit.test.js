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
