import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace LiftLog. */
export namespace LiftLog {

    /** Namespace Ui. */
    namespace Ui {

        /** Namespace Models. */
        namespace Models {

            /** Namespace SessionHistoryDao. */
            namespace SessionHistoryDao {

                /** Properties of a SessionHistoryDaoV2. */
                interface ISessionHistoryDaoV2 {

                    /** SessionHistoryDaoV2 completedSessions */
                    completedSessions?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2[]|null);
                }

                /** Represents a SessionHistoryDaoV2. */
                class SessionHistoryDaoV2 implements ISessionHistoryDaoV2 {

                    /**
                     * Constructs a new SessionHistoryDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2);

                    /** SessionHistoryDaoV2 completedSessions. */
                    public completedSessions: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2[];

                    /**
                     * Creates a new SessionHistoryDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SessionHistoryDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2;

                    /**
                     * Encodes the specified SessionHistoryDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.verify|verify} messages.
                     * @param message SessionHistoryDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified SessionHistoryDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.verify|verify} messages.
                     * @param message SessionHistoryDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionHistoryDao.ISessionHistoryDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SessionHistoryDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SessionHistoryDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2;

                    /**
                     * Decodes a SessionHistoryDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SessionHistoryDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2;

                    /**
                     * Verifies a SessionHistoryDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SessionHistoryDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SessionHistoryDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2;

                    /**
                     * Creates a plain object from a SessionHistoryDaoV2 message. Also converts values to other types if specified.
                     * @param message SessionHistoryDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SessionHistoryDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for SessionHistoryDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a SessionDaoV2. */
                interface ISessionDaoV2 {

                    /** SessionDaoV2 id */
                    id?: (LiftLog.Ui.Models.IUuidDao|null);

                    /** SessionDaoV2 sessionName */
                    sessionName?: (string|null);

                    /** SessionDaoV2 recordedExercises */
                    recordedExercises?: (LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2[]|null);

                    /** SessionDaoV2 date */
                    date?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                    /** SessionDaoV2 bodyweightValue */
                    bodyweightValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** SessionDaoV2 bodyweightUnit */
                    bodyweightUnit?: (LiftLog.Ui.Models.WeightUnit|null);

                    /** SessionDaoV2 blueprintNotes */
                    blueprintNotes?: (string|null);
                }

                /** Represents a SessionDaoV2. */
                class SessionDaoV2 implements ISessionDaoV2 {

                    /**
                     * Constructs a new SessionDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2);

                    /** SessionDaoV2 id. */
                    public id?: (LiftLog.Ui.Models.IUuidDao|null);

                    /** SessionDaoV2 sessionName. */
                    public sessionName: string;

                    /** SessionDaoV2 recordedExercises. */
                    public recordedExercises: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2[];

                    /** SessionDaoV2 date. */
                    public date?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                    /** SessionDaoV2 bodyweightValue. */
                    public bodyweightValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** SessionDaoV2 bodyweightUnit. */
                    public bodyweightUnit: LiftLog.Ui.Models.WeightUnit;

                    /** SessionDaoV2 blueprintNotes. */
                    public blueprintNotes: string;

                    /** SessionDaoV2 _bodyweightValue. */
                    public _bodyweightValue?: "bodyweightValue";

                    /**
                     * Creates a new SessionDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SessionDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2;

                    /**
                     * Encodes the specified SessionDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify|verify} messages.
                     * @param message SessionDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified SessionDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2.verify|verify} messages.
                     * @param message SessionDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SessionDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SessionDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2;

                    /**
                     * Decodes a SessionDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SessionDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2;

                    /**
                     * Verifies a SessionDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SessionDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SessionDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2;

                    /**
                     * Creates a plain object from a SessionDaoV2 message. Also converts values to other types if specified.
                     * @param message SessionDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SessionDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for SessionDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RecordedExerciseDaoV2. */
                interface IRecordedExerciseDaoV2 {

                    /** RecordedExerciseDaoV2 exerciseBlueprint */
                    exerciseBlueprint?: (LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2|null);

                    /** RecordedExerciseDaoV2 type */
                    type?: (LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType|null);

                    /** RecordedExerciseDaoV2 notes */
                    notes?: (google.protobuf.IStringValue|null);

                    /** RecordedExerciseDaoV2 potentialSets */
                    potentialSets?: (LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2[]|null);

                    /** RecordedExerciseDaoV2 completionDateTime */
                    completionDateTime?: (LiftLog.Ui.Models.IDateTimeDao|null);

                    /** RecordedExerciseDaoV2 duration */
                    duration?: (google.protobuf.IDuration|null);

                    /** RecordedExerciseDaoV2 distanceValue */
                    distanceValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** RecordedExerciseDaoV2 distanceUnit */
                    distanceUnit?: (google.protobuf.IStringValue|null);

                    /** RecordedExerciseDaoV2 resistance */
                    resistance?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** RecordedExerciseDaoV2 incline */
                    incline?: (LiftLog.Ui.Models.IDecimalValue|null);
                }

                /** Represents a RecordedExerciseDaoV2. */
                class RecordedExerciseDaoV2 implements IRecordedExerciseDaoV2 {

                    /**
                     * Constructs a new RecordedExerciseDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2);

                    /** RecordedExerciseDaoV2 exerciseBlueprint. */
                    public exerciseBlueprint?: (LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2|null);

                    /** RecordedExerciseDaoV2 type. */
                    public type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType;

                    /** RecordedExerciseDaoV2 notes. */
                    public notes?: (google.protobuf.IStringValue|null);

                    /** RecordedExerciseDaoV2 potentialSets. */
                    public potentialSets: LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2[];

                    /** RecordedExerciseDaoV2 completionDateTime. */
                    public completionDateTime?: (LiftLog.Ui.Models.IDateTimeDao|null);

                    /** RecordedExerciseDaoV2 duration. */
                    public duration?: (google.protobuf.IDuration|null);

                    /** RecordedExerciseDaoV2 distanceValue. */
                    public distanceValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** RecordedExerciseDaoV2 distanceUnit. */
                    public distanceUnit?: (google.protobuf.IStringValue|null);

                    /** RecordedExerciseDaoV2 resistance. */
                    public resistance?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** RecordedExerciseDaoV2 incline. */
                    public incline?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** RecordedExerciseDaoV2 _notes. */
                    public _notes?: "notes";

                    /** RecordedExerciseDaoV2 _completionDateTime. */
                    public _completionDateTime?: "completionDateTime";

                    /** RecordedExerciseDaoV2 _duration. */
                    public _duration?: "duration";

                    /** RecordedExerciseDaoV2 _distanceValue. */
                    public _distanceValue?: "distanceValue";

                    /** RecordedExerciseDaoV2 _distanceUnit. */
                    public _distanceUnit?: "distanceUnit";

                    /** RecordedExerciseDaoV2 _resistance. */
                    public _resistance?: "resistance";

                    /** RecordedExerciseDaoV2 _incline. */
                    public _incline?: "incline";

                    /**
                     * Creates a new RecordedExerciseDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RecordedExerciseDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2;

                    /**
                     * Encodes the specified RecordedExerciseDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.verify|verify} messages.
                     * @param message RecordedExerciseDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RecordedExerciseDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2.verify|verify} messages.
                     * @param message RecordedExerciseDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RecordedExerciseDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RecordedExerciseDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2;

                    /**
                     * Decodes a RecordedExerciseDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RecordedExerciseDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2;

                    /**
                     * Verifies a RecordedExerciseDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RecordedExerciseDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RecordedExerciseDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2;

                    /**
                     * Creates a plain object from a RecordedExerciseDaoV2 message. Also converts values to other types if specified.
                     * @param message RecordedExerciseDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RecordedExerciseDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RecordedExerciseDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a PotentialSetDaoV2. */
                interface IPotentialSetDaoV2 {

                    /** PotentialSetDaoV2 recordedSet */
                    recordedSet?: (LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2|null);

                    /** PotentialSetDaoV2 weightValue */
                    weightValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** PotentialSetDaoV2 weightUnit */
                    weightUnit?: (LiftLog.Ui.Models.WeightUnit|null);
                }

                /** Represents a PotentialSetDaoV2. */
                class PotentialSetDaoV2 implements IPotentialSetDaoV2 {

                    /**
                     * Constructs a new PotentialSetDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2);

                    /** PotentialSetDaoV2 recordedSet. */
                    public recordedSet?: (LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2|null);

                    /** PotentialSetDaoV2 weightValue. */
                    public weightValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** PotentialSetDaoV2 weightUnit. */
                    public weightUnit: LiftLog.Ui.Models.WeightUnit;

                    /** PotentialSetDaoV2 _recordedSet. */
                    public _recordedSet?: "recordedSet";

                    /**
                     * Creates a new PotentialSetDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns PotentialSetDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2;

                    /**
                     * Encodes the specified PotentialSetDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.verify|verify} messages.
                     * @param message PotentialSetDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified PotentialSetDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2.verify|verify} messages.
                     * @param message PotentialSetDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a PotentialSetDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns PotentialSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2;

                    /**
                     * Decodes a PotentialSetDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns PotentialSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2;

                    /**
                     * Verifies a PotentialSetDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a PotentialSetDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns PotentialSetDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2;

                    /**
                     * Creates a plain object from a PotentialSetDaoV2 message. Also converts values to other types if specified.
                     * @param message PotentialSetDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this PotentialSetDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for PotentialSetDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RecordedSetDaoV2. */
                interface IRecordedSetDaoV2 {

                    /** RecordedSetDaoV2 repsCompleted */
                    repsCompleted?: (number|null);

                    /** RecordedSetDaoV2 completionTime */
                    completionTime?: (LiftLog.Ui.Models.ITimeOnlyDao|null);

                    /** RecordedSetDaoV2 completionDate */
                    completionDate?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                    /** RecordedSetDaoV2 completionOffset */
                    completionOffset?: (LiftLog.Ui.Models.IZoneOffsetDao|null);
                }

                /** Represents a RecordedSetDaoV2. */
                class RecordedSetDaoV2 implements IRecordedSetDaoV2 {

                    /**
                     * Constructs a new RecordedSetDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2);

                    /** RecordedSetDaoV2 repsCompleted. */
                    public repsCompleted: number;

                    /** RecordedSetDaoV2 completionTime. */
                    public completionTime?: (LiftLog.Ui.Models.ITimeOnlyDao|null);

                    /** RecordedSetDaoV2 completionDate. */
                    public completionDate?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                    /** RecordedSetDaoV2 completionOffset. */
                    public completionOffset?: (LiftLog.Ui.Models.IZoneOffsetDao|null);

                    /** RecordedSetDaoV2 _completionDate. */
                    public _completionDate?: "completionDate";

                    /** RecordedSetDaoV2 _completionOffset. */
                    public _completionOffset?: "completionOffset";

                    /**
                     * Creates a new RecordedSetDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RecordedSetDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2;

                    /**
                     * Encodes the specified RecordedSetDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.verify|verify} messages.
                     * @param message RecordedSetDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RecordedSetDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2.verify|verify} messages.
                     * @param message RecordedSetDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RecordedSetDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RecordedSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2;

                    /**
                     * Decodes a RecordedSetDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RecordedSetDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2;

                    /**
                     * Verifies a RecordedSetDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RecordedSetDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RecordedSetDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2;

                    /**
                     * Creates a plain object from a RecordedSetDaoV2 message. Also converts values to other types if specified.
                     * @param message RecordedSetDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RecordedSetDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RecordedSetDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Namespace SessionBlueprintDao. */
            namespace SessionBlueprintDao {

                /** Properties of a SessionBlueprintContainerDaoV2. */
                interface ISessionBlueprintContainerDaoV2 {

                    /** SessionBlueprintContainerDaoV2 sessionBlueprints */
                    sessionBlueprints?: (LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[]|null);
                }

                /** Represents a SessionBlueprintContainerDaoV2. */
                class SessionBlueprintContainerDaoV2 implements ISessionBlueprintContainerDaoV2 {

                    /**
                     * Constructs a new SessionBlueprintContainerDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2);

                    /** SessionBlueprintContainerDaoV2 sessionBlueprints. */
                    public sessionBlueprints: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[];

                    /**
                     * Creates a new SessionBlueprintContainerDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SessionBlueprintContainerDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2;

                    /**
                     * Encodes the specified SessionBlueprintContainerDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.verify|verify} messages.
                     * @param message SessionBlueprintContainerDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified SessionBlueprintContainerDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2.verify|verify} messages.
                     * @param message SessionBlueprintContainerDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintContainerDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SessionBlueprintContainerDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SessionBlueprintContainerDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2;

                    /**
                     * Decodes a SessionBlueprintContainerDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SessionBlueprintContainerDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2;

                    /**
                     * Verifies a SessionBlueprintContainerDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SessionBlueprintContainerDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SessionBlueprintContainerDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2;

                    /**
                     * Creates a plain object from a SessionBlueprintContainerDaoV2 message. Also converts values to other types if specified.
                     * @param message SessionBlueprintContainerDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintContainerDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SessionBlueprintContainerDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for SessionBlueprintContainerDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a SessionBlueprintDaoV2. */
                interface ISessionBlueprintDaoV2 {

