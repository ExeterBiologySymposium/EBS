type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function submissionKey(userId: string) {
  return `ebs:student-application:2027:${userId}`;
}

export function readSubmission(storage: ProgressStorage, userId: string) {
  return storage.getItem(submissionKey(userId)) === '1';
}

export function saveSubmission(storage: ProgressStorage, userId: string, submitted: boolean) {
  if (submitted) storage.setItem(submissionKey(userId), '1');
  else storage.removeItem(submissionKey(userId));
}
