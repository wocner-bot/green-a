function countHits(text, words) {
  const hay = String(text || "").toLowerCase();
  return words.reduce((sum, word) => sum + (hay.includes(String(word).toLowerCase()) ? 1 : 0), 0);
}

function regexHits(text, patterns) {
  const hay = String(text || "").toLowerCase();
  return patterns.reduce((sum, pattern) => sum + (pattern.test(hay) ? 1 : 0), 0);
}

function uniqueTypes(segments = []) {
  return new Set(segments.map((s) => (s.type || "").trim().toLowerCase()).filter(Boolean)).size;
}

function assessEducationalFit(data = {}, segments = [], signals = {}) {
  const text = (data.combined || `${data.title || ""}\n${data.topic || ""}\n${data.transcript || ""}\n${data.ocr || ""}`).toLowerCase();
  const title = (data.title || "").toLowerCase();
  const titleAndTopic = `${data.title || ""} ${data.topic || ""}`.toLowerCase();
  const segmentText = segments.map((segment) => `${segment.type || ""} ${segment.note || ""}`).join(" ").toLowerCase();

  const titleEducationHits = regexHits(titleAndTopic, [
    /(^|\s)(урок|лекци[яи]|курс|семинар|вебинар|tutorial|lesson|lecture|course|guide)(\s|$)/i,
    /обуч|учеб|науч|изуч|разбер|объясн|решаем|решени[ея]|практик|тренаж[её]р|гайд|guide|walkthrough/i
  ]);

  const subjectMatterHits = regexHits(`${titleAndTopic} ${text}`, [
    /математ|алгебр|геометр|calculus|физик|хими|биологи|истори[яи]|географ/i,
    /англий|english|grammar|vocabulary|ielts|toefl|немец|deutsch|испан|француз|япон|китай/i,
    /python|javascript|typescript|react|node|sql|postgres|программ|кодинг|разработк|баз[аы]\s+данных|ux|ui|figma|trading|трейдинг/i
  ]);

  const formatHits = countHits(text, ["обуч", "учеб", "урок", "курс", "лекция", "семинар", "объясн", "tutorial", "lesson", "course", "learning", "гайд", "guide", "walkthrough", "how to"]);
  const methodHits = countHits(text, [
    "разберем", "разбираем", "решим", "решаем", "покажу как", "пошаг", "разбор", "пример", "кейс", "формула", "алгоритм", "метод",
    "explain", "explained", "define", "definition", "step by step", "walkthrough", "demo", "demonstration", "solve", "solution"
  ]);
  const practiceOrCheckHits = countHits(text, [
    "задание", "упражнение", "практик", "проверь", "проверка", "тест", "practice", "exercise", "quiz", "assignment", "homework", "check your answer"
  ]);
  const goalHits = countHits(text, [
    "цель урока", "цель обучения", "упр", "результат обучения", "вы научитесь", "навык",
    "learning objective", "goal of the lesson", "you will learn", "by the end of this lesson"
  ]);

  const hardNonLearningHits = countHits(text, [
    "интервью", "беседа", "подкаст", "новости", "реакция", "vlog", "развлекатель",
    "документальный", "обзор", "биография", "размышления", "мнение", "opinion", "ток-шоу",
    "реклама", "реклам", "пранк", "юмор", "концерт", "клип", "стрим", "трансляция", "игра", "игровой"
  ]);

  const motivationalMarkers = countHits(text, [
    "верь в себя", "поверить в себя", "верьте в себя", "можешь ты", "сможешь ты", "будешь успешн",
    "преуспев", "разбогатеть", "заработай", "зарабатывай", "работает у нас", "работает со мной",
    "система работает", "это работает", "я докажу"
  ]);

  const quickPromiseMarkers = countHits(text, [
    "за неделю", "за день", "за час", "за 30 дней", "за 7 дней",
    "быстро", "быстрый", "в кратчайшие", "мгновенно", "сразу же",
    "простой способ", "легкий путь", "без усилий", "без работы", "легко и просто"
  ]);

  const salesPushMarkers = countHits(text, [
    "купи", "купить", "заказ", "заказать", "подпишись", "подписывайтесь", "лайки",
    "скидка", "скидку", "бонус", "подарок", "осталось мест", "спешите",
    "ограниченное предложение", "только сегодня", "только для вас", "эксклюзивно"
  ]);

  const guaranteeMarkers = countHits(text, [
    "гарантиров", "обещаю", "обещание", "научу за", "научишься за", "научу", "научиться",
    "станьте экспертом", "станешь экспертом", "эксперт за", "профессионал за", "эксперта за",
    "результат за", "успех за", "деньги назад", "путь до эксперта", "путь к успеху", "станет"
  ]);

  const hasLearningSegments = /практи|задани|упраж|пример|разбор|провер|exercise|assignment|example|practice|step by step|walkthrough/i.test(segmentText);
  const hasChapterStructure = segments.filter((s) => s.source === "description").length >= 3;
  const hasCaptionStructure = segments.filter((s) => s.source === "captions").length >= 3;
  const hasSegmentedLearningFlow = segments.length >= 3 && hasLearningSegments;
  const hasVisualStructure = signals.visualObservationCount >= 2;
  const hasVisualTeachingCore = hasVisualStructure && signals.visualInstructionHits > 1;
  const hasLectureFormat = /лекци|lecture|chapter|глава|серия|часть|модуль|course|курс/i.test(text);
  const hasCourseLikeStructure = hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow;

  const hasInstructionalFormat = formatHits > 0 || /урок|курс|обуч|tutorial|lesson|course/i.test(title);
  const hasMethod = methodHits > 0 || hasLearningSegments;
  const hasPractice = practiceOrCheckHits > 0 && !/нет[^.\n]{0,35}практик|без\s+практик|no\s+practice|without\s+practice/i.test(text);
  const hasGoal = goalHits > 0 && !/нет[^.\n]{0,35}цел[ьи]|без\s+цели|no\s+clear\s+goal|without\s+goal/i.test(text);
  const mechanicsCount = [hasMethod, hasPractice, hasGoal, hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore].filter(Boolean).length;

  const hasStrongTeachingCore = (hasMethod && hasGoal) || (hasPractice && (hasMethod || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore));
  const hasEducationalIntent = titleEducationHits > 0 || formatHits >= 1 || (subjectMatterHits > 0 && (hasInstructionalFormat || hasMethod || hasLectureFormat || hasCourseLikeStructure));
  const hasEducationalMechanics = hasMethod || hasPractice || hasGoal || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore;
  const hasEducationalSignal = hasStrongTeachingCore || (hasEducationalIntent && hasEducationalMechanics && mechanicsCount >= 2);

  const learningEvidence = [hasInstructionalFormat, hasMethod, hasPractice, hasGoal, hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow, mechanicsCount >= 2].filter(Boolean).length;

  const score = Math.max(0, Math.min(10,
    1.5 +
    (hasInstructionalFormat ? 2 : 0) +
    (hasMethod ? 2 : 0) +
    (hasPractice ? 1.5 : 0) +
    (hasGoal ? 1.2 : 0) +
    (hasChapterStructure ? 1.2 : 0) +
    (hasSegmentedLearningFlow ? 0.8 : 0) +
    (mechanicsCount >= 2 ? 0.9 : 0) +
    (hasEducationalIntent ? 0.9 : 0) -
    (hardNonLearningHits ? Math.min(hardNonLearningHits, 3) * 0.9 : 0)
  ));

  const strongInfotainment = hardNonLearningHits > 0 && mechanicsCount < 2;
  const onlyHomeworkOrViewing = hasPractice && !hasEducationalSignal && /домашнее задание|приятного просмотра/i.test(text);
  
  const isSelfHelpMotivational = (motivationalMarkers >= 2 || quickPromiseMarkers >= 3) && !hasPractice && !hasMethod;
  const isSalesHeavy = salesPushMarkers >= 2 && (guaranteeMarkers >= 1 || mechanicsCount < 2);
  const hasOverpromising = (guaranteeMarkers >= 2 || quickPromiseMarkers >= 4) && !hasGoal && !hasMethod;
  const isAggressiveMarketing = quickPromiseMarkers >= 4 && salesPushMarkers >= 3;
  const noTeachingMechanism = mechanicsCount < 2;
  const isOverviewWithoutTeachingCore = /обзор|review|discussion|react/i.test(text) && !hasGoal && !hasPractice;
  const isSalesLeadWithoutPractice = salesPushMarkers >= 1 && !hasPractice && !hasGoal && !hasCourseLikeStructure;
  const exclude = !hasEducationalSignal || strongInfotainment || onlyHomeworkOrViewing || score < 2.5 || isSalesHeavy || hasOverpromising || isSelfHelpMotivational || isAggressiveMarketing || noTeachingMechanism || isOverviewWithoutTeachingCore || isSalesLeadWithoutPractice;
  const eligible = !exclude && score >= 5;
  const weak = !exclude && score < 5;

  const reasons = [];
  if (hardNonLearningHits) reasons.push(`медийные маркеры: ${hardNonLearningHits}`);
  if (motivationalMarkers >= 2) reasons.push(`мотивационный контент: ${motivationalMarkers}`);
  if (quickPromiseMarkers >= 3) reasons.push(`обещания быстрого результата: ${quickPromiseMarkers}`);
  if (salesPushMarkers >= 3) reasons.push(`агрессивные продажи: ${salesPushMarkers}`);
  if (guaranteeMarkers >= 2) reasons.push(`гарантии и переуспевание: ${guaranteeMarkers}`);
  if (!hasEducationalSignal) reasons.push("видео не имеет достаточной учебной структуры или цели");
  if (isSalesHeavy) reasons.push("контент перегружен продажами вместо обучения");
  if (hasOverpromising) reasons.push("видео содержит завышенные обещания без методологии");
  if (isSelfHelpMotivational) reasons.push("контент мотивационный, без конкретной методики и практики");
  if (noTeachingMechanism) reasons.push("недостаточно учебной механики: нет цели/метода/практики в достаточном объеме");
  if (isOverviewWithoutTeachingCore) reasons.push("обзорный формат без явной учебной цели и практики");
  if (isSalesLeadWithoutPractice) reasons.push("продвижение курса преобладает над учебной частью");
  if (weak) reasons.push("учебный формат слабый: рейтинг будет снижен");
  if (exclude) reasons.push("слишком мало признаков обучения или формат явно медийный");

  return { 
    eligible, 
    weak, 
    exclude, 
    score: Number(score.toFixed(1)), 
    learningEvidence, 
    reasons,
    markers: {
      hardNonLearningHits,
      motivationalMarkers,
      quickPromiseMarkers,
      salesPushMarkers,
      guaranteeMarkers
    }
  };
}

module.exports = { assessEducationalFit };
