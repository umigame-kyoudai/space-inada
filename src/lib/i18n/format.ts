/**
 * 辞書内の文字列テンプレート（例: "{n} more required"）を値で置換する。
 *
 * 辞書はサーバー→クライアントの Props としてそのまま渡すことがあるため
 * （BookingForm は Client Component）、関数ではなく文字列テンプレートで持つ。
 * 関数は React の Server→Client 境界をシリアライズできずエラーになる。
 */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