                    /** SessionBlueprintDaoV2 name */
                    name?: (string|null);

                    /** SessionBlueprintDaoV2 exerciseBlueprints */
                    exerciseBlueprints?: (LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2[]|null);

                    /** SessionBlueprintDaoV2 notes */
                    notes?: (string|null);
                }

                /** Represents a SessionBlueprintDaoV2. */
                class SessionBlueprintDaoV2 implements ISessionBlueprintDaoV2 {

                    /**
                     * Constructs a new SessionBlueprintDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2);

                    /** SessionBlueprintDaoV2 name. */
                    public name: string;

                    /** SessionBlueprintDaoV2 exerciseBlueprints. */
                    public exerciseBlueprints: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2[];

                    /** SessionBlueprintDaoV2 notes. */
                    public notes: string;

                    /**
                     * Creates a new SessionBlueprintDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SessionBlueprintDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2;

                    /**
                     * Encodes the specified SessionBlueprintDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify|verify} messages.
                     * @param message SessionBlueprintDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified SessionBlueprintDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2.verify|verify} messages.
                     * @param message SessionBlueprintDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SessionBlueprintDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SessionBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2;

                    /**
                     * Decodes a SessionBlueprintDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SessionBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2;

                    /**
                     * Verifies a SessionBlueprintDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SessionBlueprintDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SessionBlueprintDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2;

                    /**
                     * Creates a plain object from a SessionBlueprintDaoV2 message. Also converts values to other types if specified.
                     * @param message SessionBlueprintDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SessionBlueprintDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for SessionBlueprintDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** ExerciseType enum. */
                enum ExerciseType {
                    WEIGHTED = 0,
                    CARDIO = 1
                }

                /** Properties of a CardioTarget. */
                interface ICardioTarget {

                    /** CardioTarget type */
                    type?: (string|null);

                    /** CardioTarget timeValue */
                    timeValue?: (google.protobuf.IDuration|null);

                    /** CardioTarget distanceValue */
                    distanceValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** CardioTarget distanceUnit */
                    distanceUnit?: (string|null);
                }

                /** Represents a CardioTarget. */
                class CardioTarget implements ICardioTarget {

                    /**
                     * Constructs a new CardioTarget.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget);

                    /** CardioTarget type. */
                    public type: string;

                    /** CardioTarget timeValue. */
                    public timeValue?: (google.protobuf.IDuration|null);

                    /** CardioTarget distanceValue. */
                    public distanceValue?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** CardioTarget distanceUnit. */
                    public distanceUnit?: (string|null);

                    /** CardioTarget _distanceUnit. */
                    public _distanceUnit?: "distanceUnit";

                    /**
                     * Creates a new CardioTarget instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CardioTarget instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget): LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget;

                    /**
                     * Encodes the specified CardioTarget message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget.verify|verify} messages.
                     * @param message CardioTarget message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CardioTarget message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget.verify|verify} messages.
                     * @param message CardioTarget message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CardioTarget message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CardioTarget
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget;

                    /**
                     * Decodes a CardioTarget message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CardioTarget
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget;

                    /**
                     * Verifies a CardioTarget message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CardioTarget message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CardioTarget
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget;

                    /**
                     * Creates a plain object from a CardioTarget message. Also converts values to other types if specified.
                     * @param message CardioTarget
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CardioTarget to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CardioTarget
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an ExerciseBlueprintDaoV2. */
                interface IExerciseBlueprintDaoV2 {

                    /** ExerciseBlueprintDaoV2 name */
                    name?: (string|null);

                    /** ExerciseBlueprintDaoV2 notes */
                    notes?: (string|null);

                    /** ExerciseBlueprintDaoV2 link */
                    link?: (string|null);

                    /** ExerciseBlueprintDaoV2 type */
                    type?: (LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType|null);

                    /** ExerciseBlueprintDaoV2 sets */
                    sets?: (number|null);

                    /** ExerciseBlueprintDaoV2 repsPerSet */
                    repsPerSet?: (number|null);

                    /** ExerciseBlueprintDaoV2 weightIncreaseOnSuccess */
                    weightIncreaseOnSuccess?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** ExerciseBlueprintDaoV2 restBetweenSets */
                    restBetweenSets?: (LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2|null);

                    /** ExerciseBlueprintDaoV2 supersetWithNext */
                    supersetWithNext?: (boolean|null);

                    /** ExerciseBlueprintDaoV2 cardioTarget */
                    cardioTarget?: (LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget|null);

                    /** ExerciseBlueprintDaoV2 trackDuration */
                    trackDuration?: (boolean|null);

                    /** ExerciseBlueprintDaoV2 trackDistance */
                    trackDistance?: (boolean|null);

                    /** ExerciseBlueprintDaoV2 trackResistance */
                    trackResistance?: (boolean|null);

                    /** ExerciseBlueprintDaoV2 trackIncline */
                    trackIncline?: (boolean|null);
                }

                /** Represents an ExerciseBlueprintDaoV2. */
                class ExerciseBlueprintDaoV2 implements IExerciseBlueprintDaoV2 {

                    /**
                     * Constructs a new ExerciseBlueprintDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2);

                    /** ExerciseBlueprintDaoV2 name. */
                    public name: string;

                    /** ExerciseBlueprintDaoV2 notes. */
                    public notes: string;

                    /** ExerciseBlueprintDaoV2 link. */
                    public link: string;

                    /** ExerciseBlueprintDaoV2 type. */
                    public type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType;

                    /** ExerciseBlueprintDaoV2 sets. */
                    public sets: number;

                    /** ExerciseBlueprintDaoV2 repsPerSet. */
                    public repsPerSet: number;

                    /** ExerciseBlueprintDaoV2 weightIncreaseOnSuccess. */
                    public weightIncreaseOnSuccess?: (LiftLog.Ui.Models.IDecimalValue|null);

                    /** ExerciseBlueprintDaoV2 restBetweenSets. */
                    public restBetweenSets?: (LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2|null);

                    /** ExerciseBlueprintDaoV2 supersetWithNext. */
                    public supersetWithNext: boolean;

                    /** ExerciseBlueprintDaoV2 cardioTarget. */
                    public cardioTarget?: (LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget|null);

                    /** ExerciseBlueprintDaoV2 trackDuration. */
                    public trackDuration: boolean;

                    /** ExerciseBlueprintDaoV2 trackDistance. */
                    public trackDistance: boolean;

                    /** ExerciseBlueprintDaoV2 trackResistance. */
                    public trackResistance: boolean;

                    /** ExerciseBlueprintDaoV2 trackIncline. */
                    public trackIncline: boolean;

                    /**
                     * Creates a new ExerciseBlueprintDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ExerciseBlueprintDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2): LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2;

                    /**
                     * Encodes the specified ExerciseBlueprintDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify|verify} messages.
                     * @param message ExerciseBlueprintDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ExerciseBlueprintDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2.verify|verify} messages.
                     * @param message ExerciseBlueprintDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an ExerciseBlueprintDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ExerciseBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2;

                    /**
                     * Decodes an ExerciseBlueprintDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ExerciseBlueprintDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2;

                    /**
                     * Verifies an ExerciseBlueprintDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an ExerciseBlueprintDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ExerciseBlueprintDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2;

                    /**
                     * Creates a plain object from an ExerciseBlueprintDaoV2 message. Also converts values to other types if specified.
                     * @param message ExerciseBlueprintDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ExerciseBlueprintDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ExerciseBlueprintDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RestDaoV2. */
                interface IRestDaoV2 {

                    /** RestDaoV2 minRest */
                    minRest?: (google.protobuf.IDuration|null);

                    /** RestDaoV2 maxRest */
                    maxRest?: (google.protobuf.IDuration|null);

                    /** RestDaoV2 failureRest */
                    failureRest?: (google.protobuf.IDuration|null);
                }

                /** Represents a RestDaoV2. */
                class RestDaoV2 implements IRestDaoV2 {

                    /**
                     * Constructs a new RestDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2);

                    /** RestDaoV2 minRest. */
                    public minRest?: (google.protobuf.IDuration|null);

                    /** RestDaoV2 maxRest. */
                    public maxRest?: (google.protobuf.IDuration|null);

                    /** RestDaoV2 failureRest. */
                    public failureRest?: (google.protobuf.IDuration|null);

                    /**
                     * Creates a new RestDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RestDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2;

                    /**
                     * Encodes the specified RestDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.verify|verify} messages.
                     * @param message RestDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RestDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2.verify|verify} messages.
                     * @param message RestDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RestDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RestDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2;

                    /**
                     * Decodes a RestDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RestDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2;

                    /**
                     * Verifies a RestDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RestDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RestDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2;

                    /**
                     * Creates a plain object from a RestDaoV2 message. Also converts values to other types if specified.
                     * @param message RestDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RestDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RestDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Properties of an UuidDao. */
            interface IUuidDao {

                /** UuidDao value */
                value?: (Uint8Array|null);
            }

            /** Represents an UuidDao. */
            class UuidDao implements IUuidDao {

                /**
                 * Constructs a new UuidDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IUuidDao);

                /** UuidDao value. */
                public value: Uint8Array;

                /**
                 * Creates a new UuidDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UuidDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IUuidDao): LiftLog.Ui.Models.UuidDao;

                /**
                 * Encodes the specified UuidDao message. Does not implicitly {@link LiftLog.Ui.Models.UuidDao.verify|verify} messages.
                 * @param message UuidDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IUuidDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UuidDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UuidDao.verify|verify} messages.
                 * @param message UuidDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IUuidDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UuidDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UuidDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.UuidDao;

                /**
                 * Decodes an UuidDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UuidDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.UuidDao;

                /**
                 * Verifies an UuidDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UuidDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UuidDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.UuidDao;

                /**
                 * Creates a plain object from an UuidDao message. Also converts values to other types if specified.
                 * @param message UuidDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.UuidDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UuidDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UuidDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DateOnlyDao. */
            interface IDateOnlyDao {

                /** DateOnlyDao year */
                year?: (number|null);

                /** DateOnlyDao month */
                month?: (number|null);

                /** DateOnlyDao day */
                day?: (number|null);
            }

            /** Represents a DateOnlyDao. */
            class DateOnlyDao implements IDateOnlyDao {

                /**
                 * Constructs a new DateOnlyDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IDateOnlyDao);

                /** DateOnlyDao year. */
                public year: number;

                /** DateOnlyDao month. */
                public month: number;

                /** DateOnlyDao day. */
                public day: number;

                /**
                 * Creates a new DateOnlyDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DateOnlyDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IDateOnlyDao): LiftLog.Ui.Models.DateOnlyDao;

                /**
                 * Encodes the specified DateOnlyDao message. Does not implicitly {@link LiftLog.Ui.Models.DateOnlyDao.verify|verify} messages.
                 * @param message DateOnlyDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IDateOnlyDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DateOnlyDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.DateOnlyDao.verify|verify} messages.
                 * @param message DateOnlyDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IDateOnlyDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DateOnlyDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DateOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.DateOnlyDao;

                /**
                 * Decodes a DateOnlyDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DateOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.DateOnlyDao;

                /**
                 * Verifies a DateOnlyDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DateOnlyDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DateOnlyDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.DateOnlyDao;

                /**
                 * Creates a plain object from a DateOnlyDao message. Also converts values to other types if specified.
                 * @param message DateOnlyDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.DateOnlyDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DateOnlyDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DateOnlyDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DecimalValue. */
            interface IDecimalValue {

                /** DecimalValue units */
                units?: (Long|null);

                /** DecimalValue nanos */
                nanos?: (number|null);
            }

            /** Represents a DecimalValue. */
            class DecimalValue implements IDecimalValue {

                /**
                 * Constructs a new DecimalValue.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IDecimalValue);

                /** DecimalValue units. */
                public units: Long;

                /** DecimalValue nanos. */
                public nanos: number;

