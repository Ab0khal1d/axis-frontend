using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Heroes;
using LinkawyGenie.Common.Domain.Teams;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Persistence;

// TODO: New strongly typed IDs should be registered here

[EfCoreConverter<HeroId>]
[EfCoreConverter<TeamId>]
[EfCoreConverter<MissionId>]
[EfCoreConverter<ConversationId>]
[EfCoreConverter<MessageId>]
[EfCoreConverter<UserId>]
internal sealed partial class VogenEfCoreConverters;
