export const generationMessages = Object.freeze([
  'Analyzing your resume…',
  'Comparing your experience with the role…',
  'Preparing interview questions and your plan…',
]);

export function nextGenerationMessage(index) {
  return (index + 1) % generationMessages.length;
}