                /**
                 * Creates a new DecimalValue instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DecimalValue instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IDecimalValue): LiftLog.Ui.Models.DecimalValue;

                /**
                 * Encodes the specified DecimalValue message. Does not implicitly {@link LiftLog.Ui.Models.DecimalValue.verify|verify} messages.
                 * @param message DecimalValue message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IDecimalValue, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DecimalValue message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.DecimalValue.verify|verify} messages.
                 * @param message DecimalValue message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IDecimalValue, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DecimalValue message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DecimalValue
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.DecimalValue;

                /**
                 * Decodes a DecimalValue message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DecimalValue
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.DecimalValue;

                /**
                 * Verifies a DecimalValue message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DecimalValue message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DecimalValue
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.DecimalValue;

                /**
                 * Creates a plain object from a DecimalValue message. Also converts values to other types if specified.
                 * @param message DecimalValue
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.DecimalValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DecimalValue to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DecimalValue
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a TimeOnlyDao. */
            interface ITimeOnlyDao {

                /** TimeOnlyDao hour */
                hour?: (number|null);

                /** TimeOnlyDao minute */
                minute?: (number|null);

                /** TimeOnlyDao second */
                second?: (number|null);

                /** TimeOnlyDao millisecond */
                millisecond?: (number|null);

                /** TimeOnlyDao microsecond */
                microsecond?: (number|null);
            }

            /** Represents a TimeOnlyDao. */
            class TimeOnlyDao implements ITimeOnlyDao {

                /**
                 * Constructs a new TimeOnlyDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.ITimeOnlyDao);

                /** TimeOnlyDao hour. */
                public hour: number;

                /** TimeOnlyDao minute. */
                public minute: number;

                /** TimeOnlyDao second. */
                public second: number;

                /** TimeOnlyDao millisecond. */
                public millisecond: number;

                /** TimeOnlyDao microsecond. */
                public microsecond: number;

                /**
                 * Creates a new TimeOnlyDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TimeOnlyDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.ITimeOnlyDao): LiftLog.Ui.Models.TimeOnlyDao;

                /**
                 * Encodes the specified TimeOnlyDao message. Does not implicitly {@link LiftLog.Ui.Models.TimeOnlyDao.verify|verify} messages.
                 * @param message TimeOnlyDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.ITimeOnlyDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TimeOnlyDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.TimeOnlyDao.verify|verify} messages.
                 * @param message TimeOnlyDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.ITimeOnlyDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TimeOnlyDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TimeOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.TimeOnlyDao;

                /**
                 * Decodes a TimeOnlyDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TimeOnlyDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.TimeOnlyDao;

                /**
                 * Verifies a TimeOnlyDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TimeOnlyDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TimeOnlyDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.TimeOnlyDao;

                /**
                 * Creates a plain object from a TimeOnlyDao message. Also converts values to other types if specified.
                 * @param message TimeOnlyDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.TimeOnlyDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TimeOnlyDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TimeOnlyDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DateTimeDao. */
            interface IDateTimeDao {

                /** DateTimeDao date */
                date?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                /** DateTimeDao time */
                time?: (LiftLog.Ui.Models.ITimeOnlyDao|null);

                /** DateTimeDao offset */
                offset?: (LiftLog.Ui.Models.IZoneOffsetDao|null);
            }

            /** Represents a DateTimeDao. */
            class DateTimeDao implements IDateTimeDao {

                /**
                 * Constructs a new DateTimeDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IDateTimeDao);

                /** DateTimeDao date. */
                public date?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                /** DateTimeDao time. */
                public time?: (LiftLog.Ui.Models.ITimeOnlyDao|null);

                /** DateTimeDao offset. */
                public offset?: (LiftLog.Ui.Models.IZoneOffsetDao|null);

                /** DateTimeDao _offset. */
                public _offset?: "offset";

                /**
                 * Creates a new DateTimeDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DateTimeDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IDateTimeDao): LiftLog.Ui.Models.DateTimeDao;

                /**
                 * Encodes the specified DateTimeDao message. Does not implicitly {@link LiftLog.Ui.Models.DateTimeDao.verify|verify} messages.
                 * @param message DateTimeDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IDateTimeDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DateTimeDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.DateTimeDao.verify|verify} messages.
                 * @param message DateTimeDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IDateTimeDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DateTimeDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DateTimeDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.DateTimeDao;

                /**
                 * Decodes a DateTimeDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DateTimeDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.DateTimeDao;

                /**
                 * Verifies a DateTimeDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DateTimeDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DateTimeDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.DateTimeDao;

                /**
                 * Creates a plain object from a DateTimeDao message. Also converts values to other types if specified.
                 * @param message DateTimeDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.DateTimeDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DateTimeDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DateTimeDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ZoneOffsetDao. */
            interface IZoneOffsetDao {

                /** ZoneOffsetDao totalSeconds */
                totalSeconds?: (number|null);
            }

            /** Represents a ZoneOffsetDao. */
            class ZoneOffsetDao implements IZoneOffsetDao {

                /**
                 * Constructs a new ZoneOffsetDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IZoneOffsetDao);

                /** ZoneOffsetDao totalSeconds. */
                public totalSeconds: number;

                /**
                 * Creates a new ZoneOffsetDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ZoneOffsetDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IZoneOffsetDao): LiftLog.Ui.Models.ZoneOffsetDao;

                /**
                 * Encodes the specified ZoneOffsetDao message. Does not implicitly {@link LiftLog.Ui.Models.ZoneOffsetDao.verify|verify} messages.
                 * @param message ZoneOffsetDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IZoneOffsetDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ZoneOffsetDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ZoneOffsetDao.verify|verify} messages.
                 * @param message ZoneOffsetDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IZoneOffsetDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ZoneOffsetDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ZoneOffsetDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.ZoneOffsetDao;

                /**
                 * Decodes a ZoneOffsetDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ZoneOffsetDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.ZoneOffsetDao;

                /**
                 * Verifies a ZoneOffsetDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ZoneOffsetDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ZoneOffsetDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.ZoneOffsetDao;

                /**
                 * Creates a plain object from a ZoneOffsetDao message. Also converts values to other types if specified.
                 * @param message ZoneOffsetDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.ZoneOffsetDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ZoneOffsetDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ZoneOffsetDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** WeightUnit enum. */
            enum WeightUnit {
                NIL = 0,
                KILOGRAMS = 1,
                POUNDS = 2
            }

            /** Properties of a Weight. */
            interface IWeight {

                /** Weight value */
                value?: (LiftLog.Ui.Models.IDecimalValue|null);

                /** Weight unit */
                unit?: (LiftLog.Ui.Models.WeightUnit|null);
            }

            /** Represents a Weight. */
            class Weight implements IWeight {

                /**
                 * Constructs a new Weight.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IWeight);

                /** Weight value. */
                public value?: (LiftLog.Ui.Models.IDecimalValue|null);

                /** Weight unit. */
                public unit: LiftLog.Ui.Models.WeightUnit;

                /**
                 * Creates a new Weight instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Weight instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IWeight): LiftLog.Ui.Models.Weight;

                /**
                 * Encodes the specified Weight message. Does not implicitly {@link LiftLog.Ui.Models.Weight.verify|verify} messages.
                 * @param message Weight message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IWeight, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Weight message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.Weight.verify|verify} messages.
                 * @param message Weight message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IWeight, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Weight message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Weight
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.Weight;

                /**
                 * Decodes a Weight message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Weight
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.Weight;

                /**
                 * Verifies a Weight message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Weight message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Weight
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.Weight;

                /**
                 * Creates a plain object from a Weight message. Also converts values to other types if specified.
                 * @param message Weight
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.Weight, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Weight to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Weight
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a UserEventPayload. */
            interface IUserEventPayload {

                /** UserEventPayload sessionPayload */
                sessionPayload?: (LiftLog.Ui.Models.ISessionUserEvent|null);

                /** UserEventPayload removedSessionPayload */
                removedSessionPayload?: (LiftLog.Ui.Models.IRemovedSessionUserEvent|null);
            }

            /** Represents a UserEventPayload. */
            class UserEventPayload implements IUserEventPayload {

                /**
                 * Constructs a new UserEventPayload.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IUserEventPayload);

                /** UserEventPayload sessionPayload. */
                public sessionPayload?: (LiftLog.Ui.Models.ISessionUserEvent|null);

                /** UserEventPayload removedSessionPayload. */
                public removedSessionPayload?: (LiftLog.Ui.Models.IRemovedSessionUserEvent|null);

                /** UserEventPayload eventPayload. */
                public eventPayload?: ("sessionPayload"|"removedSessionPayload");

                /**
                 * Creates a new UserEventPayload instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UserEventPayload instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IUserEventPayload): LiftLog.Ui.Models.UserEventPayload;

                /**
                 * Encodes the specified UserEventPayload message. Does not implicitly {@link LiftLog.Ui.Models.UserEventPayload.verify|verify} messages.
                 * @param message UserEventPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IUserEventPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UserEventPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UserEventPayload.verify|verify} messages.
                 * @param message UserEventPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IUserEventPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a UserEventPayload message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UserEventPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.UserEventPayload;

                /**
                 * Decodes a UserEventPayload message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UserEventPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.UserEventPayload;

                /**
                 * Verifies a UserEventPayload message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a UserEventPayload message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UserEventPayload
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.UserEventPayload;

                /**
                 * Creates a plain object from a UserEventPayload message. Also converts values to other types if specified.
                 * @param message UserEventPayload
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.UserEventPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UserEventPayload to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UserEventPayload
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a SessionUserEvent. */
            interface ISessionUserEvent {

                /** SessionUserEvent session */
                session?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);
            }

            /** Represents a SessionUserEvent. */
            class SessionUserEvent implements ISessionUserEvent {

                /**
                 * Constructs a new SessionUserEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.ISessionUserEvent);

                /** SessionUserEvent session. */
                public session?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                /**
                 * Creates a new SessionUserEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SessionUserEvent instance
                 */
                public static create(properties?: LiftLog.Ui.Models.ISessionUserEvent): LiftLog.Ui.Models.SessionUserEvent;

                /**
                 * Encodes the specified SessionUserEvent message. Does not implicitly {@link LiftLog.Ui.Models.SessionUserEvent.verify|verify} messages.
                 * @param message SessionUserEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.ISessionUserEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SessionUserEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SessionUserEvent.verify|verify} messages.
                 * @param message SessionUserEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.ISessionUserEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SessionUserEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SessionUserEvent;

                /**
                 * Decodes a SessionUserEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SessionUserEvent;

                /**
                 * Verifies a SessionUserEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SessionUserEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SessionUserEvent
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SessionUserEvent;

                /**
                 * Creates a plain object from a SessionUserEvent message. Also converts values to other types if specified.
                 * @param message SessionUserEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.SessionUserEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SessionUserEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SessionUserEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RemovedSessionUserEvent. */
            interface IRemovedSessionUserEvent {

                /** RemovedSessionUserEvent sessionId */
                sessionId?: (LiftLog.Ui.Models.IUuidDao|null);
            }

            /** Represents a RemovedSessionUserEvent. */
            class RemovedSessionUserEvent implements IRemovedSessionUserEvent {

                /**
                 * Constructs a new RemovedSessionUserEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IRemovedSessionUserEvent);

                /** RemovedSessionUserEvent sessionId. */
                public sessionId?: (LiftLog.Ui.Models.IUuidDao|null);

                /**
                 * Creates a new RemovedSessionUserEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RemovedSessionUserEvent instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IRemovedSessionUserEvent): LiftLog.Ui.Models.RemovedSessionUserEvent;

                /**
                 * Encodes the specified RemovedSessionUserEvent message. Does not implicitly {@link LiftLog.Ui.Models.RemovedSessionUserEvent.verify|verify} messages.
                 * @param message RemovedSessionUserEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IRemovedSessionUserEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RemovedSessionUserEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.RemovedSessionUserEvent.verify|verify} messages.
                 * @param message RemovedSessionUserEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IRemovedSessionUserEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RemovedSessionUserEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RemovedSessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.RemovedSessionUserEvent;

                /**
                 * Decodes a RemovedSessionUserEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RemovedSessionUserEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.RemovedSessionUserEvent;

                /**
                 * Verifies a RemovedSessionUserEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RemovedSessionUserEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RemovedSessionUserEvent
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.RemovedSessionUserEvent;

                /**
                 * Creates a plain object from a RemovedSessionUserEvent message. Also converts values to other types if specified.
                 * @param message RemovedSessionUserEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.RemovedSessionUserEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RemovedSessionUserEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RemovedSessionUserEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an InboxMessageDao. */
            interface IInboxMessageDao {

                /** InboxMessageDao fromUserId */
                fromUserId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** InboxMessageDao followRequest */
                followRequest?: (LiftLog.Ui.Models.IFollowRequestDao|null);

                /** InboxMessageDao followResponse */
                followResponse?: (LiftLog.Ui.Models.IFollowResponseDao|null);

                /** InboxMessageDao unfollowNotification */
                unfollowNotification?: (LiftLog.Ui.Models.IUnFollowNotification|null);

                /** InboxMessageDao signature */
                signature?: (Uint8Array|null);
            }

            /** Represents an InboxMessageDao. */
            class InboxMessageDao implements IInboxMessageDao {

