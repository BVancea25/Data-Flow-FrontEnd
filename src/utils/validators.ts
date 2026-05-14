import { isEmpty, isEmptyArray, isNullOrUndefined } from './index';

// 👉 Required Validator
export const requiredValidator = (value: unknown) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false) return 'This field is required';

  return !!String(value).trim().length || 'This field is required';
};

// 👉 Email Validator
export const emailValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (Array.isArray(value))
    return value.every((val) => re.test(String(val))) || 'The Email field must be a valid email';

  return re.test(String(value)) || 'The Email field must be a valid email';
};

// 👉 Password Validator
export const passwordValidator = (password: string) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/;

  const validPassword = regExp.test(password);

  return (
    // eslint-disable-next-line operator-linebreak
    validPassword ||
    'Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars'
  );
};

// 👉 Confirm Password Validator
export const confirmedValidator = (value: string, target: string) =>
  value === target || 'The Confirm Password field confirmation does not match';

// 👉 Between Validator
export const betweenValidator = (value: unknown, min: number, max: number) => {
  const valueAsNumber = Number(value);

  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || `Enter number between ${min} and ${max}`;
};

// 👉 Integer Validator
export const integerValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  if (Array.isArray(value))
    return value.every((val) => /^-?[0-9]+$/.test(String(val))) || 'This field must be an integer';

  return /^-?[0-9]+$/.test(String(value)) || 'This field must be an integer';
};

// 👉 Regex Validator
export const regexValidator = (value: unknown, regex: RegExp | string): string | boolean => {
  if (isEmpty(value)) return true;

  let regeX = regex;
  if (typeof regeX === 'string') regeX = new RegExp(regeX);

  if (Array.isArray(value)) return value.every((val) => regexValidator(val, regeX));

  return regeX.test(String(value)) || 'The Regex field format is invalid';
};

// 👉 Alpha Validator
export const alphaValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters';
};

// 👉 URL Validator
export const urlValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

  return re.test(String(value)) || 'URL is invalid';
};

// 👉 Length Validator
export const lengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value)) return true;

  return String(value).length === length || `The Min Character field must be at least ${length} characters`;
};

// 👉 Alpha-dash Validator
export const alphaDashValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const valueAsString = String(value);

  return /^[0-9A-Z_-]*$/i.test(valueAsString) || 'All Character are not valid';
};

export const finiteNumberValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  return Number.isFinite(Number(value)) || 'This field must be a valid number';
};

export const positiveNumberValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const valueAsNumber = Number(value);

  if (!Number.isFinite(valueAsNumber)) return 'This field must be a valid number';

  return valueAsNumber > 0 || 'This field must be greater than 0';
};

export const dateOnlyValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const valueAsString = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valueAsString)) return 'Use a valid date';

  const date = new Date(`${valueAsString}T00:00:00`);
  const [year, month, day] = valueAsString.split('-').map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  ) || 'Use a valid date';
};

export const dateTimeLocalValidator = (value: unknown) => {
  if (isEmpty(value)) return true;

  const valueAsString = String(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(valueAsString)) return 'Use a valid date and time';

  const date = new Date(valueAsString);
  if (Number.isNaN(date.getTime())) return 'Use a valid date and time';

  const [datePart, timePart] = valueAsString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
  ) || 'Use a valid date and time';
};

export const maxTrimmedLengthValidator = (maxLength: number) => (value: unknown) => {
  if (isEmpty(value)) return true;

  return String(value).trim().length <= maxLength || `Use ${maxLength} characters or fewer`;
};

export const optionalDateRangeValidator = (from: unknown, to: unknown) => {
  if (isEmpty(from) || isEmpty(to)) return true;

  const fromDateValid = dateOnlyValidator(from);
  const toDateValid = dateOnlyValidator(to);

  if (fromDateValid !== true || toDateValid !== true) return 'Use valid dates';

  return String(from) <= String(to) || 'Start date must be before or equal to end date';
};
