import log from "loglevel";

// 1. Create a custom method factory
const originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
  // Get the original method (e.g., console.info, console.warn)
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  // 2. Return a new function that formats the message
  return function (...args) {
    // Create a timestamp like "14:30:45"
    const timestamp = new Date().toLocaleTimeString();

    // Create a level label like "INFO" or "WARN"
    const levelLabel = methodName.toUpperCase();

    // Prepend the formatted prefix to the first argument
    const prefix = `[${timestamp}] [${levelLabel}]`;

    // Use console formatting so objects are still inspectable
    rawMethod(`%c${prefix}`, "color: #888;", ...args);
  };
};

// 3. Apply the changes
log.rebuild();

export default log;