                /**
                 * Constructs a new InboxMessageDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IInboxMessageDao);

                /** InboxMessageDao fromUserId. */
                public fromUserId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** InboxMessageDao followRequest. */
                public followRequest?: (LiftLog.Ui.Models.IFollowRequestDao|null);

                /** InboxMessageDao followResponse. */
                public followResponse?: (LiftLog.Ui.Models.IFollowResponseDao|null);

                /** InboxMessageDao unfollowNotification. */
                public unfollowNotification?: (LiftLog.Ui.Models.IUnFollowNotification|null);

                /** InboxMessageDao signature. */
                public signature: Uint8Array;

                /** InboxMessageDao messagePayload. */
                public messagePayload?: ("followRequest"|"followResponse"|"unfollowNotification");

                /**
                 * Creates a new InboxMessageDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InboxMessageDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IInboxMessageDao): LiftLog.Ui.Models.InboxMessageDao;

                /**
                 * Encodes the specified InboxMessageDao message. Does not implicitly {@link LiftLog.Ui.Models.InboxMessageDao.verify|verify} messages.
                 * @param message InboxMessageDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IInboxMessageDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InboxMessageDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.InboxMessageDao.verify|verify} messages.
                 * @param message InboxMessageDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IInboxMessageDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InboxMessageDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InboxMessageDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.InboxMessageDao;

                /**
                 * Decodes an InboxMessageDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InboxMessageDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.InboxMessageDao;

                /**
                 * Verifies an InboxMessageDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InboxMessageDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InboxMessageDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.InboxMessageDao;

                /**
                 * Creates a plain object from an InboxMessageDao message. Also converts values to other types if specified.
                 * @param message InboxMessageDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.InboxMessageDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InboxMessageDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for InboxMessageDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FollowRequestDao. */
            interface IFollowRequestDao {

                /** FollowRequestDao name */
                name?: (google.protobuf.IStringValue|null);
            }

            /** Represents a FollowRequestDao. */
            class FollowRequestDao implements IFollowRequestDao {

                /**
                 * Constructs a new FollowRequestDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFollowRequestDao);

                /** FollowRequestDao name. */
                public name?: (google.protobuf.IStringValue|null);

                /** FollowRequestDao _name. */
                public _name?: "name";

                /**
                 * Creates a new FollowRequestDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FollowRequestDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFollowRequestDao): LiftLog.Ui.Models.FollowRequestDao;

                /**
                 * Encodes the specified FollowRequestDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowRequestDao.verify|verify} messages.
                 * @param message FollowRequestDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFollowRequestDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FollowRequestDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowRequestDao.verify|verify} messages.
                 * @param message FollowRequestDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFollowRequestDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FollowRequestDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FollowRequestDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FollowRequestDao;

                /**
                 * Decodes a FollowRequestDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FollowRequestDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FollowRequestDao;

                /**
                 * Verifies a FollowRequestDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FollowRequestDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FollowRequestDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FollowRequestDao;

                /**
                 * Creates a plain object from a FollowRequestDao message. Also converts values to other types if specified.
                 * @param message FollowRequestDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FollowRequestDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FollowRequestDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FollowRequestDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FollowResponseDao. */
            interface IFollowResponseDao {

                /** FollowResponseDao accepted */
                accepted?: (LiftLog.Ui.Models.IFollowResponseAcceptedDao|null);

                /** FollowResponseDao rejected */
                rejected?: (LiftLog.Ui.Models.IFollowResponseRejectedDao|null);
            }

            /** Represents a FollowResponseDao. */
            class FollowResponseDao implements IFollowResponseDao {

                /**
                 * Constructs a new FollowResponseDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFollowResponseDao);

                /** FollowResponseDao accepted. */
                public accepted?: (LiftLog.Ui.Models.IFollowResponseAcceptedDao|null);

                /** FollowResponseDao rejected. */
                public rejected?: (LiftLog.Ui.Models.IFollowResponseRejectedDao|null);

                /** FollowResponseDao responsePayload. */
                public responsePayload?: ("accepted"|"rejected");

                /**
                 * Creates a new FollowResponseDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FollowResponseDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFollowResponseDao): LiftLog.Ui.Models.FollowResponseDao;

                /**
                 * Encodes the specified FollowResponseDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseDao.verify|verify} messages.
                 * @param message FollowResponseDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFollowResponseDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FollowResponseDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseDao.verify|verify} messages.
                 * @param message FollowResponseDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFollowResponseDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FollowResponseDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FollowResponseDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FollowResponseDao;

                /**
                 * Decodes a FollowResponseDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FollowResponseDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FollowResponseDao;

                /**
                 * Verifies a FollowResponseDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FollowResponseDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FollowResponseDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FollowResponseDao;

                /**
                 * Creates a plain object from a FollowResponseDao message. Also converts values to other types if specified.
                 * @param message FollowResponseDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FollowResponseDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FollowResponseDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FollowResponseDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FollowResponseAcceptedDao. */
            interface IFollowResponseAcceptedDao {

                /** FollowResponseAcceptedDao aesKey */
                aesKey?: (Uint8Array|null);

                /** FollowResponseAcceptedDao followSecret */
                followSecret?: (string|null);
            }

            /** Represents a FollowResponseAcceptedDao. */
            class FollowResponseAcceptedDao implements IFollowResponseAcceptedDao {

                /**
                 * Constructs a new FollowResponseAcceptedDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFollowResponseAcceptedDao);

                /** FollowResponseAcceptedDao aesKey. */
                public aesKey: Uint8Array;

                /** FollowResponseAcceptedDao followSecret. */
                public followSecret: string;

                /**
                 * Creates a new FollowResponseAcceptedDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FollowResponseAcceptedDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFollowResponseAcceptedDao): LiftLog.Ui.Models.FollowResponseAcceptedDao;

                /**
                 * Encodes the specified FollowResponseAcceptedDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseAcceptedDao.verify|verify} messages.
                 * @param message FollowResponseAcceptedDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFollowResponseAcceptedDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FollowResponseAcceptedDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseAcceptedDao.verify|verify} messages.
                 * @param message FollowResponseAcceptedDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFollowResponseAcceptedDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FollowResponseAcceptedDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FollowResponseAcceptedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FollowResponseAcceptedDao;

                /**
                 * Decodes a FollowResponseAcceptedDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FollowResponseAcceptedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FollowResponseAcceptedDao;

                /**
                 * Verifies a FollowResponseAcceptedDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FollowResponseAcceptedDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FollowResponseAcceptedDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FollowResponseAcceptedDao;

                /**
                 * Creates a plain object from a FollowResponseAcceptedDao message. Also converts values to other types if specified.
                 * @param message FollowResponseAcceptedDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FollowResponseAcceptedDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FollowResponseAcceptedDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FollowResponseAcceptedDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FollowResponseRejectedDao. */
            interface IFollowResponseRejectedDao {
            }

            /** Represents a FollowResponseRejectedDao. */
            class FollowResponseRejectedDao implements IFollowResponseRejectedDao {

                /**
                 * Constructs a new FollowResponseRejectedDao.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFollowResponseRejectedDao);

                /**
                 * Creates a new FollowResponseRejectedDao instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FollowResponseRejectedDao instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFollowResponseRejectedDao): LiftLog.Ui.Models.FollowResponseRejectedDao;

                /**
                 * Encodes the specified FollowResponseRejectedDao message. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseRejectedDao.verify|verify} messages.
                 * @param message FollowResponseRejectedDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFollowResponseRejectedDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FollowResponseRejectedDao message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FollowResponseRejectedDao.verify|verify} messages.
                 * @param message FollowResponseRejectedDao message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFollowResponseRejectedDao, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FollowResponseRejectedDao message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FollowResponseRejectedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FollowResponseRejectedDao;

                /**
                 * Decodes a FollowResponseRejectedDao message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FollowResponseRejectedDao
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FollowResponseRejectedDao;

                /**
                 * Verifies a FollowResponseRejectedDao message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FollowResponseRejectedDao message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FollowResponseRejectedDao
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FollowResponseRejectedDao;

                /**
                 * Creates a plain object from a FollowResponseRejectedDao message. Also converts values to other types if specified.
                 * @param message FollowResponseRejectedDao
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FollowResponseRejectedDao, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FollowResponseRejectedDao to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FollowResponseRejectedDao
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an UnFollowNotification. */
            interface IUnFollowNotification {

                /** UnFollowNotification followSecret */
                followSecret?: (string|null);
            }

            /** Represents an UnFollowNotification. */
            class UnFollowNotification implements IUnFollowNotification {

                /**
                 * Constructs a new UnFollowNotification.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IUnFollowNotification);

                /** UnFollowNotification followSecret. */
                public followSecret: string;

                /**
                 * Creates a new UnFollowNotification instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UnFollowNotification instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IUnFollowNotification): LiftLog.Ui.Models.UnFollowNotification;

                /**
                 * Encodes the specified UnFollowNotification message. Does not implicitly {@link LiftLog.Ui.Models.UnFollowNotification.verify|verify} messages.
                 * @param message UnFollowNotification message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IUnFollowNotification, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnFollowNotification message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.UnFollowNotification.verify|verify} messages.
                 * @param message UnFollowNotification message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IUnFollowNotification, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UnFollowNotification message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UnFollowNotification
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.UnFollowNotification;

                /**
                 * Decodes an UnFollowNotification message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UnFollowNotification
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.UnFollowNotification;

                /**
                 * Verifies an UnFollowNotification message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UnFollowNotification message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnFollowNotification
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.UnFollowNotification;

                /**
                 * Creates a plain object from an UnFollowNotification message. Also converts values to other types if specified.
                 * @param message UnFollowNotification
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.UnFollowNotification, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnFollowNotification to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UnFollowNotification
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Namespace CurrentSessionStateDao. */
            namespace CurrentSessionStateDao {

                /** Properties of a CurrentSessionStateDaoV2. */
                interface ICurrentSessionStateDaoV2 {

                    /** CurrentSessionStateDaoV2 workoutSession */
                    workoutSession?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                    /** CurrentSessionStateDaoV2 historySession */
                    historySession?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);
                }

                /** Represents a CurrentSessionStateDaoV2. */
                class CurrentSessionStateDaoV2 implements ICurrentSessionStateDaoV2 {

                    /**
                     * Constructs a new CurrentSessionStateDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2);

                    /** CurrentSessionStateDaoV2 workoutSession. */
                    public workoutSession?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                    /** CurrentSessionStateDaoV2 historySession. */
                    public historySession?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                    /** CurrentSessionStateDaoV2 _workoutSession. */
                    public _workoutSession?: "workoutSession";

                    /** CurrentSessionStateDaoV2 _historySession. */
                    public _historySession?: "historySession";

                    /**
                     * Creates a new CurrentSessionStateDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CurrentSessionStateDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2;

                    /**
                     * Encodes the specified CurrentSessionStateDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.verify|verify} messages.
                     * @param message CurrentSessionStateDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CurrentSessionStateDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.verify|verify} messages.
                     * @param message CurrentSessionStateDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CurrentSessionStateDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CurrentSessionStateDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2;

                    /**
                     * Decodes a CurrentSessionStateDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CurrentSessionStateDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2;

                    /**
                     * Verifies a CurrentSessionStateDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CurrentSessionStateDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CurrentSessionStateDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2;

                    /**
                     * Creates a plain object from a CurrentSessionStateDaoV2 message. Also converts values to other types if specified.
                     * @param message CurrentSessionStateDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CurrentSessionStateDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CurrentSessionStateDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Properties of a SharedItemPayload. */
            interface ISharedItemPayload {

                /** SharedItemPayload sharedProgramBlueprint */
                sharedProgramBlueprint?: (LiftLog.Ui.Models.ISharedProgramBlueprintPayload|null);
            }

            /** Represents a SharedItemPayload. */
            class SharedItemPayload implements ISharedItemPayload {

                /**
                 * Constructs a new SharedItemPayload.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.ISharedItemPayload);

                /** SharedItemPayload sharedProgramBlueprint. */
                public sharedProgramBlueprint?: (LiftLog.Ui.Models.ISharedProgramBlueprintPayload|null);

                /** SharedItemPayload payload. */
                public payload?: "sharedProgramBlueprint";

                /**
                 * Creates a new SharedItemPayload instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SharedItemPayload instance
                 */
                public static create(properties?: LiftLog.Ui.Models.ISharedItemPayload): LiftLog.Ui.Models.SharedItemPayload;

