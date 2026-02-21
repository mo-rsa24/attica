class SchedulingError(Exception):
    pass


class ConflictError(SchedulingError):
    pass


class PolicyViolationError(SchedulingError):
    pass


class TransitionError(SchedulingError):
    pass


class IdempotencyConflictError(SchedulingError):
    pass
