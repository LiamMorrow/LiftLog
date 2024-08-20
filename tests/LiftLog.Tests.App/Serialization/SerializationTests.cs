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
    Describe("SessionHistoryDaoV1")
      .As(() =>
      {
        It("Serializes then deserializes to an equivalent object")
          .When(() =>
          {
            var session = Sessions.CreateSession();
            var sessionHistoryDao = SessionHistoryDaoV1.FromModel(
              new SessionHistoryDaoContainer(
                CompletedSessions: new Dictionary<Guid, Session>
                {
                  { session.Id, session },
                }.ToImmutableDictionary()
              )
            );

            var serialized = JsonSerializer.Serialize(
              sessionHistoryDao,
              StorageJsonContext.Context.SessionHistoryDaoV1
            );
            var deserialized = JsonSerializer.Deserialize(
              serialized,
              StorageJsonContext.Context.SessionHistoryDaoV1
            );

            deserialized!.Should().Be(sessionHistoryDao);
            deserialized!.ToModel().CompletedSessions.First().Value.Should().Be(session);
          });
      });

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
