export const TEST_DATA_COOKIE = "loopless_data_mode";
export const TEST_DATA_HEADER = "x-loopless-data-mode";
export const TEST_DATA_VALUE = "test";

export function isTestDataModeFromRequest(req: Request) {
  const headerMode = req.headers.get(TEST_DATA_HEADER);
  if (headerMode === TEST_DATA_VALUE) return true;
  const cookie = req.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${TEST_DATA_COOKIE}=${TEST_DATA_VALUE}`);
}

export function isTestDataModeFromCookieStore(value?: string | null) {
  return value === TEST_DATA_VALUE;
}