                /**
                 * Encodes the specified SharedItemPayload message. Does not implicitly {@link LiftLog.Ui.Models.SharedItemPayload.verify|verify} messages.
                 * @param message SharedItemPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.ISharedItemPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SharedItemPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SharedItemPayload.verify|verify} messages.
                 * @param message SharedItemPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.ISharedItemPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SharedItemPayload message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SharedItemPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SharedItemPayload;

                /**
                 * Decodes a SharedItemPayload message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SharedItemPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SharedItemPayload;

                /**
                 * Verifies a SharedItemPayload message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SharedItemPayload message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SharedItemPayload
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SharedItemPayload;

                /**
                 * Creates a plain object from a SharedItemPayload message. Also converts values to other types if specified.
                 * @param message SharedItemPayload
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.SharedItemPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SharedItemPayload to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SharedItemPayload
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a SharedProgramBlueprintPayload. */
            interface ISharedProgramBlueprintPayload {

                /** SharedProgramBlueprintPayload programBlueprint */
                programBlueprint?: (LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1|null);
            }

            /** Represents a SharedProgramBlueprintPayload. */
            class SharedProgramBlueprintPayload implements ISharedProgramBlueprintPayload {

                /**
                 * Constructs a new SharedProgramBlueprintPayload.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.ISharedProgramBlueprintPayload);

                /** SharedProgramBlueprintPayload programBlueprint. */
                public programBlueprint?: (LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1|null);

                /**
                 * Creates a new SharedProgramBlueprintPayload instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SharedProgramBlueprintPayload instance
                 */
                public static create(properties?: LiftLog.Ui.Models.ISharedProgramBlueprintPayload): LiftLog.Ui.Models.SharedProgramBlueprintPayload;

                /**
                 * Encodes the specified SharedProgramBlueprintPayload message. Does not implicitly {@link LiftLog.Ui.Models.SharedProgramBlueprintPayload.verify|verify} messages.
                 * @param message SharedProgramBlueprintPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.ISharedProgramBlueprintPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SharedProgramBlueprintPayload message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.SharedProgramBlueprintPayload.verify|verify} messages.
                 * @param message SharedProgramBlueprintPayload message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.ISharedProgramBlueprintPayload, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SharedProgramBlueprintPayload message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SharedProgramBlueprintPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.SharedProgramBlueprintPayload;

                /**
                 * Decodes a SharedProgramBlueprintPayload message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SharedProgramBlueprintPayload
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.SharedProgramBlueprintPayload;

                /**
                 * Verifies a SharedProgramBlueprintPayload message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SharedProgramBlueprintPayload message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SharedProgramBlueprintPayload
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.SharedProgramBlueprintPayload;

                /**
                 * Creates a plain object from a SharedProgramBlueprintPayload message. Also converts values to other types if specified.
                 * @param message SharedProgramBlueprintPayload
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.SharedProgramBlueprintPayload, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SharedProgramBlueprintPayload to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SharedProgramBlueprintPayload
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Namespace ProgramBlueprintDao. */
            namespace ProgramBlueprintDao {

                /** Properties of a ProgramBlueprintDaoContainerV1. */
                interface IProgramBlueprintDaoContainerV1 {

                    /** ProgramBlueprintDaoContainerV1 programBlueprints */
                    programBlueprints?: ({ [k: string]: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1 }|null);

                    /** ProgramBlueprintDaoContainerV1 activeProgramId */
                    activeProgramId?: (google.protobuf.IStringValue|null);
                }

                /** Represents a ProgramBlueprintDaoContainerV1. */
                class ProgramBlueprintDaoContainerV1 implements IProgramBlueprintDaoContainerV1 {

                    /**
                     * Constructs a new ProgramBlueprintDaoContainerV1.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1);

                    /** ProgramBlueprintDaoContainerV1 programBlueprints. */
                    public programBlueprints: { [k: string]: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1 };

                    /** ProgramBlueprintDaoContainerV1 activeProgramId. */
                    public activeProgramId?: (google.protobuf.IStringValue|null);

                    /** ProgramBlueprintDaoContainerV1 _activeProgramId. */
                    public _activeProgramId?: "activeProgramId";

                    /**
                     * Creates a new ProgramBlueprintDaoContainerV1 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ProgramBlueprintDaoContainerV1 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1;

                    /**
                     * Encodes the specified ProgramBlueprintDaoContainerV1 message. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.verify|verify} messages.
                     * @param message ProgramBlueprintDaoContainerV1 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ProgramBlueprintDaoContainerV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.verify|verify} messages.
                     * @param message ProgramBlueprintDaoContainerV1 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoContainerV1, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ProgramBlueprintDaoContainerV1 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ProgramBlueprintDaoContainerV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1;

                    /**
                     * Decodes a ProgramBlueprintDaoContainerV1 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ProgramBlueprintDaoContainerV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1;

                    /**
                     * Verifies a ProgramBlueprintDaoContainerV1 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ProgramBlueprintDaoContainerV1 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ProgramBlueprintDaoContainerV1
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1;

                    /**
                     * Creates a plain object from a ProgramBlueprintDaoContainerV1 message. Also converts values to other types if specified.
                     * @param message ProgramBlueprintDaoContainerV1
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ProgramBlueprintDaoContainerV1 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ProgramBlueprintDaoContainerV1
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ProgramBlueprintDaoV1. */
                interface IProgramBlueprintDaoV1 {

                    /** ProgramBlueprintDaoV1 name */
                    name?: (string|null);

                    /** ProgramBlueprintDaoV1 sessions */
                    sessions?: (LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[]|null);

                    /** ProgramBlueprintDaoV1 lastEdited */
                    lastEdited?: (LiftLog.Ui.Models.IDateOnlyDao|null);
                }

                /** Represents a ProgramBlueprintDaoV1. */
                class ProgramBlueprintDaoV1 implements IProgramBlueprintDaoV1 {

                    /**
                     * Constructs a new ProgramBlueprintDaoV1.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1);

                    /** ProgramBlueprintDaoV1 name. */
                    public name: string;

                    /** ProgramBlueprintDaoV1 sessions. */
                    public sessions: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[];

                    /** ProgramBlueprintDaoV1 lastEdited. */
                    public lastEdited?: (LiftLog.Ui.Models.IDateOnlyDao|null);

                    /** ProgramBlueprintDaoV1 _lastEdited. */
                    public _lastEdited?: "lastEdited";

                    /**
                     * Creates a new ProgramBlueprintDaoV1 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ProgramBlueprintDaoV1 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1;

                    /**
                     * Encodes the specified ProgramBlueprintDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify|verify} messages.
                     * @param message ProgramBlueprintDaoV1 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ProgramBlueprintDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1.verify|verify} messages.
                     * @param message ProgramBlueprintDaoV1 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ProgramBlueprintDaoV1 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ProgramBlueprintDaoV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1;

                    /**
                     * Decodes a ProgramBlueprintDaoV1 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ProgramBlueprintDaoV1
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1;

                    /**
                     * Verifies a ProgramBlueprintDaoV1 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ProgramBlueprintDaoV1 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ProgramBlueprintDaoV1
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1;

                    /**
                     * Creates a plain object from a ProgramBlueprintDaoV1 message. Also converts values to other types if specified.
                     * @param message ProgramBlueprintDaoV1
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ProgramBlueprintDaoV1 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ProgramBlueprintDaoV1
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Namespace ExportedDataDao. */
            namespace ExportedDataDao {

                /** Properties of an ExportedDataDaoV2. */
                interface IExportedDataDaoV2 {

                    /** ExportedDataDaoV2 sessions */
                    sessions?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2[]|null);

                    /** ExportedDataDaoV2 program */
                    program?: (LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[]|null);

                    /** ExportedDataDaoV2 savedPrograms */
                    savedPrograms?: ({ [k: string]: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1 }|null);

                    /** ExportedDataDaoV2 activeProgramId */
                    activeProgramId?: (google.protobuf.IStringValue|null);

                    /** ExportedDataDaoV2 feedState */
                    feedState?: (LiftLog.Ui.Models.IFeedStateDaoV1|null);
                }

                /** Represents an ExportedDataDaoV2. */
                class ExportedDataDaoV2 implements IExportedDataDaoV2 {

                    /**
                     * Constructs a new ExportedDataDaoV2.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2);

                    /** ExportedDataDaoV2 sessions. */
                    public sessions: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2[];

                    /** ExportedDataDaoV2 program. */
                    public program: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[];

                    /** ExportedDataDaoV2 savedPrograms. */
                    public savedPrograms: { [k: string]: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1 };

                    /** ExportedDataDaoV2 activeProgramId. */
                    public activeProgramId?: (google.protobuf.IStringValue|null);

                    /** ExportedDataDaoV2 feedState. */
                    public feedState?: (LiftLog.Ui.Models.IFeedStateDaoV1|null);

                    /**
                     * Creates a new ExportedDataDaoV2 instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ExportedDataDaoV2 instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;

                    /**
                     * Encodes the specified ExportedDataDaoV2 message. Does not implicitly {@link LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.verify|verify} messages.
                     * @param message ExportedDataDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ExportedDataDaoV2 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2.verify|verify} messages.
                     * @param message ExportedDataDaoV2 message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.ExportedDataDao.IExportedDataDaoV2, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an ExportedDataDaoV2 message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ExportedDataDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;

                    /**
                     * Decodes an ExportedDataDaoV2 message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ExportedDataDaoV2
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;

                    /**
                     * Verifies an ExportedDataDaoV2 message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an ExportedDataDaoV2 message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ExportedDataDaoV2
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;

                    /**
                     * Creates a plain object from an ExportedDataDaoV2 message. Also converts values to other types if specified.
                     * @param message ExportedDataDaoV2
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ExportedDataDaoV2 to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ExportedDataDaoV2
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Properties of a FeedIdentityDaoV1. */
            interface IFeedIdentityDaoV1 {

                /** FeedIdentityDaoV1 id */
                id?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedIdentityDaoV1 lookup */
                lookup?: (google.protobuf.IStringValue|null);

                /** FeedIdentityDaoV1 aesKey */
                aesKey?: (Uint8Array|null);

                /** FeedIdentityDaoV1 publicKey */
                publicKey?: (Uint8Array|null);

                /** FeedIdentityDaoV1 privateKey */
                privateKey?: (Uint8Array|null);

                /** FeedIdentityDaoV1 password */
                password?: (string|null);

                /** FeedIdentityDaoV1 name */
                name?: (google.protobuf.IStringValue|null);

                /** FeedIdentityDaoV1 profilePicture */
                profilePicture?: (Uint8Array|null);

                /** FeedIdentityDaoV1 publishBodyweight */
                publishBodyweight?: (boolean|null);

                /** FeedIdentityDaoV1 publishPlan */
                publishPlan?: (boolean|null);

                /** FeedIdentityDaoV1 publishWorkouts */
                publishWorkouts?: (boolean|null);
            }

            /** Represents a FeedIdentityDaoV1. */
            class FeedIdentityDaoV1 implements IFeedIdentityDaoV1 {

                /**
                 * Constructs a new FeedIdentityDaoV1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFeedIdentityDaoV1);

                /** FeedIdentityDaoV1 id. */
                public id?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedIdentityDaoV1 lookup. */
                public lookup?: (google.protobuf.IStringValue|null);

                /** FeedIdentityDaoV1 aesKey. */
                public aesKey: Uint8Array;

                /** FeedIdentityDaoV1 publicKey. */
                public publicKey: Uint8Array;

                /** FeedIdentityDaoV1 privateKey. */
                public privateKey: Uint8Array;

                /** FeedIdentityDaoV1 password. */
                public password: string;

                /** FeedIdentityDaoV1 name. */
                public name?: (google.protobuf.IStringValue|null);

                /** FeedIdentityDaoV1 profilePicture. */
                public profilePicture?: (Uint8Array|null);

                /** FeedIdentityDaoV1 publishBodyweight. */
                public publishBodyweight: boolean;

                /** FeedIdentityDaoV1 publishPlan. */
                public publishPlan: boolean;

                /** FeedIdentityDaoV1 publishWorkouts. */
                public publishWorkouts: boolean;

                /** FeedIdentityDaoV1 _name. */
                public _name?: "name";

                /** FeedIdentityDaoV1 _profilePicture. */
                public _profilePicture?: "profilePicture";

                /**
                 * Creates a new FeedIdentityDaoV1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FeedIdentityDaoV1 instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFeedIdentityDaoV1): LiftLog.Ui.Models.FeedIdentityDaoV1;

                /**
                 * Encodes the specified FeedIdentityDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedIdentityDaoV1.verify|verify} messages.
                 * @param message FeedIdentityDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFeedIdentityDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FeedIdentityDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedIdentityDaoV1.verify|verify} messages.
                 * @param message FeedIdentityDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFeedIdentityDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FeedIdentityDaoV1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FeedIdentityDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FeedIdentityDaoV1;

                /**
                 * Decodes a FeedIdentityDaoV1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FeedIdentityDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FeedIdentityDaoV1;

                /**
                 * Verifies a FeedIdentityDaoV1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FeedIdentityDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FeedIdentityDaoV1
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FeedIdentityDaoV1;

                /**
                 * Creates a plain object from a FeedIdentityDaoV1 message. Also converts values to other types if specified.
                 * @param message FeedIdentityDaoV1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FeedIdentityDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FeedIdentityDaoV1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FeedIdentityDaoV1
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FeedUserDaoV1. */
            interface IFeedUserDaoV1 {

