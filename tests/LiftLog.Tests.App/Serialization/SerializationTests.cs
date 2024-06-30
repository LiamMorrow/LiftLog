using System.Text.Json;
using FluentAssertions;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.SessionHistoryDao;

namespace LiftLog.Tests.Serialization;

public class SerializationTests
{
    [Fact]
    public void SessionHistoryDaoV1_SerializeDeserialize_RoundTrip()
    {
        var session = Sessions.CreateSession();
        var sessionHistoryDao = SessionHistoryDaoV1.FromModel(
            new SessionHistoryDaoContainer(
                CompletedSessions: new Dictionary<Guid, Session>
                {
                    { session.Id, session }
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
    }

    [Fact]
    public void SessionHistoryDaoV2_SerializeDeserialize_RoundTrip()
    {
        var session = Sessions.CreateSession();
        var sessionHistoryDao = SessionHistoryDaoV2.FromModel(
            new SessionHistoryDaoContainer(
                CompletedSessions: new Dictionary<Guid, Session>
                {
                    { session.Id, session }
                }.ToImmutableDictionary()
            )
        );

        var serialized = sessionHistoryDao.ToByteArray();
        var deserialized = SessionHistoryDaoV2.Parser.ParseFrom(serialized);

        deserialized!.Should().Be(sessionHistoryDao);
        deserialized!.ToModel().CompletedSessions.First().Value.Should().Be(session);
    }
}
