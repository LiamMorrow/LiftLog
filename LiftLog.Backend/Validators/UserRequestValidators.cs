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
        RuleFor(x => x.UserIds).NotEmpty();
        RuleFor(x => x.UserIds.Length).InclusiveBetween(1, 200).When(x => x.UserIds != null);
        RuleForEach(x => x.UserIds).NotEmpty();
    }
}