                /** FeedUserDaoV1 id */
                id?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedUserDaoV1 lookup */
                lookup?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 publicKey */
                publicKey?: (Uint8Array|null);

                /** FeedUserDaoV1 name */
                name?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 nickname */
                nickname?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 currentPlan */
                currentPlan?: (LiftLog.Ui.Models.ICurrentPlanDaoV1|null);

                /** FeedUserDaoV1 profilePicture */
                profilePicture?: (Uint8Array|null);

                /** FeedUserDaoV1 aesKey */
                aesKey?: (Uint8Array|null);

                /** FeedUserDaoV1 followSecret */
                followSecret?: (google.protobuf.IStringValue|null);
            }

            /** Represents a FeedUserDaoV1. */
            class FeedUserDaoV1 implements IFeedUserDaoV1 {

                /**
                 * Constructs a new FeedUserDaoV1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFeedUserDaoV1);

                /** FeedUserDaoV1 id. */
                public id?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedUserDaoV1 lookup. */
                public lookup?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 publicKey. */
                public publicKey: Uint8Array;

                /** FeedUserDaoV1 name. */
                public name?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 nickname. */
                public nickname?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 currentPlan. */
                public currentPlan?: (LiftLog.Ui.Models.ICurrentPlanDaoV1|null);

                /** FeedUserDaoV1 profilePicture. */
                public profilePicture?: (Uint8Array|null);

                /** FeedUserDaoV1 aesKey. */
                public aesKey?: (Uint8Array|null);

                /** FeedUserDaoV1 followSecret. */
                public followSecret?: (google.protobuf.IStringValue|null);

                /** FeedUserDaoV1 _name. */
                public _name?: "name";

                /** FeedUserDaoV1 _nickname. */
                public _nickname?: "nickname";

                /** FeedUserDaoV1 _currentPlan. */
                public _currentPlan?: "currentPlan";

                /** FeedUserDaoV1 _profilePicture. */
                public _profilePicture?: "profilePicture";

                /** FeedUserDaoV1 _aesKey. */
                public _aesKey?: "aesKey";

                /** FeedUserDaoV1 _followSecret. */
                public _followSecret?: "followSecret";

                /**
                 * Creates a new FeedUserDaoV1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FeedUserDaoV1 instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFeedUserDaoV1): LiftLog.Ui.Models.FeedUserDaoV1;

                /**
                 * Encodes the specified FeedUserDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedUserDaoV1.verify|verify} messages.
                 * @param message FeedUserDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFeedUserDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FeedUserDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedUserDaoV1.verify|verify} messages.
                 * @param message FeedUserDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFeedUserDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FeedUserDaoV1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FeedUserDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FeedUserDaoV1;

                /**
                 * Decodes a FeedUserDaoV1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FeedUserDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FeedUserDaoV1;

                /**
                 * Verifies a FeedUserDaoV1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FeedUserDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FeedUserDaoV1
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FeedUserDaoV1;

                /**
                 * Creates a plain object from a FeedUserDaoV1 message. Also converts values to other types if specified.
                 * @param message FeedUserDaoV1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FeedUserDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FeedUserDaoV1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FeedUserDaoV1
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CurrentPlanDaoV1. */
            interface ICurrentPlanDaoV1 {

                /** CurrentPlanDaoV1 sessions */
                sessions?: (LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[]|null);
            }

            /** Represents a CurrentPlanDaoV1. */
            class CurrentPlanDaoV1 implements ICurrentPlanDaoV1 {

                /**
                 * Constructs a new CurrentPlanDaoV1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.ICurrentPlanDaoV1);

                /** CurrentPlanDaoV1 sessions. */
                public sessions: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2[];

                /**
                 * Creates a new CurrentPlanDaoV1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CurrentPlanDaoV1 instance
                 */
                public static create(properties?: LiftLog.Ui.Models.ICurrentPlanDaoV1): LiftLog.Ui.Models.CurrentPlanDaoV1;

                /**
                 * Encodes the specified CurrentPlanDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.CurrentPlanDaoV1.verify|verify} messages.
                 * @param message CurrentPlanDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.ICurrentPlanDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CurrentPlanDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.CurrentPlanDaoV1.verify|verify} messages.
                 * @param message CurrentPlanDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.ICurrentPlanDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CurrentPlanDaoV1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CurrentPlanDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.CurrentPlanDaoV1;

                /**
                 * Decodes a CurrentPlanDaoV1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CurrentPlanDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.CurrentPlanDaoV1;

                /**
                 * Verifies a CurrentPlanDaoV1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CurrentPlanDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CurrentPlanDaoV1
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.CurrentPlanDaoV1;

                /**
                 * Creates a plain object from a CurrentPlanDaoV1 message. Also converts values to other types if specified.
                 * @param message CurrentPlanDaoV1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.CurrentPlanDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CurrentPlanDaoV1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CurrentPlanDaoV1
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FeedItemDaoV1. */
            interface IFeedItemDaoV1 {

                /** FeedItemDaoV1 userId */
                userId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedItemDaoV1 eventId */
                eventId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedItemDaoV1 timestamp */
                timestamp?: (google.protobuf.ITimestamp|null);

                /** FeedItemDaoV1 expiry */
                expiry?: (google.protobuf.ITimestamp|null);

                /** FeedItemDaoV1 session */
                session?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);
            }

            /** Represents a FeedItemDaoV1. */
            class FeedItemDaoV1 implements IFeedItemDaoV1 {

                /**
                 * Constructs a new FeedItemDaoV1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFeedItemDaoV1);

                /** FeedItemDaoV1 userId. */
                public userId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedItemDaoV1 eventId. */
                public eventId?: (LiftLog.Ui.Models.IUuidDao|null);

                /** FeedItemDaoV1 timestamp. */
                public timestamp?: (google.protobuf.ITimestamp|null);

                /** FeedItemDaoV1 expiry. */
                public expiry?: (google.protobuf.ITimestamp|null);

                /** FeedItemDaoV1 session. */
                public session?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                /** FeedItemDaoV1 payload. */
                public payload?: "session";

                /**
                 * Creates a new FeedItemDaoV1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FeedItemDaoV1 instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFeedItemDaoV1): LiftLog.Ui.Models.FeedItemDaoV1;

                /**
                 * Encodes the specified FeedItemDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedItemDaoV1.verify|verify} messages.
                 * @param message FeedItemDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFeedItemDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FeedItemDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedItemDaoV1.verify|verify} messages.
                 * @param message FeedItemDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFeedItemDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FeedItemDaoV1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FeedItemDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FeedItemDaoV1;

                /**
                 * Decodes a FeedItemDaoV1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FeedItemDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FeedItemDaoV1;

                /**
                 * Verifies a FeedItemDaoV1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FeedItemDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FeedItemDaoV1
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FeedItemDaoV1;

                /**
                 * Creates a plain object from a FeedItemDaoV1 message. Also converts values to other types if specified.
                 * @param message FeedItemDaoV1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FeedItemDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FeedItemDaoV1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FeedItemDaoV1
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FeedStateDaoV1. */
            interface IFeedStateDaoV1 {

                /** FeedStateDaoV1 feedItems */
                feedItems?: (LiftLog.Ui.Models.IFeedItemDaoV1[]|null);

                /** FeedStateDaoV1 followedUsers */
                followedUsers?: (LiftLog.Ui.Models.IFeedUserDaoV1[]|null);

                /** FeedStateDaoV1 identity */
                identity?: (LiftLog.Ui.Models.IFeedIdentityDaoV1|null);

                /** FeedStateDaoV1 followRequests */
                followRequests?: (LiftLog.Ui.Models.IInboxMessageDao[]|null);

                /** FeedStateDaoV1 followers */
                followers?: (LiftLog.Ui.Models.IFeedUserDaoV1[]|null);

                /** FeedStateDaoV1 unpublishedSessionIds */
                unpublishedSessionIds?: (LiftLog.Ui.Models.IUuidDao[]|null);

                /** FeedStateDaoV1 revokedFollowSecrets */
                revokedFollowSecrets?: (string[]|null);
            }

            /** Represents a FeedStateDaoV1. */
            class FeedStateDaoV1 implements IFeedStateDaoV1 {

                /**
                 * Constructs a new FeedStateDaoV1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: LiftLog.Ui.Models.IFeedStateDaoV1);

                /** FeedStateDaoV1 feedItems. */
                public feedItems: LiftLog.Ui.Models.IFeedItemDaoV1[];

                /** FeedStateDaoV1 followedUsers. */
                public followedUsers: LiftLog.Ui.Models.IFeedUserDaoV1[];

                /** FeedStateDaoV1 identity. */
                public identity?: (LiftLog.Ui.Models.IFeedIdentityDaoV1|null);

                /** FeedStateDaoV1 followRequests. */
                public followRequests: LiftLog.Ui.Models.IInboxMessageDao[];

                /** FeedStateDaoV1 followers. */
                public followers: LiftLog.Ui.Models.IFeedUserDaoV1[];

                /** FeedStateDaoV1 unpublishedSessionIds. */
                public unpublishedSessionIds: LiftLog.Ui.Models.IUuidDao[];

                /** FeedStateDaoV1 revokedFollowSecrets. */
                public revokedFollowSecrets: string[];

                /** FeedStateDaoV1 _identity. */
                public _identity?: "identity";

                /**
                 * Creates a new FeedStateDaoV1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FeedStateDaoV1 instance
                 */
                public static create(properties?: LiftLog.Ui.Models.IFeedStateDaoV1): LiftLog.Ui.Models.FeedStateDaoV1;

                /**
                 * Encodes the specified FeedStateDaoV1 message. Does not implicitly {@link LiftLog.Ui.Models.FeedStateDaoV1.verify|verify} messages.
                 * @param message FeedStateDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: LiftLog.Ui.Models.IFeedStateDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FeedStateDaoV1 message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.FeedStateDaoV1.verify|verify} messages.
                 * @param message FeedStateDaoV1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: LiftLog.Ui.Models.IFeedStateDaoV1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FeedStateDaoV1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FeedStateDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.FeedStateDaoV1;

                /**
                 * Decodes a FeedStateDaoV1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FeedStateDaoV1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.FeedStateDaoV1;

                /**
                 * Verifies a FeedStateDaoV1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FeedStateDaoV1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FeedStateDaoV1
                 */
                public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.FeedStateDaoV1;

                /**
                 * Creates a plain object from a FeedStateDaoV1 message. Also converts values to other types if specified.
                 * @param message FeedStateDaoV1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: LiftLog.Ui.Models.FeedStateDaoV1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FeedStateDaoV1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FeedStateDaoV1
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Namespace WorkoutMessage. */
            namespace WorkoutMessage {

                /** Properties of a WorkoutMessage. */
                interface IWorkoutMessage {

                    /** WorkoutMessage translations */
                    translations?: (LiftLog.Ui.Models.WorkoutMessage.ITranslations|null);

                    /** WorkoutMessage appConfiguration */
                    appConfiguration?: (LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration|null);

                    /** WorkoutMessage workoutStartedEvent */
                    workoutStartedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent|null);

                    /** WorkoutMessage workoutUpdatedEvent */
                    workoutUpdatedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent|null);

                    /** WorkoutMessage workoutEndedEvent */
                    workoutEndedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent|null);

                    /** WorkoutMessage finishWorkoutCommand */
                    finishWorkoutCommand?: (LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand|null);
                }

                /** Represents a WorkoutMessage. */
                class WorkoutMessage implements IWorkoutMessage {

                    /**
                     * Constructs a new WorkoutMessage.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage);

                    /** WorkoutMessage translations. */
                    public translations?: (LiftLog.Ui.Models.WorkoutMessage.ITranslations|null);

                    /** WorkoutMessage appConfiguration. */
                    public appConfiguration?: (LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration|null);

                    /** WorkoutMessage workoutStartedEvent. */
                    public workoutStartedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent|null);

                    /** WorkoutMessage workoutUpdatedEvent. */
                    public workoutUpdatedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent|null);

                    /** WorkoutMessage workoutEndedEvent. */
                    public workoutEndedEvent?: (LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent|null);

                    /** WorkoutMessage finishWorkoutCommand. */
                    public finishWorkoutCommand?: (LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand|null);

                    /** WorkoutMessage payload. */
                    public payload?: ("workoutStartedEvent"|"workoutUpdatedEvent"|"workoutEndedEvent"|"finishWorkoutCommand");

