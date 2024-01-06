using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class GetUsersRequestValidator : AbstractValidator<GetUsersRequest>
{
    public GetUsersRequestValidator()
    {
        RuleFor(x => x.Ids).NotEmpty();
        RuleFor(x => x.Ids.Length).InclusiveBetween(1, 200).When(x => x.Ids != null);
    }
}

public class DeleteUserRequestValidator : AbstractValidator<DeleteUserRequest>
{
    public DeleteUserRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class PutUserDataRequestValidator : AbstractValidator<PutUserDataRequest>
{
    const int KB = 1024;

    public PutUserDataRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
        RuleFor(x => x.EncryptedCurrentPlan!.Length)
            .InclusiveBetween(0, 2 * KB)
            .When(x => x.EncryptedCurrentPlan != null);
        RuleFor(x => x.EncryptedProfilePicture!.Length)
            .InclusiveBetween(0, 2000 * KB)
            .When(x => x.EncryptedProfilePicture != null);
        RuleFor(x => x.EncryptedName!.Length)
            .InclusiveBetween(0, 2 * KB)
            .When(x => x.EncryptedName != null);
    }
}

public class PutUserEventRequestValidator : AbstractValidator<PutUserEventRequest>
{
    const int KB = 1024;

    public PutUserEventRequestValidator()
    {
        RuleFor(x => x.Password).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.EncryptedEventPayload).NotEmpty();
        RuleFor(x => x.EncryptedEventPayload.Length)
            .InclusiveBetween(0, 5 * KB)
            .When(x => x.EncryptedEventPayload != null);
        RuleFor(x => x.Expiry).NotEmpty();
    }
}

public class GetEventsRequestValidator : AbstractValidator<GetEventsRequest>
{
    public GetEventsRequestValidator()
    {
        RuleFor(x => x.Users).NotEmpty();
        RuleFor(x => x.Users.Length).InclusiveBetween(1, 200).When(x => x.Users != null);
        RuleForEach(x => x.Users.Select(x => x.UserId)).NotEmpty();
        RuleForEach(x => x.Users.Select(x => x.FollowSecret)).NotEmpty();
    }
}

public class PutInboxMessageRequestValidator : AbstractValidator<PutInboxMessageRequest>
{
    const int KB = 1024;

    public PutInboxMessageRequestValidator()
    {
        RuleFor(x => x.ToUserId).NotEmpty();
        RuleFor(x => x.EncryptedMessage).NotEmpty();
        RuleFor(x => x.EncryptedMessage.Length)
            .InclusiveBetween(0, 5 * KB)
            .When(x => x.EncryptedMessage != null);
    }
}

public class GetInboxMessagesRequestValidator : AbstractValidator<GetInboxMessagesRequest>
{
    public GetInboxMessagesRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class PutUserFollowSecretRequestValidator : AbstractValidator<PutUserFollowSecretRequest>
{
    public PutUserFollowSecretRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FollowSecret).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class DeleteUserFollowSecretRequestValidator
    : AbstractValidator<DeleteUserFollowSecretRequest>
{
    public DeleteUserFollowSecretRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FollowSecret).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}
