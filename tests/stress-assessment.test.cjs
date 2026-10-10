const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/stress-assessment-core.js');

function baselineAnswers() {
  const answers = Array(30).fill(0);
  answers[6] = 4;
  answers[7] = 4;
  answers[29] = null;
  return answers;
}

test('configures exactly 30 original questions with the required domain counts', () => {
  assert.deepEqual(core.sections.map((section) => section.questions.length), [8, 7, 5, 5, 5]);
  assert.deepEqual(core.responseScales.stress, ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always']);
  assert.deepEqual(core.responseScales.frequency, ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']);
  assert.deepEqual(core.responseScales.impact, ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely']);
  assert.equal(core.sections[4].questions[3].required, false);
  assert.equal(core.sections[4].questions[4].conditional, true);
  assert.equal(core.sections[4].questions[4].options[3], 'Prefer not to answer');
});

test('reverse-codes both positive coping indicators in the descriptive stress index', () => {
  const answers = baselineAnswers();
  assert.equal(core.calculateProfiles(answers).stressIndex, 0);
  answers.splice(0, 8, 4, 4, 4, 4, 4, 4, 0, 0);
  const highest = core.calculateProfiles(answers);
  assert.equal(highest.stressRaw, 32);
  assert.equal(highest.stressIndex, 100);
});

test('keeps symptom and functional profiles separate from the stress visualization', () => {
  const answers = baselineAnswers();
  answers[8] = 2;
  answers[15] = 1;
  answers[20] = 2;
  const profiles = core.calculateProfiles(answers);
  assert.equal(profiles.stressIndex, 0);
  assert.deepEqual(profiles.emotional, [2, 0, 0, 0, 0]);
  assert.deepEqual(profiles.cognitive, [0, 0]);
  assert.deepEqual(profiles.physical, [1, 0, 0, 0, 0]);
  assert.deepEqual(profiles.functional, [2, 0, 0, 0, 0]);
  assert.equal(core.getRecommendation(profiles).kind, 'consider');
});

test('recommends professional support for recurring symptoms or reduced coping confidence', () => {
  const recurring = baselineAnswers();
  recurring[8] = 1;
  recurring[9] = 1;
  assert.equal(core.getRecommendation(core.calculateProfiles(recurring)).kind, 'consider');

  const lowStressPoorCoping = baselineAnswers();
  lowStressPoorCoping[27] = 2;
  assert.equal(core.calculateProfiles(lowStressPoorCoping).stressIndex, 0);
  assert.equal(core.getRecommendation(core.calculateProfiles(lowStressPoorCoping)).kind, 'consider');
});

test('recommends prompt assessment for marked impairment, persistence or worsening', () => {
  for (const [index, value] of [[20, 3], [25, 3], [26, 2]]) {
    const answers = baselineAnswers();
    answers[index] = value;
    const profiles = core.calculateProfiles(answers);
    assert.equal(profiles.stressIndex, 0);
    assert.equal(core.getRecommendation(profiles).kind, 'prompt');
  }
});

test('positive suicidal-thought responses receive prompt support without inferring safety', () => {
  const answers = baselineAnswers();
  answers[28] = 1;
  answers[29] = 0;
  let profiles = core.calculateProfiles(answers);
  assert.equal(profiles.urgent, false);
  assert.equal(core.getRecommendation(profiles).kind, 'prompt');

  answers[29] = 3;
  profiles = core.calculateProfiles(answers);
  assert.equal(profiles.urgent, false);
  assert.equal(core.getRecommendation(profiles).kind, 'prompt');
});

test('unanswered and prefer-not-to-answer safety responses remain unknown, not negative', () => {
  for (const response of [null, 3]) {
    const answers = baselineAnswers();
    answers[28] = response;
    const profiles = core.calculateProfiles(answers);
    assert.equal(profiles.urgent, false);
    assert.equal(profiles.prompt, false);
    assert.equal(core.getRecommendation(profiles).kind, 'self-care');
  }
});

test('yes or unsure about immediate safety overrides every non-urgent result', () => {
  for (const immediateResponse of [1, 2]) {
    const answers = baselineAnswers();
    answers[28] = 1;
    answers[29] = immediateResponse;
    const profiles = core.calculateProfiles(answers);
    assert.equal(profiles.stressIndex, 0);
    assert.equal(profiles.urgent, true);
    assert.equal(core.getRecommendation(profiles).kind, 'urgent');
  }
});

test('rejects malformed answer profiles rather than returning a success-shaped score', () => {
  assert.throws(() => core.calculateProfiles([]), /exactly 30/);
  const invalid = baselineAnswers();
  invalid[0] = 5;
  assert.throws(() => core.calculateProfiles(invalid), /invalid response/);
});
