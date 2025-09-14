using LinkawyGenie.Common.Domain.Conversations;
using LinkawyGenie.Common.Domain.Users;

namespace LinkawyGenie.Common.Persistence;

public partial class ApplicationDbContext
{
    public DbSet<User> Users => AggregateRootSet<User>();
}