                    /**
                     * Creates a new WorkoutMessage instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns WorkoutMessage instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage): LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage;

                    /**
                     * Encodes the specified WorkoutMessage message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage.verify|verify} messages.
                     * @param message WorkoutMessage message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified WorkoutMessage message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage.verify|verify} messages.
                     * @param message WorkoutMessage message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a WorkoutMessage message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns WorkoutMessage
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage;

                    /**
                     * Decodes a WorkoutMessage message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns WorkoutMessage
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage;

                    /**
                     * Verifies a WorkoutMessage message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a WorkoutMessage message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns WorkoutMessage
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage;

                    /**
                     * Creates a plain object from a WorkoutMessage message. Also converts values to other types if specified.
                     * @param message WorkoutMessage
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this WorkoutMessage to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for WorkoutMessage
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a WorkoutStartedEvent. */
                interface IWorkoutStartedEvent {
                }

                /** Represents a WorkoutStartedEvent. */
                class WorkoutStartedEvent implements IWorkoutStartedEvent {

                    /**
                     * Constructs a new WorkoutStartedEvent.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent);

                    /**
                     * Creates a new WorkoutStartedEvent instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns WorkoutStartedEvent instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent): LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent;

                    /**
                     * Encodes the specified WorkoutStartedEvent message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent.verify|verify} messages.
                     * @param message WorkoutStartedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified WorkoutStartedEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent.verify|verify} messages.
                     * @param message WorkoutStartedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutStartedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a WorkoutStartedEvent message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns WorkoutStartedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent;

                    /**
                     * Decodes a WorkoutStartedEvent message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns WorkoutStartedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent;

                    /**
                     * Verifies a WorkoutStartedEvent message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a WorkoutStartedEvent message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns WorkoutStartedEvent
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent;

                    /**
                     * Creates a plain object from a WorkoutStartedEvent message. Also converts values to other types if specified.
                     * @param message WorkoutStartedEvent
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.WorkoutStartedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this WorkoutStartedEvent to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for WorkoutStartedEvent
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a WorkoutUpdatedEvent. */
                interface IWorkoutUpdatedEvent {

                    /** WorkoutUpdatedEvent workout */
                    workout?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                    /** WorkoutUpdatedEvent currentExercise */
                    currentExercise?: (LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2|null);

                    /** WorkoutUpdatedEvent restTimerInfo */
                    restTimerInfo?: (LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo|null);

                    /** WorkoutUpdatedEvent cardioTimerInfo */
                    cardioTimerInfo?: (LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo|null);

                    /** WorkoutUpdatedEvent totalWeightLifted */
                    totalWeightLifted?: (LiftLog.Ui.Models.IWeight|null);

                    /** WorkoutUpdatedEvent workoutDuration */
                    workoutDuration?: (google.protobuf.IDuration|null);
                }

                /** Represents a WorkoutUpdatedEvent. */
                class WorkoutUpdatedEvent implements IWorkoutUpdatedEvent {

                    /**
                     * Constructs a new WorkoutUpdatedEvent.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent);

                    /** WorkoutUpdatedEvent workout. */
                    public workout?: (LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2|null);

                    /** WorkoutUpdatedEvent currentExercise. */
                    public currentExercise?: (LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2|null);

                    /** WorkoutUpdatedEvent restTimerInfo. */
                    public restTimerInfo?: (LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo|null);

                    /** WorkoutUpdatedEvent cardioTimerInfo. */
                    public cardioTimerInfo?: (LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo|null);

                    /** WorkoutUpdatedEvent totalWeightLifted. */
                    public totalWeightLifted?: (LiftLog.Ui.Models.IWeight|null);

                    /** WorkoutUpdatedEvent workoutDuration. */
                    public workoutDuration?: (google.protobuf.IDuration|null);

                    /** WorkoutUpdatedEvent _currentExercise. */
                    public _currentExercise?: "currentExercise";

                    /** WorkoutUpdatedEvent _restTimerInfo. */
                    public _restTimerInfo?: "restTimerInfo";

                    /** WorkoutUpdatedEvent _cardioTimerInfo. */
                    public _cardioTimerInfo?: "cardioTimerInfo";

                    /**
                     * Creates a new WorkoutUpdatedEvent instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns WorkoutUpdatedEvent instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent): LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent;

                    /**
                     * Encodes the specified WorkoutUpdatedEvent message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent.verify|verify} messages.
                     * @param message WorkoutUpdatedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified WorkoutUpdatedEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent.verify|verify} messages.
                     * @param message WorkoutUpdatedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutUpdatedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a WorkoutUpdatedEvent message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns WorkoutUpdatedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent;

                    /**
                     * Decodes a WorkoutUpdatedEvent message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns WorkoutUpdatedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent;

                    /**
                     * Verifies a WorkoutUpdatedEvent message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a WorkoutUpdatedEvent message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns WorkoutUpdatedEvent
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent;

                    /**
                     * Creates a plain object from a WorkoutUpdatedEvent message. Also converts values to other types if specified.
                     * @param message WorkoutUpdatedEvent
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.WorkoutUpdatedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this WorkoutUpdatedEvent to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for WorkoutUpdatedEvent
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a WorkoutEndedEvent. */
                interface IWorkoutEndedEvent {
                }

                /** Represents a WorkoutEndedEvent. */
                class WorkoutEndedEvent implements IWorkoutEndedEvent {

                    /**
                     * Constructs a new WorkoutEndedEvent.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent);

                    /**
                     * Creates a new WorkoutEndedEvent instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns WorkoutEndedEvent instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent): LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent;

                    /**
                     * Encodes the specified WorkoutEndedEvent message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent.verify|verify} messages.
                     * @param message WorkoutEndedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified WorkoutEndedEvent message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent.verify|verify} messages.
                     * @param message WorkoutEndedEvent message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IWorkoutEndedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a WorkoutEndedEvent message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns WorkoutEndedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent;

                    /**
                     * Decodes a WorkoutEndedEvent message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns WorkoutEndedEvent
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent;

                    /**
                     * Verifies a WorkoutEndedEvent message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a WorkoutEndedEvent message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns WorkoutEndedEvent
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent;

                    /**
                     * Creates a plain object from a WorkoutEndedEvent message. Also converts values to other types if specified.
                     * @param message WorkoutEndedEvent
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.WorkoutEndedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this WorkoutEndedEvent to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for WorkoutEndedEvent
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a FinishWorkoutCommand. */
                interface IFinishWorkoutCommand {
                }

                /** Represents a FinishWorkoutCommand. */
                class FinishWorkoutCommand implements IFinishWorkoutCommand {

                    /**
                     * Constructs a new FinishWorkoutCommand.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand);

                    /**
                     * Creates a new FinishWorkoutCommand instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns FinishWorkoutCommand instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand): LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand;

                    /**
                     * Encodes the specified FinishWorkoutCommand message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand.verify|verify} messages.
                     * @param message FinishWorkoutCommand message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified FinishWorkoutCommand message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand.verify|verify} messages.
                     * @param message FinishWorkoutCommand message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IFinishWorkoutCommand, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a FinishWorkoutCommand message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns FinishWorkoutCommand
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand;

                    /**
                     * Decodes a FinishWorkoutCommand message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns FinishWorkoutCommand
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand;

                    /**
                     * Verifies a FinishWorkoutCommand message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a FinishWorkoutCommand message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns FinishWorkoutCommand
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand;

                    /**
                     * Creates a plain object from a FinishWorkoutCommand message. Also converts values to other types if specified.
                     * @param message FinishWorkoutCommand
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.FinishWorkoutCommand, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this FinishWorkoutCommand to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for FinishWorkoutCommand
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RestTimerInfo. */
                interface IRestTimerInfo {

                    /** RestTimerInfo startedAt */
                    startedAt?: (google.protobuf.ITimestamp|null);

                    /** RestTimerInfo partiallyEndAt */
                    partiallyEndAt?: (google.protobuf.ITimestamp|null);

                    /** RestTimerInfo endAt */
                    endAt?: (google.protobuf.ITimestamp|null);
                }

                /** Represents a RestTimerInfo. */
                class RestTimerInfo implements IRestTimerInfo {

                    /**
                     * Constructs a new RestTimerInfo.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo);

                    /** RestTimerInfo startedAt. */
                    public startedAt?: (google.protobuf.ITimestamp|null);

                    /** RestTimerInfo partiallyEndAt. */
                    public partiallyEndAt?: (google.protobuf.ITimestamp|null);

                    /** RestTimerInfo endAt. */
                    public endAt?: (google.protobuf.ITimestamp|null);

                    /**
                     * Creates a new RestTimerInfo instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RestTimerInfo instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo): LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo;

                    /**
                     * Encodes the specified RestTimerInfo message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo.verify|verify} messages.
                     * @param message RestTimerInfo message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RestTimerInfo message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo.verify|verify} messages.
                     * @param message RestTimerInfo message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IRestTimerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RestTimerInfo message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RestTimerInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo;

                    /**
                     * Decodes a RestTimerInfo message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RestTimerInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo;

                    /**
                     * Verifies a RestTimerInfo message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RestTimerInfo message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RestTimerInfo
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo;

                    /**
                     * Creates a plain object from a RestTimerInfo message. Also converts values to other types if specified.
                     * @param message RestTimerInfo
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.RestTimerInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RestTimerInfo to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RestTimerInfo
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CardioTimerInfo. */
                interface ICardioTimerInfo {

                    /** CardioTimerInfo currentDuration */
                    currentDuration?: (google.protobuf.IDuration|null);

                    /** CardioTimerInfo currentBlockStartTime */
                    currentBlockStartTime?: (google.protobuf.ITimestamp|null);
                }

                /** Represents a CardioTimerInfo. */
                class CardioTimerInfo implements ICardioTimerInfo {

                    /**
                     * Constructs a new CardioTimerInfo.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo);

                    /** CardioTimerInfo currentDuration. */
                    public currentDuration?: (google.protobuf.IDuration|null);

                    /** CardioTimerInfo currentBlockStartTime. */
                    public currentBlockStartTime?: (google.protobuf.ITimestamp|null);

                    /** CardioTimerInfo _currentBlockStartTime. */
                    public _currentBlockStartTime?: "currentBlockStartTime";

                    /**
                     * Creates a new CardioTimerInfo instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CardioTimerInfo instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo): LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo;

                    /**
                     * Encodes the specified CardioTimerInfo message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo.verify|verify} messages.
                     * @param message CardioTimerInfo message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CardioTimerInfo message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo.verify|verify} messages.
                     * @param message CardioTimerInfo message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.ICardioTimerInfo, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CardioTimerInfo message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CardioTimerInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo;

                    /**
                     * Decodes a CardioTimerInfo message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CardioTimerInfo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo;

                    /**
                     * Verifies a CardioTimerInfo message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CardioTimerInfo message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CardioTimerInfo
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo;

                    /**
                     * Creates a plain object from a CardioTimerInfo message. Also converts values to other types if specified.
                     * @param message CardioTimerInfo
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.CardioTimerInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CardioTimerInfo to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CardioTimerInfo
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a Translations. */
                interface ITranslations {

                    /** Translations workoutPersistentNotification_RestBreak_Message */
                    workoutPersistentNotification_RestBreak_Message?: (string|null);

                    /** Translations workoutPersistentNotification_StartSoon_Message */
                    workoutPersistentNotification_StartSoon_Message?: (string|null);

                    /** Translations workoutPersistentNotification_StartNow_Message */
                    workoutPersistentNotification_StartNow_Message?: (string|null);

                    /** Translations workoutPersistentNotification_MinRestOver_Message */
                    workoutPersistentNotification_MinRestOver_Message?: (string|null);

                    /** Translations workoutPersistentNotification_MaxRestOver_Message */
                    workoutPersistentNotification_MaxRestOver_Message?: (string|null);

                    /** Translations workoutPersistentNotification_CurrentExercise_Message */
                    workoutPersistentNotification_CurrentExercise_Message?: (string|null);

                    /** Translations workoutPersistentNotification_Finished_Message */
                    workoutPersistentNotification_Finished_Message?: (string|null);

                    /** Translations workoutPersistentNotification_InProgress_Message */
                    workoutPersistentNotification_InProgress_Message?: (string|null);

                    /** Translations workoutPersistentNotification_FinishWorkout_Action */
                    workoutPersistentNotification_FinishWorkout_Action?: (string|null);
                }

                /** Represents a Translations. */
                class Translations implements ITranslations {

                    /**
                     * Constructs a new Translations.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.ITranslations);

                    /** Translations workoutPersistentNotification_RestBreak_Message. */
                    public workoutPersistentNotification_RestBreak_Message: string;

