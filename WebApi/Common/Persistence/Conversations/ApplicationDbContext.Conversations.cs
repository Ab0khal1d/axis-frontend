using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Teams;

namespace LinkawyGenie.Common.Persistence;

public partial class ApplicationDbContext
{
    public DbSet<Conversation> Conversations => AggregateRootSet<Conversation>();
}
