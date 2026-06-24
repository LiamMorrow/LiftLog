package expo.modules.workoutworker.utils

import com.limajuice.liftlog.CardioExerciseBlueprint
import com.limajuice.liftlog.CardioTarget
import com.limajuice.liftlog.DistanceCardioTarget
import com.limajuice.liftlog.ExerciseBlueprint
import com.limajuice.liftlog.FinishWorkoutCommand
import com.limajuice.liftlog.IncreaseAllEvenlyProgressiveOverload
import com.limajuice.liftlog.IncreaseLowestSetProgressiveOverload
import com.limajuice.liftlog.NoProgressiveOverload
import com.limajuice.liftlog.ProgressiveOverload
import com.limajuice.liftlog.RecordedCardioExercise
import com.limajuice.liftlog.RecordedExercise
import com.limajuice.liftlog.RecordedWeightedExercise
import com.limajuice.liftlog.TimeCardioTarget
import com.limajuice.liftlog.WeightedExerciseBlueprint
import com.limajuice.liftlog.WorkoutEndedEvent
import com.limajuice.liftlog.WorkoutMessagePayload
import com.limajuice.liftlog.WorkoutStartedEvent
import com.limajuice.liftlog.WorkoutUpdatedEvent
import com.squareup.moshi.FromJson
import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.JsonReader
import com.squareup.moshi.JsonWriter
import com.squareup.moshi.Moshi
import com.squareup.moshi.ToJson
import com.squareup.moshi.adapter
import com.squareup.moshi.adapters.PolymorphicJsonAdapterFactory
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import java.math.BigDecimal
import kotlin.time.Duration
import kotlin.time.Instant

class DurationAdapter : JsonAdapter<Duration>() {
    @FromJson
    override fun fromJson(reader: JsonReader): Duration =
        Duration.parseIsoString(reader.nextString())

    @ToJson
    override fun toJson(writer: JsonWriter, value: Duration?) {
        writer.value(value?.toIsoString())
    }
}

class InstantAdapter : JsonAdapter<Instant>() {
    override fun fromJson(reader: JsonReader): Instant =
        Instant.parse(reader.nextString())

    override fun toJson(writer: JsonWriter, value: Instant?) {
        writer.value(value?.toString())
    }
}

class BigDecimalAdapter : JsonAdapter<BigDecimal>() {
    override fun fromJson(reader: JsonReader): BigDecimal =
        BigDecimal(reader.nextString())

    override fun toJson(writer: JsonWriter, value: BigDecimal?) {
        writer.value(value?.toString())
    }
}

object Json {
    val moshi: Moshi = Moshi.Builder()
        .add(
            PolymorphicJsonAdapterFactory.of(WorkoutMessagePayload::class.java, "type")
                .withSubtype(WorkoutStartedEvent::class.java, "WorkoutStartedEvent")
                .withSubtype(WorkoutUpdatedEvent::class.java, "WorkoutUpdatedEvent")
                .withSubtype(WorkoutEndedEvent::class.java, "WorkoutEndedEvent")
                .withSubtype(FinishWorkoutCommand::class.java, "FinishWorkoutCommand")
        )
        .add(
            PolymorphicJsonAdapterFactory.of(RecordedExercise::class.java, "type")
                .withSubtype(RecordedCardioExercise::class.java, "RecordedCardioExercise")
                .withSubtype(RecordedWeightedExercise::class.java, "RecordedWeightedExercise")
        )
        .add(
            PolymorphicJsonAdapterFactory.of(CardioTarget::class.java, "type")
                .withSubtype(DistanceCardioTarget::class.java, "distance")
                .withSubtype(TimeCardioTarget::class.java, "time")
        )
        .add(
            PolymorphicJsonAdapterFactory.of(ProgressiveOverload::class.java, "type")
                .withSubtype(NoProgressiveOverload::class.java, "NoProgressiveOverload")
                .withSubtype(IncreaseAllEvenlyProgressiveOverload::class.java, "IncreaseAllEvenlyProgressiveOverload")
                .withSubtype(IncreaseLowestSetProgressiveOverload::class.java, "IncreaseLowestSetProgressiveOverload")
        )
        .add(Duration::class.java, DurationAdapter())
        .add(Instant::class.java, InstantAdapter())
        .add(BigDecimal::class.java, BigDecimalAdapter())
        .addLast(KotlinJsonAdapterFactory())
        .build()

    @OptIn(ExperimentalStdlibApi::class)
    inline fun <reified T> decodeFromString(json: String): T {


        val jsonAdapter: JsonAdapter<T> = moshi.adapter<T>()

        return jsonAdapter.fromJson(json) as T
    }

    @OptIn(ExperimentalStdlibApi::class)
    inline fun <reified T> encodeToString(value: T): String {


        val jsonAdapter: JsonAdapter<T> = moshi.adapter<T>()

        return jsonAdapter.toJson(value)
    }
}
