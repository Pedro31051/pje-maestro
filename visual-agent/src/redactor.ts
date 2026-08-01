export function redactText(text: string): string {
  if (!text) return '';
  // Mask CNJ: 0801234-56.2025.8.14.0028 -> 080****-**.2025.8.14.****
  let redacted = text.replace(
    /(\d{3})\d{4}-\d{2}(\.\d{4}\.\d\.\d{2}\.)\d{4}/g,
    '$1****-**$2****'
  );

  // Mask CPF: 123.456.789-00 -> ***.***.***-**
  redacted = redacted.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '***.***.***-**');

  return redacted;
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.forEach((_, key) => {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('pass')) {
        parsed.searchParams.set(key, 'REDACTED');
      }
    });
    return parsed.toString();
  } catch (e) {
    return url;
  }
}
