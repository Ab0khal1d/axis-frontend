using LinkawyGenie.Common.Domain.Base.Interfaces;

namespace LinkawyGenie.Common.Domain.Conversations;

public sealed class ConversationTitle : IValueObject
{
    public string Value { get; }

    private ConversationTitle(string value) => Value = value;

    public static ConversationTitle Create(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);
        var trimmed = value.Trim();
        if (trimmed.Length > 100)
            trimmed = trimmed[..100];
        return new ConversationTitle(trimmed);
    }

    public override string ToString() => Value;
}


