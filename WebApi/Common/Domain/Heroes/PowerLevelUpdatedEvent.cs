using LinkawyGenie.Common.Domain.Base.EventualConsistency;
using LinkawyGenie.Common.Domain.Base.Interfaces;

namespace LinkawyGenie.Common.Domain.Heroes;

public record PowerLevelUpdatedEvent(Hero Hero) : IDomainEvent
{
    public static readonly Error TeamNotFound = EventualConsistencyError.From(
        code: "PowerLeveUpdated.TeamNotFound",
        description: "Team not found"
    );
}
