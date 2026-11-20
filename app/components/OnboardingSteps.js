const steps = ["Sign up", "Get verified", "Choose accounts"]

// current is the index of the step the user is on. Steps before it show a check mark.
const OnboardingSteps = ({ current }) => {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide">
      {steps.map((label, i) => {
        const done = i < current
        const circleClass = done
          ? "bg-brand text-white"
          : i === current
            ? "border-2 border-brand text-brand"
            : "bg-gray-100 text-gray-400"
        return (
          <li key={label} className="flex items-center gap-2" aria-current={i === current ? "step" : undefined}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${circleClass}`}>
              {done ? "✓" : i + 1}
            </span>
            <span className={i <= current ? "text-gray-800" : "text-gray-400"}>{label}</span>
            {i < steps.length - 1 && (
              <span className={`h-0.5 w-6 rounded ${done ? "bg-brand" : "bg-gray-200"}`} aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default OnboardingSteps
