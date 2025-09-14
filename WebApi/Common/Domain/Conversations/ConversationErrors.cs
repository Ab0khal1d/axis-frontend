public class ConversationErrors
{
    public static readonly Error NotFound = Error.NotFound(
        "Conversation.NotFound",
        "Conversation is not found"
    );
    public static readonly Error CreateAtRequired = Error.Validation(
        "Conversation.CreateAtRequired",
        "Create at is required"
    );
}
