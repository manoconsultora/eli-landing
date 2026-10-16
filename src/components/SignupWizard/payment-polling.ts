export function startSequentialPolling(
  run: () => Promise<boolean>,
  intervalMs: number,
) {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    let shouldContinue = true;
    try {
      shouldContinue = await run();
    } catch {
      // A transient status failure should retry after the same quiet interval.
    }

    if (stopped || !shouldContinue) return;
    timer = setTimeout(() => void poll(), intervalMs);
  };

  void poll();

  return () => {
    stopped = true;
    if (timer !== undefined) clearTimeout(timer);
  };
}