                    /** Translations workoutPersistentNotification_StartSoon_Message. */
                    public workoutPersistentNotification_StartSoon_Message: string;

                    /** Translations workoutPersistentNotification_StartNow_Message. */
                    public workoutPersistentNotification_StartNow_Message: string;

                    /** Translations workoutPersistentNotification_MinRestOver_Message. */
                    public workoutPersistentNotification_MinRestOver_Message: string;

                    /** Translations workoutPersistentNotification_MaxRestOver_Message. */
                    public workoutPersistentNotification_MaxRestOver_Message: string;

                    /** Translations workoutPersistentNotification_CurrentExercise_Message. */
                    public workoutPersistentNotification_CurrentExercise_Message: string;

                    /** Translations workoutPersistentNotification_Finished_Message. */
                    public workoutPersistentNotification_Finished_Message: string;

                    /** Translations workoutPersistentNotification_InProgress_Message. */
                    public workoutPersistentNotification_InProgress_Message: string;

                    /** Translations workoutPersistentNotification_FinishWorkout_Action. */
                    public workoutPersistentNotification_FinishWorkout_Action: string;

                    /**
                     * Creates a new Translations instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Translations instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.ITranslations): LiftLog.Ui.Models.WorkoutMessage.Translations;

                    /**
                     * Encodes the specified Translations message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.Translations.verify|verify} messages.
                     * @param message Translations message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.ITranslations, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Translations message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.Translations.verify|verify} messages.
                     * @param message Translations message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.ITranslations, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Translations message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Translations
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.Translations;

                    /**
                     * Decodes a Translations message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Translations
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.Translations;

                    /**
                     * Verifies a Translations message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Translations message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Translations
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.Translations;

                    /**
                     * Creates a plain object from a Translations message. Also converts values to other types if specified.
                     * @param message Translations
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.Translations, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Translations to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Translations
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an AppConfiguration. */
                interface IAppConfiguration {

                    /** AppConfiguration notificationsEnabled */
                    notificationsEnabled?: (boolean|null);
                }

                /** Represents an AppConfiguration. */
                class AppConfiguration implements IAppConfiguration {

                    /**
                     * Constructs a new AppConfiguration.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration);

                    /** AppConfiguration notificationsEnabled. */
                    public notificationsEnabled: boolean;

                    /**
                     * Creates a new AppConfiguration instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns AppConfiguration instance
                     */
                    public static create(properties?: LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration): LiftLog.Ui.Models.WorkoutMessage.AppConfiguration;

                    /**
                     * Encodes the specified AppConfiguration message. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.AppConfiguration.verify|verify} messages.
                     * @param message AppConfiguration message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified AppConfiguration message, length delimited. Does not implicitly {@link LiftLog.Ui.Models.WorkoutMessage.AppConfiguration.verify|verify} messages.
                     * @param message AppConfiguration message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an AppConfiguration message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns AppConfiguration
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LiftLog.Ui.Models.WorkoutMessage.AppConfiguration;

                    /**
                     * Decodes an AppConfiguration message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns AppConfiguration
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LiftLog.Ui.Models.WorkoutMessage.AppConfiguration;

                    /**
                     * Verifies an AppConfiguration message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an AppConfiguration message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns AppConfiguration
                     */
                    public static fromObject(object: { [k: string]: any }): LiftLog.Ui.Models.WorkoutMessage.AppConfiguration;

                    /**
                     * Creates a plain object from an AppConfiguration message. Also converts values to other types if specified.
                     * @param message AppConfiguration
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: LiftLog.Ui.Models.WorkoutMessage.AppConfiguration, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this AppConfiguration to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for AppConfiguration
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Duration. */
        interface IDuration {

            /** Duration seconds */
            seconds?: (Long|null);

            /** Duration nanos */
            nanos?: (number|null);
        }

        /** Represents a Duration. */
        class Duration implements IDuration {

            /**
             * Constructs a new Duration.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDuration);

            /** Duration seconds. */
            public seconds: Long;

            /** Duration nanos. */
            public nanos: number;

            /**
             * Creates a new Duration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Duration instance
             */
            public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Duration;

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Duration;

            /**
             * Verifies a Duration message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Duration
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Duration;

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @param message Duration
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Duration, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Duration to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Duration
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DoubleValue. */
        interface IDoubleValue {

            /** DoubleValue value */
            value?: (number|null);
        }

        /** Represents a DoubleValue. */
        class DoubleValue implements IDoubleValue {

            /**
             * Constructs a new DoubleValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDoubleValue);

            /** DoubleValue value. */
            public value: number;

            /**
             * Creates a new DoubleValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DoubleValue instance
             */
            public static create(properties?: google.protobuf.IDoubleValue): google.protobuf.DoubleValue;

            /**
             * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @param message DoubleValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDoubleValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DoubleValue message, length delimited. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @param message DoubleValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDoubleValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DoubleValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DoubleValue;

            /**
             * Decodes a DoubleValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DoubleValue;

            /**
             * Verifies a DoubleValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DoubleValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DoubleValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.DoubleValue;

            /**
             * Creates a plain object from a DoubleValue message. Also converts values to other types if specified.
             * @param message DoubleValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.DoubleValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DoubleValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DoubleValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FloatValue. */
        interface IFloatValue {

            /** FloatValue value */
            value?: (number|null);
        }

        /** Represents a FloatValue. */
        class FloatValue implements IFloatValue {

            /**
             * Constructs a new FloatValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFloatValue);

            /** FloatValue value. */
            public value: number;

            /**
             * Creates a new FloatValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FloatValue instance
             */
            public static create(properties?: google.protobuf.IFloatValue): google.protobuf.FloatValue;

            /**
             * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @param message FloatValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFloatValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FloatValue message, length delimited. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @param message FloatValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFloatValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FloatValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FloatValue;

            /**
             * Decodes a FloatValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FloatValue;

            /**
             * Verifies a FloatValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FloatValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FloatValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FloatValue;

            /**
             * Creates a plain object from a FloatValue message. Also converts values to other types if specified.
             * @param message FloatValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FloatValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FloatValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FloatValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Int64Value. */
        interface IInt64Value {

            /** Int64Value value */
            value?: (Long|null);
        }

        /** Represents an Int64Value. */
        class Int64Value implements IInt64Value {

            /**
             * Constructs a new Int64Value.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IInt64Value);

            /** Int64Value value. */
            public value: Long;

            /**
             * Creates a new Int64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int64Value instance
             */
            public static create(properties?: google.protobuf.IInt64Value): google.protobuf.Int64Value;

            /**
             * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @param message Int64Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IInt64Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Int64Value message, length delimited. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @param message Int64Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IInt64Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int64Value message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Int64Value;

            /**
             * Decodes an Int64Value message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Int64Value;

            /**
             * Verifies an Int64Value message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Int64Value message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Int64Value
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Int64Value;

            /**
             * Creates a plain object from an Int64Value message. Also converts values to other types if specified.
             * @param message Int64Value
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Int64Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Int64Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Int64Value
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a UInt64Value. */
        interface IUInt64Value {

            /** UInt64Value value */
            value?: (Long|null);
        }

        /** Represents a UInt64Value. */
        class UInt64Value implements IUInt64Value {

            /**
             * Constructs a new UInt64Value.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IUInt64Value);

            /** UInt64Value value. */
            public value: Long;

            /**
             * Creates a new UInt64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt64Value instance
             */
            public static create(properties?: google.protobuf.IUInt64Value): google.protobuf.UInt64Value;

            /**
             * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @param message UInt64Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IUInt64Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UInt64Value message, length delimited. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @param message UInt64Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IUInt64Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt64Value message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UInt64Value;

            /**
             * Decodes a UInt64Value message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UInt64Value;

            /**
             * Verifies a UInt64Value message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UInt64Value message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UInt64Value
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.UInt64Value;

            /**
             * Creates a plain object from a UInt64Value message. Also converts values to other types if specified.
             * @param message UInt64Value
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.UInt64Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UInt64Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UInt64Value
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Int32Value. */
        interface IInt32Value {

            /** Int32Value value */
            value?: (number|null);
        }

        /** Represents an Int32Value. */
        class Int32Value implements IInt32Value {

            /**
             * Constructs a new Int32Value.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IInt32Value);

            /** Int32Value value. */
            public value: number;

            /**
             * Creates a new Int32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int32Value instance
             */
            public static create(properties?: google.protobuf.IInt32Value): google.protobuf.Int32Value;

            /**
             * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @param message Int32Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IInt32Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Int32Value message, length delimited. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @param message Int32Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IInt32Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int32Value message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Int32Value;

            /**
             * Decodes an Int32Value message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Int32Value;

            /**
             * Verifies an Int32Value message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Int32Value message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Int32Value
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Int32Value;

            /**
             * Creates a plain object from an Int32Value message. Also converts values to other types if specified.
             * @param message Int32Value
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Int32Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Int32Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Int32Value
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a UInt32Value. */
        interface IUInt32Value {

            /** UInt32Value value */
            value?: (number|null);
        }

        /** Represents a UInt32Value. */
        class UInt32Value implements IUInt32Value {

            /**
             * Constructs a new UInt32Value.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IUInt32Value);

            /** UInt32Value value. */
            public value: number;

            /**
             * Creates a new UInt32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt32Value instance
             */
            public static create(properties?: google.protobuf.IUInt32Value): google.protobuf.UInt32Value;

            /**
             * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @param message UInt32Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IUInt32Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UInt32Value message, length delimited. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @param message UInt32Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IUInt32Value, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt32Value message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UInt32Value;

            /**
             * Decodes a UInt32Value message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UInt32Value;

            /**
             * Verifies a UInt32Value message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UInt32Value message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UInt32Value
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.UInt32Value;

            /**
             * Creates a plain object from a UInt32Value message. Also converts values to other types if specified.
             * @param message UInt32Value
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.UInt32Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UInt32Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UInt32Value
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a BoolValue. */
        interface IBoolValue {

            /** BoolValue value */
            value?: (boolean|null);
        }

        /** Represents a BoolValue. */
        class BoolValue implements IBoolValue {

            /**
             * Constructs a new BoolValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IBoolValue);

            /** BoolValue value. */
            public value: boolean;

            /**
             * Creates a new BoolValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BoolValue instance
             */
            public static create(properties?: google.protobuf.IBoolValue): google.protobuf.BoolValue;

            /**
             * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @param message BoolValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IBoolValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified BoolValue message, length delimited. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @param message BoolValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IBoolValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BoolValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.BoolValue;

            /**
             * Decodes a BoolValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.BoolValue;

            /**
             * Verifies a BoolValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a BoolValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns BoolValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.BoolValue;

            /**
             * Creates a plain object from a BoolValue message. Also converts values to other types if specified.
             * @param message BoolValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.BoolValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BoolValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for BoolValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a StringValue. */
        interface IStringValue {

            /** StringValue value */
            value?: (string|null);
        }

        /** Represents a StringValue. */
        class StringValue implements IStringValue {

            /**
             * Constructs a new StringValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IStringValue);

            /** StringValue value. */
            public value: string;

            /**
             * Creates a new StringValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StringValue instance
             */
            public static create(properties?: google.protobuf.IStringValue): google.protobuf.StringValue;

            /**
             * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @param message StringValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IStringValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified StringValue message, length delimited. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @param message StringValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IStringValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StringValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.StringValue;

            /**
             * Decodes a StringValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.StringValue;

            /**
             * Verifies a StringValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a StringValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns StringValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.StringValue;

            /**
             * Creates a plain object from a StringValue message. Also converts values to other types if specified.
             * @param message StringValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.StringValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this StringValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for StringValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a BytesValue. */
        interface IBytesValue {

            /** BytesValue value */
            value?: (Uint8Array|null);
        }

        /** Represents a BytesValue. */
        class BytesValue implements IBytesValue {

            /**
             * Constructs a new BytesValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IBytesValue);

            /** BytesValue value. */
            public value: Uint8Array;

            /**
             * Creates a new BytesValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BytesValue instance
             */
            public static create(properties?: google.protobuf.IBytesValue): google.protobuf.BytesValue;

            /**
             * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @param message BytesValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IBytesValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified BytesValue message, length delimited. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @param message BytesValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IBytesValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BytesValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.BytesValue;

            /**
             * Decodes a BytesValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.BytesValue;

            /**
             * Verifies a BytesValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a BytesValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns BytesValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.BytesValue;

            /**
             * Creates a plain object from a BytesValue message. Also converts values to other types if specified.
             * @param message BytesValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.BytesValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BytesValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for BytesValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: Long;

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
