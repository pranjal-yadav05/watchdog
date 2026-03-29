export const SUSPICIOUS_SCORE_THRESHOLD = 0.5;

export function isSuspiciousByScore(score) {
  if (score == null || Number.isNaN(Number(score))) return false;
  return Number(score) > SUSPICIOUS_SCORE_THRESHOLD;
}

export function isSuspiciousAccount(account) {
  if (!account) return false;
  return isSuspiciousByScore(account.suspiciousScore);
}
