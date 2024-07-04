using System.Security.Cryptography.X509Certificates;
using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Controllers;

[ApiController]
public class SharedItemController(
    UserDataContext db,
    PasswordService passwordService,
    IdEncodingService idEncodingService
) : ControllerBase
{
    [Route("[controller]")]
    [HttpPost]
    public async Task<IActionResult> CreateShared(
        CreateSharedItemRequest request,
        [FromServices] IValidator<CreateSharedItemRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return Unauthorized();
        }

        if (!passwordService.VerifyPassword(request.Password, user.HashedPassword, user.Salt))
        {
            return Unauthorized();
        }

        var sharedItem = new SharedItem
        {
            UserId = request.UserId,
            EncryptedPayload = request.EncryptedPayload.EncryptedPayload,
            EncryptionIV = request.EncryptedPayload.IV.Value,
            Expiry = request.Expiry,
        };

        await db.SharedItems.AddAsync(sharedItem);
        await db.SaveChangesAsync();
        return Ok(new CreateSharedItemResponse(Id: idEncodingService.EncodeId(sharedItem.Id)));
    }

    [Route("[controller]/{id}")]
    [HttpGet]
    public async Task<IActionResult> GetSharedItem(string id)
    {
        if (!idEncodingService.TryDecodeId(id, out var idNumber))
        {
            return NotFound();
        }
        var sharedItem = await db
            .SharedItems.Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == idNumber);
        if (sharedItem == null)
        {
            return NotFound();
        }

        return Ok(
            new GetSharedItemResponse(
                RsaPublicKey: new Lib.Services.RsaPublicKey(sharedItem.User.RsaPublicKey),
                EncryptedPayload: new(
                    sharedItem.EncryptedPayload,
                    new AesIV(sharedItem.EncryptionIV)
                )
            )
        );
    }
}
