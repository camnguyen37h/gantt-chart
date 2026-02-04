/**
 * Validation utility for score settings
 * Validates score entries with required fields, duplicate checks, length validation, and N/A mandatory check
 */

// Validation constants
export const VALIDATION_RULES = {
  SCORE_MAX_LENGTH: 20,
  DEFINITION_MAX_LENGTH: 500,
  DEFINITION_MIN_LENGTH: 10,
  REQUIRED_SCORE: 'N/A' // N/A is mandatory
};

/**
 * Validates an array of score entries
 * @param {Array} scores - Array of score objects
 * @returns {Object} - { isValid: boolean, errors: object }
 */
export const validateScores = (scores) => {
  const errors = {};
  let isValid = true;

  // Check if N/A exists
  const hasNA = scores.some(score => score.score === 'N/A');
  if (!hasNA) {
    errors.general = 'Bắt buộc phải có một bản ghi với Score là "N/A"!';
    isValid = false;
  }

  // Collect all score names to check for duplicates
  const scoreNames = [];

  scores.forEach((score, index) => {
    // Validate Score field - Required
    if (!score.score || score.score.trim() === '') {
      errors[`${index}-score`] = 'Score là bắt buộc!';
      isValid = false;
    } else if (score.score.length > VALIDATION_RULES.SCORE_MAX_LENGTH) {
      errors[`${index}-score`] = `Score không được vượt quá ${VALIDATION_RULES.SCORE_MAX_LENGTH} ký tự!`;
      isValid = false;
    } else {
      // Add to array for duplicate check
      scoreNames.push({ name: score.score.trim().toLowerCase(), index });
    }

    // Validate Base Score - Required
    if (score.baseScore === '' || score.baseScore === null || score.baseScore === undefined) {
      errors[`${index}-baseScore`] = 'Base Score là bắt buộc!';
      isValid = false;
    } else if (isNaN(score.baseScore)) {
      errors[`${index}-baseScore`] = 'Base Score phải là số!';
      isValid = false;
    }

    // Validate Definition - Required
    if (!score.definition || score.definition.trim() === '') {
      errors[`${index}-definition`] = 'Định nghĩa là bắt buộc!';
      isValid = false;
    } else if (score.definition.trim().length < VALIDATION_RULES.DEFINITION_MIN_LENGTH) {
      errors[`${index}-definition`] = `Định nghĩa phải có ít nhất ${VALIDATION_RULES.DEFINITION_MIN_LENGTH} ký tự!`;
      isValid = false;
    } else if (score.definition.length > VALIDATION_RULES.DEFINITION_MAX_LENGTH) {
      errors[`${index}-definition`] = `Định nghĩa không được vượt quá ${VALIDATION_RULES.DEFINITION_MAX_LENGTH} ký tự!`;
      isValid = false;
    }
  });

  // Check for duplicate score names
  const duplicates = findDuplicates(scoreNames);
  if (duplicates.length > 0) {
    duplicates.forEach(({ name, indices }) => {
      indices.forEach(index => {
        errors[`${index}-score`] = `Score "${name}" bị trùng lặp!`;
      });
    });
    isValid = false;
  }

  return {
    isValid,
    errors
  };
};

/**
 * Find duplicate score names
 * @param {Array} scoreNames - Array of {name, index} objects
 * @returns {Array} - Array of duplicate entries with their indices
 */
const findDuplicates = (scoreNames) => {
  const nameMap = {};
  const duplicates = [];

  scoreNames.forEach(({ name, index }) => {
    if (!nameMap[name]) {
      nameMap[name] = [];
    }
    nameMap[name].push(index);
  });

  Object.entries(nameMap).forEach(([name, indices]) => {
    if (indices.length > 1) {
      duplicates.push({ name, indices });
    }
  });

  return duplicates;
};

/**
 * Check if a score name is unique within the scores array
 * @param {string} scoreName - The score name to check
 * @param {number} currentIndex - The current index to exclude from check
 * @param {Array} scores - Array of all scores
 * @returns {boolean} - True if unique, false otherwise
 */
export const isScoreNameUnique = (scoreName, currentIndex, scores) => {
  const normalizedName = scoreName.trim().toLowerCase();
  return !scores.some((score, index) =>
    index !== currentIndex &&
    score.score.trim().toLowerCase() === normalizedName
  );
};

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {Array} allScores - All scores for duplicate checking
 * @param {number} currentIndex - Current index for duplicate checking
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (field, value, allScores = [], currentIndex = -1) => {
  switch (field) {
    case 'score':
      if (!value || value.trim() === '') {
        return 'Score là bắt buộc!';
      }
      if (value.length > VALIDATION_RULES.SCORE_MAX_LENGTH) {
        return `Score không được vượt quá ${VALIDATION_RULES.SCORE_MAX_LENGTH} ký tự!`;
      }
      if (!isScoreNameUnique(value, currentIndex, allScores)) {
        return 'Score bị trùng lặp!';
      }
      break;

    case 'baseScore':
      if (value === '' || value === null || value === undefined) {
        return 'Base Score là bắt buộc!';
      }
      if (isNaN(value)) {
        return 'Base Score phải là số!';
      }
      break;

    case 'definition':
      if (!value || value.trim() === '') {
        return 'Định nghĩa là bắt buộc!';
      }
      if (value.trim().length < VALIDATION_RULES.DEFINITION_MIN_LENGTH) {
        return `Định nghĩa phải có ít nhất ${VALIDATION_RULES.DEFINITION_MIN_LENGTH} ký tự!`;
      }
      if (value.length > VALIDATION_RULES.DEFINITION_MAX_LENGTH) {
        return `Định nghĩa không được vượt quá ${VALIDATION_RULES.DEFINITION_MAX_LENGTH} ký tự!`;
      }
      break;

    default:
      return null;
  }

  return null;
};
