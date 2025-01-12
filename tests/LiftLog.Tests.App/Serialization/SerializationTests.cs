using System.Text.Json;
using FluentAssertions;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.SessionHistoryDao;

namespace LiftLog.Tests.Serialization;

public class SerializationTests
{
  [Describe("Serialization")]
  public static void Spec()
  {
    Describe("SessionHistoryDaoV2")
      .As(() =>
      {
        It("Serializes then deserializes to an equivalent object")
          .When(() =>
          {
            var session = Sessions.CreateSession();
            var sessionHistoryDao = SessionHistoryDaoV2.FromModel(
              new SessionHistoryDaoContainer(
                CompletedSessions: new Dictionary<Guid, Session>
                {
                  { session.Id, session },
                }.ToImmutableDictionary()
              )
            );

            var serialized = sessionHistoryDao.ToByteArray();
            var deserialized = SessionHistoryDaoV2.Parser.ParseFrom(serialized);

            deserialized!.Should().Be(sessionHistoryDao);
            deserialized!.ToModel().CompletedSessions.First().Value.Should().Be(session);
          });
      });
  }
}
